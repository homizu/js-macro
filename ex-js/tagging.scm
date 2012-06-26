(define-syntax Program
  (syntax-rules (elements)
    ((_ (elements "")) (begin ""))
    ((_ (elements (e ...))) (begin e ...))))

;; (define-syntax StatementMacroDefinition
;;   (syntax-rules (macroName identifiers expression statements literals syntaxRules)
;;     ((_ 
;;       (macroName name)
;;       (identifiers ids)
;;       (expressions exprs)
;;       (statements stmts)
;;       (literals lits)
;;       (syntaxRules
;;        ((SyntaxRule
;;          (pattern (p ...))
;;          (template t)) ...)))
;;      (begin
;;        (Define-Syntax test
;;          (Syntax-Rules '()
;;            ((test p ...) t)
;;            ...))))
;; ))

;; (define-syntax StatementMacroDefinition
;;   (syntax-rules (macroName identifiers expression statements literals syntaxRules)
;; ))

;; Paren
(define-syntax Paren
  (syntax-rules (elements)
    ((_ (elements "")) ("JS" "paren"))
    ((_ (elements (e ...))) ("JS" "paren" e ...))))

;; Block
(define-syntax Block
  (syntax-rules (elements)
    ((_ (elements "")) ("JS" "block"))
    ((_ (elemetns (e ...))) ("JS" "block" e ...))))

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
    ((_) ("JS" "const" "null"))))

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

;; ArrayLiteral
;; ObjectLiteral
;; PropertyAssignment
;; GetterDefinition
;; SetterDefinition
;; NewOperator
;; PropertyAccess
;; FunctionCall
;; FunctionCallArguments
;; PropertyAccessProperty
;; PostfixExpression
;; UnaryExpression
;; BinaryExpression
;; ConditionalExpression
;; AssignmentExpression
;; Block
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
;; Program

;; ExpressionMacroDefinition
;; StatementMacroDefinition
;; SyntaxRule
;; Punctuator
;; Repetition
;; Block
;; Paren
;; Bracket
;; LiteralKeyword
;; IdentifierVariable
;; ExpressionVariable
;; StatementVariable
;; Character
;; Ellipsis

;; Number
;; Identifier
;; MacroName
;; MacroForm

