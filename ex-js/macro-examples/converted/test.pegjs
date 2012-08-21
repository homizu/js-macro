Template
 = StatementInTemplate

CharacterStatement
 = &{}

MacroStatement
 = form:(t0:("test" { return { type: "MacroName", name:"test"}; }) __ t1:("(" __ t0:(t0:PatternIdentifier __ t1:("," { return { type: "PunctuationMark", value: "," }; }) __ t2:AssignmentExpression __ t3:("," { return { type: "PunctuationMark", value: "," }; }) __ t4:(PatternEllipsis
 / (head:AssignmentExpression tail:(__ "," __ AssignmentExpression)* ellipsis:(__ "," __"...")? !{ return !macroType && ellipsis; }
 { var elements = [head];
   for (var i=0; i<tail.length; i++) {
     elements.push(tail[i][3]);
   }
   if (ellipsis) elements.push({ type: "Ellipsis" });
   return { type: "Repeat", elements: elements }; })?)
 { return [t0, t1, t2, t3, t4]; }) __ ")" { return { type: "Paren", elements: t0 }; }) __ t2:("{" __ t0:(t0:(PatternEllipsis
 / (head:Statement tail:(__ Statement)* ellipsis:(__"...")? !{ return !macroType && ellipsis; }
 { var elements = [head];
   for (var i=0; i<tail.length; i++) {
     elements.push(tail[i][1]);
   }
   if (ellipsis) elements.push({ type: "Ellipsis" });
   return { type: "Repeat", elements: elements }; })?)
 { return [t0]; }) __ "}" { return { type: "Brace", elements: t0 }; }) { return [t0, t1, t2]; }) { return { type: "MacroForm", inputForm: form }; }

