Template
 = StatementInTemplate
AssignmentExpression =
 form:(t0:("or" { return { type: "MacroName", name:"or"}; }) __ t1:(t0:("(" __ t0:(t0:AssignmentExpression __ t1:(","{ return { type: "String", data: "," }; }) __ t2:(head:AssignmentExpression tail:(__ "," __ AssignmentExpression)* ellipsis:"..."? !{ return !inTemplate && ellipsis; } { var elements = [head]; for (var i=0; i<tail.length; i++) { elements.push(tail[i][3]); } if (ellipsis) elements.push({ type: "Ellipsis" });  return { type: "Repetition", elements: elements, punctuationMark: "," }; })? { return [t0, t1, t2]; }) __ ")" { return { type: "Paren", elements: t0 }; }) { return [t0]; }) { return [t0, t1]; }){ return { type: "orMacroForm", inputForm: form }; }
 / form:(t0:("or" { return { type: "MacroName", name:"or"}; }) __ t1:(t0:("(" __ t0:(t0:AssignmentExpression { return [t0]; }) __ ")" { return { type: "Paren", elements: t0 }; }) { return [t0]; }) { return [t0, t1]; }){ return { type: "orMacroForm", inputForm: form }; }
 / form:("or" { return { type: "MacroName", name:"or"}; }){ return { type: "orMacroForm", inputForm: form }; }
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
 = form:(t0:("let" { return { type: "MacroName", name:"let"}; }) __ t1:(t0:("(" __ t0:(t0:("var"{ return { type: "String", data: "var" }; }) __ t1:(head:(t0:(name:IdentifierName { return { type: "Identifier", name: name }; }) __ t1:("="{ return { type: "String", data: "=" }; }) __ t2:AssignmentExpression { return [t0, t1, t2]; }) tail:(__ "," __ (t0:(name:IdentifierName { return { type: "Identifier", name: name }; }) __ t1:("="{ return { type: "String", data: "=" }; }) __ t2:AssignmentExpression { return [t0, t1, t2]; }))* ellipsis:"..."? !{ return !inTemplate && ellipsis; } { var elements = [head]; for (var i=0; i<tail.length; i++) { elements.push(tail[i][3]); } if (ellipsis) elements.push({ type: "Ellipsis" });  return { type: "Repetition", elements: elements, punctuationMark: "," }; })? { return [t0, t1]; }) __ ")" { return { type: "Paren", elements: t0 }; }) __ t1:("{" __ t0:(t0:(head:Statement tail:(__ Statement)* ellipsis:"..."? !{ return !inTemplate && ellipsis; } { var elements = [head]; for (var i=0; i<tail.length; i++) { elements.push(tail[i][1]); } if (ellipsis) elements.push({ type: "Ellipsis" });  return { type: "Repetition", elements: elements, punctuationMark: "" }; })? { return [t0]; }) __ "}" { return { type: "Block", elements: t0 }; }) { return [t0, t1]; }) { return [t0, t1]; }){ return { type: "letMacroForm", inputForm: form }; }
 / form:(t0:("let" { return { type: "MacroName", name:"let"}; }) __ t1:(t0:("(" __ ")" { return { type: "Paren", elements: "" }; }) __ t1:("{" __ "}" { return { type: "Block", elements: "" }; }) { return [t0, t1]; }) { return [t0, t1]; }){ return { type: "letMacroForm", inputForm: form }; }
 / Block
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
