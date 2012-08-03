(define variables '()) ;; 変数を保存するためのリスト

;; variablesに変数nameを追加
(define (add-variables name) 
  (if (not (member name variables)) (set! variables (cons name variables))))

;; variablesからunnecessariesを除いたリストの要素に対しdefine式を生成
(define (get-defines unnecessaries)
  (reverse (map (lambda (v) `(define ,v (quote ())))
                (fold-right (lambda (e l)
                              (if (member e unnecessaries) l (cons e l))) '() variables))))

;; var宣言している変数と関数定義の関数名を探し、変数リストに追加
(define (search-variables e)
  (if (and (list? e)
           (not (null? e)))
      (let ((head (car e)))
        (cond ((and (string? head)
                    (string=? head "JS"))
               (let ((type (cadr e)))
                 (cond ((string=? type "variable")
                        `("JS" "variable" ,@(map (lambda (v)
                                                   (let ((name (car v))
                                                         (value (cadr v)))
                                                     (add-variables name)
                                                     `(,name ,(search-variables value)))) (cddr e))))
                       ((string=? type "function")
                        (let ((name (caddr e)))
                          (if (not (eq? name #\nul))
                            (add-variables name))
                          `("JS" "function" ,name ,@(search-variables (cdddr e)))))
                       ((string=? type "forin")
                        (let ((iterator (caddr e)))
                          (if (and (list? iterator)
                                   (= (length iterator) 2)
                                   (symbol? (car iterator)))
                              (add-variables (car iterator)))
                          `("JS" "forin" ,@(search-variables (cddr e)))))
                       (else
                        `("JS" ,type ,@(search-variables (cddr e)))))))
              ((eq? head 'lambda)
               (insert-defines-in-lambda e))
              (else
               (map search-variables e))))
      e))

;; lambda式の本体の先頭にdefine式を挿入
(define (insert-defines-in-lambda e)
  (let* ((current-variables variables)
         (params (cadr e))
         (body (cddr e)))
    (set! variables '())
    (set! body (search-variables body))
    (set! body (append (get-defines params) body))
    (set! variables current-variables)
    `(lambda ,params ,@(if (null? body) `((quote ,body)) body))))

;; プログラムの先頭にdefine式を挿入
(define (insert-defines e)
  (let ((elements '()))
    (if (and (list? e)
             (not (null? e))
             (eq? (car e) 'begin))
        (set! elements (search-variables (cdr e)))
        (set! elements `(,(search-variables e))))
    `(begin ,@(get-defines '()) ,@elements)))        