#!/usr/bin/env racket

;; JSONを読み込み，JSタグ付きS式に変換するプログラム
;; 引数のtreeファイルが存在するフォルダと同じフォルダに以下の2ファイルを生成する．
;; - XXX-jsexpr.scm: JSONをracketで読み込んだときのjsexpr形式を出力したもの
;; - XXX-sform.scm : jsexpr形式の式をJSタグ付きS式に変換したもの

#lang racket/load
(require (planet dherman/json:4:=0))
(require racket/pretty)
(load "common.scm")

(define debug #t) ;; 結果を表示するかどうか
(define (open-output-port output)
  (open-output-file output #:exists 'truncate/replace))

;; JSONをJSタグ付きS式に変換
(define (convert-json tree-file-path) ;; 引数のファイル名は .tree で終わる
  (let* ((in (open-input-file tree-file-path))
         (jsexpr (read-json in))
         (sform (racket-jsexpr->sexp jsexpr)))
    (write-file (change-suffix tree-file-path "-jsexpr.scm") jsexpr pretty-write)
    (write-file (change-suffix tree-file-path "-sform.scm") sform pretty-write)
    (close-input-port in)))

;; 変数を表す文字列に接頭辞，接尾辞を付けてシンボルに変換．リストの場合は各要素に同じ変換を行う．
(define (racket-variable->symbol hash key prefix suffix)
  (let ((value (hash-ref hash key)))
    (if (list? value)
        (map (lambda (e)
               (if (string? e) (string->symbol (string-append prefix e suffix)) `...))
             value)
        (string->symbol (string-append prefix value suffix)))))

;; keyに対応するハッシュ表の値をS式に変換
(define (racket-hash-value->sexp hash key)
  (racket-jsexpr->sexp (hash-ref hash key)))

;; ハッシュ表をJSタグ付きS式を表すリストに変換
(define (racket-hash->plist type hash)
  (case type
    ((ExpressionMacroDefinition StatementMacroDefinition) ;; MacroDefinition
     (let* ((macro-name (racket-variable->symbol hash 'macroName "" "-Macro"))
            (literals (racket-variable->symbol hash 'literals "LK-" ""))
            (rules (racket-hash-value->sexp hash 'syntaxRules)))
       `(define-syntax ,macro-name
          (syntax-rules ,literals ,@rules))))
    ((SyntaxRule) ;; SyntaxRule
    `((_ ,@(racket-hash-value->sexp hash 'pattern)) ,(racket-hash-value->sexp hash 'template)))
    ((RepBlock Brace Paren Bracket) ;; RepBlock, Brace, Paren, Bracket
     `("JS" ,(string-downcase (symbol->string type)) ,@(racket-hash-value->sexp hash 'elements)))
    ((MacroName) ;; MacroName
     (racket-variable->symbol hash 'name "" "-Macro"))
    ((MacroForm) ;; MacroForm
     (racket-hash-value->sexp hash 'inputForm))
    ((Variable IdentifierVariable ExpressionVariable StatementVariable) ;; Variable, IdentifierVariable, ExpressionVariable, StatementVariable
     (racket-variable->symbol hash 'name "V-" ""))
    ((LiteralKeyword) ;; LiteralKeyword
     (racket-variable->symbol hash 'name "LK-" ""))
    ((Repetition) ;; Repetition (in pattern of MacroDefinition)
     (racket-hash-value->sexp hash 'elements))
    ((Repeat) ;; Repeat (in MacroForm)
     (list->vector (hash-ref hash 'elements)))
    ((Ellipsis) ;; Ellipsis
     `...)
    ((PunctuationMark) ;; PunctuationMark
     'ignore)
    ((Punctuator) ;; Punctuator
     (hash-ref hash 'value))
    ((Expressions) ;; Expressions (AssignmentExpression, AssignmentExpression, ...)
     `("JS" "expressions" ,@(racket-hash-value->sexp hash 'elements)))
    ((Statements) ;; Statements (StatementVariable StatementVariable ...)
     `(begin ,@(racket-variable->symbol hash 'elements "V-" ""))) 
    ((NumericLiteral) ;; NumericLiteral
     `("JS" "number" ,(hash-ref hash 'value)))
    ((StringLiteral) ;; StringLiteral
     `("JS" "string" ,(hash-ref hash 'value)))
    ((NullLiteral) ;; NullLiteral
     `("JS" "const" "null"))
    ((BooleanLiteral RegularExpressionLiteral) ;; BooleanLiteral, RegularExpressionLiteral
     `("JS" "const" ,(hash-ref hash 'value)))
    ((This) ;; This
     `("JS" "const" "this"))
    ((ArrayLiteral) ;; ArrayLiteral
     `("JS" "array" ,@(racket-hash-value->sexp hash 'elements)))
    ((ObjectLiteral) ;; ObjectLiteral
     `("JS" "object" ,@(racket-hash-value->sexp hash 'properties)))
    ((PropertyAssignment) ;; PropertyAssignment
     `("JS" "propAssign" ,(racket-hash-value->sexp hash 'name) ,(racket-hash-value->sexp hash 'value)))
    ((GetterDefinition) ;; GetterDefinition
     `("JS" "getter" ,(racket-hash-value->sexp hash 'name) ,@(racket-hash-value->sexp hash 'body)))
    ((SetterDefinition) ;; SetterDefinition
     `("JS" "setter" ,(racket-hash-value->sexp hash 'name) ,(racket-hash-value->sexp hash 'param) ,@(racket-hash-value->sexp hash 'body)))
    ((NewOperator) ;; NewOperator
     `("JS" "new" ,(racket-hash-value->sexp hash 'constructor) ,@(racket-hash-value->sexp hash 'arguments)))
    ((PropertyAccess) ;; PropertyAccess
     `("JS" "propAccess" ,(racket-hash-value->sexp hash 'base) ,(racket-hash-value->sexp hash 'name)))
    ((FunctionCall) ;; FunctionCall
     (let* ((name (racket-hash-value->sexp hash 'name))
            (arguments (racket-hash-value->sexp hash 'arguments)))
       `("JS" "funcCall" ,name ,@arguments)))
    ((PostfixExpression UnaryExpression) ;; PostfixExpression, UnaryExpression
     `("JS" ,(string-downcase (first (regexp-split #rx"Expression" (symbol->string type)))) ,(hash-ref hash 'operator) ,(racket-hash-value->sexp hash 'expression)))
    ((BinaryExpression AssignmentExpression) ;; BinayExpression, AssignmentExpression
     `("JS" ,(string-downcase (first (regexp-split #rx"Expression" (symbol->string type)))) ,(hash-ref hash 'operator) ,(racket-hash-value->sexp hash 'left) ,(racket-hash-value->sexp hash 'right)))
    ((ConditionalExpression) ;; ConditionalExpression
     `("JS" "conditional" ,(racket-hash-value->sexp hash 'condition) ,(racket-hash-value->sexp hash 'trueExpression) ,(racket-hash-value->sexp hash 'falseExpression)))
    ((Block) ;; Block
     `("JS" "block" ,@(racket-hash-value->sexp hash 'statements)))
    ((VariableStatement) ;; VariableStatement
     `("JS" "variable" ,@(racket-hash-value->sexp hash 'declarations)))
    ;;         `(begin ,@(racket-hash-value->sexp hash 'declarations)))
    ((VariableDeclaration) ;; VariableDecralation
     `(,(racket-variable->symbol hash 'name "V-" "") ,(racket-hash-value->sexp hash 'value)))
    ;;         `(define ,(racket-variable->symbol hash 'name "V-" "") ,(racket-hash-value->sexp hash 'value)))
    ((EmptyStatement) ;; EmptyStatement
     `("JS" "empty"))
    ((IfStatement) ;; IfStatement
     `("JS" "if" ,(racket-hash-value->sexp hash 'condition) ,(racket-hash-value->sexp hash 'ifStatement) ,(racket-hash-value->sexp hash 'elseStatement)))
    ((DoWhileStatement WhileStatement) ;; DoWhileStatement, WhileStatement
     `("JS" ,(string-downcase (first (regexp-split #rx"Statement" (symbol->string type)))) ,(racket-hash-value->sexp hash 'condition) ,(racket-hash-value->sexp hash 'statement)))
    ((ForStatement) ;; ForStatement
     `("JS" "for" ,(racket-hash-value->sexp hash 'initializer) ,(racket-hash-value->sexp hash 'test) ,(racket-hash-value->sexp hash 'counter) ,(racket-hash-value->sexp hash 'statement)))
    ((ForInStatement) ;; ForInStatement
     `("JS" "forin" ,(racket-hash-value->sexp hash 'iterator) ,(racket-hash-value->sexp hash 'collection) ,(racket-hash-value->sexp hash 'statement)))
    ((ContinueStatement BreakStatement) ;; ContinueStatement, BreakStatement
     `("JS" ,(string-downcase (first (regexp-split #rx"Statement" (symbol->string type)))) ,(hash-ref hash 'label)))
    ((ReturnStatement) ;; ReturnStatement
     `("JS" "return" ,(racket-hash-value->sexp hash 'value)))
    ((WithStatement) ;; WithStatement
     `("JS" "with" ,(racket-hash-value->sexp hash 'environment) ,(racket-hash-value->sexp hash 'statement)))
    ((SwitchStatement) ;; SwitchStatement
     `("JS" "switch" ,(racket-hash-value->sexp hash 'expression) ,@(racket-hash-value->sexp hash 'clauses)))
    ((CaseClause) ;; CaseClause
     `("JS" "case" ,(racket-hash-value->sexp hash 'selector) ,@(racket-hash-value->sexp hash 'statements)))
    ((DefaultClause) ;; DefaultClause
     `("JS" "default" ,@(racket-hash-value->sexp hash 'statements)))
    ((LabelledStatement) ;; LabelledStatement
     `("JS" "labelled" ,(hash-ref hash 'label) ,(racket-hash-value->sexp hash 'statement)))
    ((ThrowStatement) ;; ThrowStatement
     `("JS" "throw" ,(racket-hash-value->sexp hash 'exception)))
    ((TryStatement) ;; TryStatement
     (let* ((block (racket-hash-value->sexp hash 'block))
            (catch (hash-ref hash 'catch))
            (finally (hash-ref hash 'finally)))
       `("JS" "try" ,block
         ,(if (eq? catch #\nul) ;; Catch
              catch
              `(,(racket-variable->symbol catch 'identifier "V-" "") ,(racket-hash-value->sexp catch 'block)))
         ,(if (eq? finally #\nul) ;; Finally
              finally
              (racket-hash-value->sexp finally 'block)))))
    ((DebuggerStatement) ;; DebuggerStatement
     `("JS" "debugger"))
    ((Function) ;; Function
     (let* ((name (hash-ref hash 'name))
            (body (racket-hash-value->sexp hash 'elements))
            (params (racket-variable->symbol hash 'params "V-" "")))
       ;;           (if (eq? name #\nul)
       ;;               `(lambda ,params ,(if (eq? body '()) `(quote ,body) `(begin ,@body)))
       ;;               `(define (,name ,@params) ,(if (eq? body '()) `(quote ,body) `(begin ,@body))))))
       `("JS" "function" ,(if (eq? name #\nul) name (string->symbol (string-append "V-" name))) (lambda ,params ,(if (eq? body '()) `(quote ,body) `(begin ,@body))))))
    ((Program) ;; Program
     `(begin ,@(racket-hash-value->sexp hash 'elements)))
    (else
     (hash-map hash
               (lambda (key value)
                 (list key (racket-jsexpr->sexp value)))))))
  
;; jsexpr形式の式をS式に変換
(define (racket-jsexpr->sexp jsexpr)
  (cond ((hash? jsexpr) ;; hash table
         (let* ((type (string->symbol (hash-ref jsexpr 'type)))
                (rest (racket-hash->plist type (hash-remove jsexpr 'type))))
           rest))
        ((list? jsexpr) ;; list
         (let ((result '()))
           (for-each (lambda (e)
                       (let ((v (racket-jsexpr->sexp e)))
                         (cond ((vector? v) ;; Repeatのelements
                                (set! result (reverse (append (reverse result) (racket-jsexpr->sexp (vector->list v)))))) ;; 繰り返し部分がリストにならないように，リストの中身だけ取り出す
                               ((eq? v 'ignore) '())
                               (else (set! result (cons v result))))))
                     jsexpr)
           (reverse result)))
        (else ;; other
         jsexpr)))

(define (main args)
  (printf "Converting JSON ...~%")
  (let ((start (current-milliseconds)))
    (convert-json (vector-ref args 0))
    (printf "Done.~%Time: ~as.~%" (/ (- (current-milliseconds) start) 1000.0))))

(main (current-command-line-arguments))