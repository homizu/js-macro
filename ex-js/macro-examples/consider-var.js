MacroForm "let x = a { foo(); var y = b; log(y); }"

MacroForm
"let id1=1/2 and id2=100E10 {
  var result;
  result = id1 + id2;
  var result2 = result * 2;
  return result2;
}"

MacroForm
variables: [ result, result2]
"let id1=1/2 and id2=100E10 {
  result = id1 + id2;
  result2 = result * 2;
  return result2;
}"

(Let [ (jsvariable: id1) ...]
 (define result) (define result2) ;;; Repeat.variables = [ result, result2 ]
 (set! result (jsop + id1 id2))
 ...) 

// Meta構文とJavaScript構文の境界面に位置するStatementなMetaノードに変数宣言を集約すればいい？(variables フィールドの挿入?)

// 反例

Join {
    { Join { S1 ...} { S2 ... } } => { S1 ... S2 ... } }

Statements [
    Block { elements: [ S1, Ellipsis, S2, Ellipsis ] } ]



MacroForm:
inputForm: [
    MacroName,
    (Paren|Repeat|Brace).elements : Meta | Expression | Statement
]

MacroForm.inputForm = [
    Paren [
        Keyword=var,
        Repeat: [
            [
                Variable=id1,
                Punct=,
                Binary: 1/2
            ],
            [
                Variable: id2,
                Punct=,
                Numeric: 100E10
            ]
        ],
        Brace: [
            Repeat: [
                { VariableStatement: result = id1 + id2 },
                { Assignment: result = result * 2 },
                { Return: result }
            ]
        ]
    ]
]

{
    "type": "MacroForm",
    "inputForm": [
        {
            "type": "MacroName",
            "name": "let"
        },
        {
            "type": "Paren",
            "elements": [
                {
                    "type": "LiteralKeyword",
                    "name": "var"
                },
                {
                    "type": "Repeat",
                    "elements": [
                        [
                            {
                                "type": "Variable",
                                "name": "id1"
                            },
                            {
                                "type": "Punctuator",
                                "value": "="
                            },
                            {
                                "type": "BinaryExpression",
                                "operator": "/",
                                "left": {
                                    "type": "NumericLiteral",
                                    "value": "1"
                                },
                                "right": {
                                    "type": "NumericLiteral",
                                    "value": "2"
                                }
                            }
                        ],
                        [
                            {
                                "type": "Variable",
                                "name": "id2"
                            },
                            {
                                "type": "Punctuator",
                                "value": "="
                            },
                            {
                                "type": "NumericLiteral",
                                "value": "100E10"
                            }
                        ]
                    ]
                }
            ]
        },
        {
            "type": "Brace",
            "elements": [
                {
                    "type": "Repeat",
                    "elements": [
                        {
                            "type": "VariableStatement",
                            "declarations": [
                                {
                                    "type": "VariableDeclaration",
                                    "name": "result",
                                    "value": {
                                        "type": "BinaryExpression",
                                        "operator": "+",
                                        "left": {
                                            "type": "Variable",
                                            "name": "id1"
                                        },
                                        "right": {
                                            "type": "Variable",
                                            "name": "id2"
                                        }
                                    }
                                }
                            ]
                        },
                        {
                            "type": "AssignmentExpression",
                            "operator": "=",
                            "left": {
                                "type": "Variable",
                                "name": "result"
                            },
                            "right": {
                                "type": "BinaryExpression",
                                "operator": "*",
                                "left": {
                                    "type": "Variable",
                                    "name": "result"
                                },
                                "right": {
                                    "type": "NumericLiteral",
                                    "value": "2"
                                }
                            }
                        },
                        {
                            "type": "ReturnStatement",
                            "value": {
                                "type": "Variable",
                                "name": "result"
                            }
                        }
                    ]
                }
            ]
        }
    ]
}




