;; convert-json.scm と expand-scm.scm で共通の関数

;; ファイル名の最後を変更
(define (change-suffix file-path suffix)
  (regexp-replace "(\\.tree|-sform\\.scm)$" file-path suffix)) 

;; ファイル書き込み
(define (write-file file contents pretty-output)
  (if (not (null? file))
      (let ((out (open-output-port file)))
        (pretty-output contents out)
        (close-output-port out))
      '())
  (if debug
      (begin (pretty-output contents) (newline) (newline))
      '()))