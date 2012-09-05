Template
 = StatementInTemplate

CharacterStatement
 = &{}

MacroExpression
 = form:(t0:("my_display" { return { type: "MacroName", name:"my_display"}; }) { return [t0]; }) { return { type: "MacroForm", inputForm: form }; }

MacroStatement
 = form:(t0:("some_macro" { return { type: "MacroName", name:"some_macro"}; }) __ t1:("(" __ t0:(t0:PatternIdentifier { return [t0]; }) __ ")" { return { type: "Paren", elements: t0 }; }) { return [t0, t1]; }) { return { type: "MacroForm", inputForm: form }; }

