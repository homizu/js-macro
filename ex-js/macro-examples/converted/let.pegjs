Template
 = StatementInTemplate
Statement
 = form:(t0:("let" { return { type: "MacroName", name:"let"}; }) __ t1:("(" __ ")" { return { type: "Paren", elements: [] }; }) __ t2:("{" __ "}" { return { type: "Brace", elements: [] }; }) { return [t0, t1, t2]; }) { return { type: "MacroForm", inputForm: form }; }
 / form:(t0:("let" { return { type: "MacroName", name:"let"}; }) __ t1:("(" __ t0:(t0:("var" { return { type: "LiteralKeyword", name: "var" }; }) __ t1:(head:(t0:(name:IdentifierName { return { type: "Variable", name: name }; }) __ t1:("=" { return { type: "Punctuator", value: "=" }; }) __ t2:AssignmentExpression { return [t0, t1, t2]; }) tail:(__ "and" __ (t0:(name:IdentifierName { return { type: "Variable", name: name }; }) __ t1:("=" { return { type: "Punctuator", value: "=" }; }) __ t2:AssignmentExpression { return [t0, t1, t2]; }))* ellipsis:"..."? !{ return !inTemplate && ellipsis; } { var elements = [head]; for (var i=0; i<tail.length; i++) { elements.push(tail[i][3]); } if (ellipsis) elements.push({ type: "Ellipsis" });  return { type: "Repetition", elements: elements, punctuationMark: "and" }; })? { return [t0, t1]; }) __ ")" { return { type: "Paren", elements: t0 }; }) __ t2:("{" __ t0:(t0:(head:(t0:Statement { return [t0]; }) tail:(__ (t0:Statement { return [t0]; }))* ellipsis:"..."? !{ return !inTemplate && ellipsis; } { var elements = [head]; for (var i=0; i<tail.length; i++) { elements.push(tail[i][1]); } if (ellipsis) elements.push({ type: "Ellipsis" });  return { type: "Repetition", elements: elements, punctuationMark: "" }; })? { return [t0]; }) __ "}" { return { type: "Brace", elements: t0 }; }) { return [t0, t1, t2]; }) { return { type: "MacroForm", inputForm: form }; }/
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
