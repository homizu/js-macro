Template
 = StatementInTemplate
AssignmentExpression =
 form:(t0:("let" { return { type: "MacroName", name:"let"}; }) __ t1:("(" __ t0:(t0:("var" { return { type: "LiteralKeyword", name: "var" }; }) __ t1:(name:IdentifierName { return { type: "Variable", name: name }; }) __ t2:("=" { return { type: "Punctuator", value: "=" }; }) __ t3:AssignmentExpression { return [t0, t1, t2, t3]; }) __ ")" { return { type: "Paren", elements: t0 }; }) __ t2:("{" __ t0:(t0:Statement { return [t0]; }) __ "}" { return { type: "Brace", elements: t0 }; }) { return [t0, t1, t2]; }) { return { type: "MacroForm", inputForm: form }; }
 / form:(t0:("test2" { return { type: "MacroName", name:"test2"}; }) __ t1:("(" __ t0:(t0:(name:IdentifierName { return { type: "Variable", name: name }; }) { return [t0]; }) __ ")" { return { type: "Paren", elements: t0 }; }) { return [t0, t1]; }) { return { type: "MacroForm", inputForm: form }; }
 / left:LeftHandSideExpression __
 operator:AssignmentOperator __
 right:AssignmentExpression {
   return {
     type:     "AssignmentExpression",
     operator: operator,
     left:     left,
     right:    right
   };
 }
 / ConditionalExpression
Statement
 = form:(t0:("test" { return { type: "MacroName", name:"test"}; }) __ t1:("(" __ t0:(t0:(name:IdentifierName { return { type: "Variable", name: name }; }) { return [t0]; }) __ ")" { return { type: "Paren", elements: t0 }; }) { return [t0, t1]; }) { return { type: "MacroForm", inputForm: form }; }/
   Block
 / VariableStatement
 / EmptyStatement
 / ExpressionStatement
 / IfStatement
 / IterationStatement
 / ContinueStatement
 / BreakStatement
 / ReturnStatement
 / WithStatement
 / LabelledStatement
 / SwitchStatement
 / ThrowStatement
 / TryStatement
 / DebuggerStatement
 / MacroDefinition
 / FunctionDeclaration
 / FunctionExpression
