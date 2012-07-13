Template
 = StatementInTemplate
AssignmentExpression =
 form:(t0:("let2" { return { type: "MacroName", name:"let2"}; }) __ t1:((ellipsis:"..." { return { type: "Repeat", elements: [{ type: "Ellipsis" }] }; }) / (head:(t0:(name:IdentifierName { return { type: "Variable", name: name }; }) __ t1:("=" { return { type: "Punctuator", value: "=" }; }) __ t2:AssignmentExpression { return [t0, t1, t2]; }) tail:(__ "and" __ (t0:(name:IdentifierName { return { type: "Variable", name: name }; }) __ t1:("=" { return { type: "Punctuator", value: "=" }; }) __ t2:AssignmentExpression { return [t0, t1, t2]; }))* ellipsis:(__ "and" __"...")? !{ return !inTemplate && ellipsis; } { var elements = [head];   for (var i=0; i<tail.length; i++) {     elements.push(tail[i][3]);   }   if (ellipsis) elements.push({ type: "Ellipsis" });   return { type: "Repeat", elements: elements }; })?) __ t2:("{" __ t0:(t0:((ellipsis:"..." { return { type: "Repeat", elements: [{ type: "Ellipsis" }] }; }) / (head:Statement tail:(__ Statement)* ellipsis:(__"...")? !{ return !inTemplate && ellipsis; } { var elements = [head];   for (var i=0; i<tail.length; i++) {     elements.push(tail[i][1]);   }   if (ellipsis) elements.push({ type: "Ellipsis" });   return { type: "Repeat", elements: elements }; })?) { return [t0]; }) __ "}" { return { type: "Brace", elements: t0 }; }) { return [t0, t1, t2]; }) { return { type: "MacroForm", inputForm: form }; }
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
 = 
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
