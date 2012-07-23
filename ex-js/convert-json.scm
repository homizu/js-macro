#!/usr/local/bin/racket

;; JSONを読み込み，JSタグ付きS式に変換するプログラム
;; 引数のtreeファイルが存在するフォルダと同じフォルダに以下の2ファイルを生成する．
;; - XXX-jsexpr.scm: JSONをracketで読み込んだときのjsexpr形式を出力したもの
;; - XXX-sform.scm : jsexpr形式の式をJSタグ付きS式に変換したもの

#lang racket

(require (planet dherman/json:4:=0))
(require racket/pretty)

(define (convert-json js-file-path)
  (let* ((file-name (first (regexp-split #rx"\\.tree" js-file-path)))
         (in (open-input-file js-file-path))
         (out-jsexpr (open-output-file (string-append file-name "-jsexpr.scm") #:exists 'truncate/replace))
         (out-sform (open-output-file (string-append file-name "-sform.scm") #:exists 'truncate/replace))
         (jsexpr (read-json in))
         (sform (generalize-jsexpr jsexpr)))
    (pretty-display jsexpr)
    (pretty-write jsexpr out-jsexpr)
    (newline)
    (newline)
    (pretty-display sform)
    (newline)
    (newline)
    (pretty-write sform out-sform)
    (close-input-port in)
    (close-output-port out-jsexpr)
    (close-output-port out-sform)))

(define (generalize-variable hash key prefix suffix)
  (string->symbol (string-append prefix (hash-ref hash key) suffix)))

(define (generalize-variable-list hash key prefix suffix)
  (map (lambda (e) (if (string? e)
                       (string->symbol (string-append prefix e suffix))
                       `...)) (hash-ref hash key)))

(define (generalize-hash-value hash key)
  (generalize-jsexpr (hash-ref hash key)))

(define (generalize-hash type hash)
  (cond ((or (eq? type 'ExpressionMacroDefinition) ;; MacroDefinition
             (eq? type 'StatementMacroDefinition))
         (let* ((macro-name (generalize-variable hash 'macroName "" "-Macro"))
                (literals (generalize-variable-list hash 'literals "LK-" ""))
                (rules (generalize-hash-value hash 'syntaxRules)))
           `(define-syntax ,macro-name
              (syntax-rules ,literals ,@rules))))
        ((eq? type 'SyntaxRule) ;; SyntaxRule
         `((_ ,@(generalize-hash-value hash 'pattern)) ,(generalize-hash-value hash 'template)))
        ((or (eq? type 'RepBlock) ;; RepBlock
             (eq? type 'Brace) ;; Brace
             (eq? type 'Paren) ;; Paren
             (eq? type 'Bracket)) ;; Bracket
         `("JS" ,(string-downcase (symbol->string type)) ,@(generalize-hash-value hash 'elements)))
        ((eq? type 'MacroName) ;; MacroName
         (generalize-variable hash 'name "" "-Macro"))
        ((eq? type 'MacroForm) ;; MacroForm
         (generalize-hash-value hash 'inputForm))
        ((or (eq? type 'Variable) ;; Variable
             (eq? type 'IdentifierVariable) ;; IdentifierVariable
             (eq? type 'ExpressionVariable) ;; ExpressionVariable
             (eq? type 'StatementVariable)) ;; StatementVariable
         (generalize-variable hash 'name "V-" ""))
        ((eq? type 'LiteralKeyword) ;; LiteralKeyword
         (generalize-variable hash 'name "LK-" ""))
        ((eq? type 'Repetition) ;; Repetition (in pattern of MacroDefinition)
         (generalize-hash-value hash 'elements))
        ((eq? type 'Repeat) ;; Repeat (in MacroForm)
         (list->vector (hash-ref hash 'elements)))
        ((eq? type 'Ellipsis) ;; Ellipsis
         `...)
        ((eq? type 'PunctuationMark) ;; PunctuationMark
         'ignore)
        ((eq? type 'Punctuator) ;; Punctuator
         (hash-ref hash 'value))
        ((eq? type 'Expressions) ;; Expressions (AssignmentExpression, AssignmentExpression, ...)
         `("JS" "expressions" ,@(generalize-hash-value hash 'elements)))
        ((eq? type 'Statements) ;; Statements (StatementVariable StatementVariable ...)
         `(begin ,@(generalize-variable-list hash 'elements "V-" ""))) 
        ((eq? type 'NumericLiteral) ;; NumericLiteral
         `("JS" "number" ,(hash-ref hash 'value)))
        ((eq? type 'StringLiteral) ;; StringLiteral
         `("JS" "string" ,(hash-ref hash 'value)))
        ((eq? type 'NullLiteral) ;; NullLiteral
         `("JS" "const" "null"))
        ((or (eq? type 'BooleanLiteral) ;; BooleanLiteral
             (eq? type 'RegularExpressionLiteral)) ;; RegularExpressionLiteral
         `("JS" "const" ,(hash-ref hash 'value)))
        ((eq? type 'This) ;; This
         `("JS" "const" "this"))
        ((eq? type 'ArrayLiteral) ;; ArrayLiteral
         `("JS" "array" ,@(generalize-hash-value hash 'elements)))
        ((eq? type 'ObjectLiteral) ;; ObjectLiteral
         `("JS" "object" ,@(generalize-hash-value hash 'properties)))
        ((eq? type 'PropertyAssignment) ;; PropertyAssignment
         `("JS" "propAssign" ,(generalize-hash-value hash 'name) ,(generalize-hash-value hash 'value)))
        ((eq? type 'GetterDefinition) ;; GetterDefinition
         `("JS" "getter" ,(generalize-hash-value hash 'name) ,@(generalize-hash-value hash 'body)))
        ((eq? type 'SetterDefinition) ;; SetterDefinition
         `("JS" "setter" ,(generalize-hash-value hash 'name) ,(generalize-hash-value hash 'param) ,@(generalize-hash-value hash 'body)))
        ((eq? type 'NewOperator) ;; NewOperator
         `("JS" "new" ,(generalize-hash-value hash 'constructor) ,@(generalize-hash-value hash 'arguments)))
        ((eq? type 'PropertyAccess) ;; PropertyAccess
         `("JS" "propAccess" ,(generalize-hash-value hash 'base) ,(generalize-hash-value hash 'name)))
        ((eq? type 'FunctionCall) ;; FunctionCall
         (let* ((name (generalize-hash-value hash 'name))
                (arguments (generalize-hash-value hash 'arguments)))
           `("JS" "funcCall" ,name ,@arguments)))
;;        ((eq? type 'FunctionCallArguments) ;; FunctionCallArguments 補助タイプ
;;         `())
;;        ((eq? type 'PropertyAccessProperty) ;; PropertyAccessProperty
;;         `("JS" "propAccessProp" ,(generalize-hash-value hash 'name)))
        ((or (eq? type 'PostfixExpression) ;; PostfixExpression
             (eq? type 'UnaryExpression)) ;; UnaryExpression
         `("JS" ,(string-downcase (first (regexp-split #rx"Expression" (symbol->string type)))) ,(hash-ref hash 'operator) ,(generalize-hash-value hash 'expression)))
        ((or (eq? type 'BinaryExpression) ;; BinayExpression
             (eq? type 'AssignmentExpression)) ;; AssignmentExpression
         `("JS" ,(string-downcase (first (regexp-split #rx"Expression" (symbol->string type)))) ,(hash-ref hash 'operator) ,(generalize-hash-value hash 'left) ,(generalize-hash-value hash 'right)))
        ((eq? type 'ConditionalExpression) ;; ConditionalExpression
         `("JS" "conditional" ,(generalize-hash-value hash 'condition) ,(generalize-hash-value hash 'trueExpression) ,(generalize-hash-value hash 'falseExpression)))
        ((eq? type 'Block) ;; Block
         `("JS" "block" ,@(generalize-hash-value hash 'statements)))
        ((eq? type 'VariableStatement) ;; VariableStatement
         `("JS" "variable" ,@(generalize-hash-value hash 'declarations)))
;;         `(begin ,@(generalize-hash-value hash 'declarations)))
        ((eq? type 'VariableDeclaration) ;; VariableDecralation
         `(,(generalize-variable hash 'name "V-" "") ,(generalize-hash-value hash 'value)))
;;         `(define ,(generalize-variable hash 'name "V-" "") ,(generalize-hash-value hash 'value)))
        ((eq? type 'EmptyStatement) ;; EmptyStatement
         `("JS" "empty"))
        ((eq? type 'IfStatement) ;; IfStatement
         `("JS" "if" ,(generalize-hash-value hash 'condition) ,(generalize-hash-value hash 'ifStatement) ,(generalize-hash-value hash 'elseStatement)))
        ((or (eq? type 'DoWhileStatement) ;; DoWhileStatement
             (eq? type 'WhileStatement)) ;; WhileStatement
         `("JS" ,(string-downcase (first (regexp-split #rx"Statement" (symbol->string type)))) ,(generalize-hash-value hash 'condition) ,(generalize-hash-value hash 'statement)))
        ((eq? type 'ForStatement) ;; ForStatement
         `("JS" "for" ,(generalize-hash-value hash 'initializer) ,(generalize-hash-value hash 'test) ,(generalize-hash-value hash 'counter) ,(generalize-hash-value hash 'statement)))
        ((eq? type 'ForInStatement) ;; ForInStatement
         `("JS" "forin" ,(generalize-hash-value hash 'iterator) ,(generalize-hash-value hash 'collection) ,(generalize-hash-value hash 'statement)))
        ((or (eq? type 'ContinueStatement) ;; ContinueStatement
             (eq? type 'BreakStatement)) ;; BreakStatement
         `("JS" ,(string-downcase (first (regexp-split #rx"Statement" (symbol->string type)))) ,(hash-ref hash 'label)))
        ((eq? type 'ReturnStatement) ;; ReturnStatement
         `("JS" "return" ,(generalize-hash-value hash 'value)))
        ((eq? type 'WithStatement) ;; WithStatement
         `("JS" "with" ,(generalize-hash-value hash 'environment) ,(generalize-hash-value hash 'statement)))
        ((eq? type 'SwitchStatement) ;; SwitchStatement
         `("JS" "switch" ,(generalize-hash-value hash 'expression) ,@(generalize-hash-value hash 'clauses)))
        ((eq? type 'CaseClause) ;; CaseClause
         `("JS" "case" ,(generalize-hash-value hash 'selector) ,@(generalize-hash-value hash 'statements)))
        ((eq? type 'DefaultClause) ;; DefaultClause
         `("JS" "default" ,@(generalize-hash-value hash 'statements)))
        ((eq? type 'LabelledStatement) ;; LabelledStatement
         `("JS" "labelled" ,(hash-ref hash 'label) ,(generalize-hash-value hash 'statement)))
        ((eq? type 'ThrowStatement) ;; ThrowStatement
         `("JS" "throw" ,(generalize-hash-value hash 'exception)))
        ((eq? type 'TryStatement) ;; TryStatement
         (let* ((block (generalize-hash-value hash 'block))
                (catch (hash-ref hash 'catch))
                (finally (hash-ref hash 'finally)))
         `("JS" "try" ,block
           ,(if (eq? catch #\nul) ;; Catch
                catch
                `(,(generalize-variable catch 'identifier "V-" "") ,(generalize-hash-value catch 'block)))
           ,(if (eq? finally #\nul) ;; Finally
                finally
                (generalize-hash-value finally 'block)))))
        ((eq? type 'DebuggerStatement) ;; DebuggerStatement
         `("JS" "debugger"))
        ((eq? type 'Function) ;; Function
         (let* ((name (hash-ref hash 'name))
                (body (generalize-hash-value hash 'elements))
                (params (generalize-variable-list hash 'params "V-" "")))
;;           (if (eq? name #\nul)
;;               `(lambda ,params ,(if (eq? body '()) `(quote ,body) `(begin ,@body)))
;;               `(define (,name ,@params) ,(if (eq? body '()) `(quote ,body) `(begin ,@body))))))
           `("JS" "function" ,(if (eq? name #\nul) name (string->symbol (string-append "V-" name))) (lambda ,params ,(if (eq? body '()) `(quote ,body) `(begin ,@body))))))
        ((eq? type 'Program) ;; Program
         `(begin ,@(generalize-hash-value hash 'elements)))
        (#t
         (hash-map hash
                   (lambda (key value)
                     (list key (generalize-jsexpr value)))))))

(define (generalize-jsexpr jsexpr)
  (cond ((hash? jsexpr) ;; hash table
         (let* ((type (string->symbol (hash-ref jsexpr 'type)))
                (rest (generalize-hash type (hash-remove jsexpr 'type))))
           rest))
        ((list? jsexpr) ;; list
         (let ((result '()))
           (for-each (lambda (e)
                       (let ((v (generalize-jsexpr e)))
                         (if (vector? v)
                             (set! result (reverse (append (reverse result) (generalize-jsexpr (vector->list v))))) ;; 繰り返し部分がリストにならないように
                             (if (eq? v 'ignore) '() (set! result (cons v result))))))
                     jsexpr)
           (reverse result)))
        (#t ;; other
         jsexpr)))

(define (main args)
  (convert-json (vector-ref args 0)))

(main (current-command-line-arguments))