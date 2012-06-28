;; Program
(define-syntax Program
  (syntax-rules (elements)
    ((_ (elements "")) (begin ""))
    ((_ (elements (e ...))) (begin e ...))))

;; Paren
(define-syntax Paren
  (syntax-rules (elements)
;;    ((_ (elements "")) ("JS" "paren"))
    ((_ (elements (e ...))) ("JS" "paren" e ...))))

;; Block
(define-syntax Block
  (syntax-rules (elements)
;;    ((_ (elements "")) ("JS" "block"))
    ((_ (elemetns (e ...))) ("JS" "block" e ...))
    ((_ (statements (e ...))) ("JS" "block" e ...))))

;; LiteralKeyword
(define-syntax LiteralKeyword
  (syntax-rules (name)
    ((_ (name n)) n)))

;; IdentifierVariable
(define-syntax IdentifierVariable
  (syntax-rules (name)
    ((_ (name n)) n)))

;; ExpressionVariable
(define-syntax ExpressionVariable
  (syntax-rules (name)
    ((_ (name n)) n)))

;; StatementVariable
(define-syntax StatementVariable
  (syntax-rules (name)
    ((_ (name n)) n)))

;; NumericLiteral
(define-syntax NumericLiteral
  (syntax-rules (value)
    ((_ (value v)) ("JS" "number" v))))

;; StringLiteral
(define-syntax StringLiteral
  (syntax-rules (value)
    ((_ (value v)) ("JS" "const" v)))) 

;; NullLiteral
(define-syntax NullLiteral
  (syntax-rules ()
    ((_) ("JS" "const" null))))

;; BooleanLiteral
(define-syntax BooleanLiteral
  (syntax-rules (value)
    ((_ (value #t)) ("JS" "const" true))
    ((_ (value #f)) ("JS" "const" false))))

;; RegularExpressionLiteral
(define-syntax RegularExpressionLiteral
  (syntax-rules (value body flags)
    ((_ (body b) (flags f)) ("JS" "const" (string-append "/" b "/" f)))))

;; This
(define-syntax This
  (syntax-rules ()
    ((_) ("JS" "const" "this"))))

;; Variable
(define-syntax Variable
  (syntax-rules ()
    ((_ (name n)) n)))

;; ArrayLiteral
(define-syntax ArrayLiteral
  (syntax-rules (elements)
    ((_ (elements (e ...))) ("JS" "array" e ...))))
    
;; ObjectLiteral
(define-syntax ObjectLiteral
  (syntax-rules ()
    ((_ e ...) ("JS" "object" e ...))))
;; PropertyAssignment
;; GetterDefinition
;; SetterDefinition
;; NewOperator
;; PropertyAccess

;; FunctionCall
(define-syntax FunctionCall
  (syntax-rules (arguments name)
    ((_ (arguments (arg ...)) (name n)) ("JS" "application" n arg ...))))

;; FunctionCallArguments
;; PropertyAccessProperty
;; PostfixExpression

;; UnaryExpression
(define-syntax UnaryExpression
  (syntax-rules (operator expression)
    ((_ (operator op) (expression e))
     ("JS" "op1" e))))

;; BinaryExpression
(define-syntax BinaryExpression
  (syntax-rules (operator left right)
    ((_ (operator op) (left l) (right r))
     ("JS" "op2" op l r))))

;; ConditionalExpression
(define-syntax ConditionalExpression
  (syntax-rules (condition trueExpression falseExpression)
    ((_ (condition c) (trueExpression t) (falseExpression f))
     ("JS" "op3" "?" c t f))))

;; AssignmentExpression
;;;; Block
;; VariableStatement
;; VariableDeclaration
;; EmptyStatement
;; IfStatement
;; DoWhileStatement
;; WhileStatement
;; ForStatement
;; ForInStatement
;; ContinueStatement
;; BreakStatement
;; ReturnStatement
;; WithStatement
;; SwitchStatement
;; CaseClause
;; DefaultClause
;; LabelledStatement
;; ThrowStatement
;; TryStatement
;; Catch
;; Finally
;; DebuggerStatement
;; Function
(define-syntax Function
  (syntax-rules (name elements params)
    ((_ (name #\nul) (elements (e ...)) (params (p ...)))
     (lambda (p ...) (e ...)))
    ((_ (name n) (elements (e ...)) (params (p ...)))
     ("JS" "function" n e ... p ...))))

;;;; Program

;;;; ExpressionMacroDefinition
;;;; StatementMacroDefinition
;;;; SyntaxRule

;; Punctuator
(define-syntax Punctuator
  (syntax-rules (value)
    ((_ (value v)) v)))

;; Repetition
;;(define ellipsis '...)
(define-syntax Repetition
  (syntax-rules (elements punctuationMark)
    ((_ (elements (e ...)) (punctuationMark mark))
     ((e mark) ...))))

;;;; Block
;;;; Paren
;;;; Bracket
;;;; LiteralKeyword
;;;; IdentifierVariable
;;;; ExpressionVariable
;;;; StatementVariable


;; Ellipsis

;; MacroName
(define-syntax MacroName
  (syntax-rules ()
    ((_ (name n)) n)))

;; MacroForm
(define-syntax MacroForm
  (syntax-rules ()
    ((_ (inputForm (name (form ...)))) (name form ...))))


