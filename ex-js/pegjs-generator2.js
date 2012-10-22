module.exports = (function () {

    var generator = { debug: false };

    var template = 'Template\n = StatementInTemplate\n\n';
    var characterStatement = 'CharacterStatement\n = &{}\n\n';
    var macroExpression = 'MacroExpression\n = '
    var macroStatement = 'MacroStatement\n = '
    
    var pegObj = {
        // enclosing types
        Brace: { left: '"{"', right: '"}"' },
        Paren: { left: '"("', right: '")"' },
        Bracket: { left: '"["', right: '"]"' },

        // Repetition
        repetition: function(elements, mark) {
            return {
                type: 'Repetition',
                elements: elements,
                mark: mark,
                toCode: function (context) {
                    var template = context === 'template';
                    var m = mark? '__ "' + mark + '" ' : '';
                    return '(head:' + this.elements.toCode(context)
                        + '\n tail:(' + m + '__ ' + this.elements.toCode(context) + ')*\n'
                        + (template? 'ellipsis:(' + m + '__ "...")?\n' : '')
                        + '{ var elements = [head];\n'
                        + '  for (var i=0; i<tail.length; i++) {\n'
                        + '    elements.push(tail[i][' + (m? 3 : 1) + ']);\n'
                        + '  }\n'
                        + (template? '  if (ellipsis) elements.push({ type: "Ellipsis" });\n' : '')
                        + '  return { type: "Repeat", elements: elements };\n'
                        + '})?\n';
                }
            };
        },

        // Enclosing
        enclosing: function (type, elements) {
            switch (type) {
            case 'RepBlock':
                return {
                    type: type,
                    elements: elements,
                    toCode: function (context) {
                        return '(' + (elements? 't0:' + this.elements.toCode(context) + ' __ ' : '') + '\n\
{ return { type: "RepBlock", elements: ' + (elements? 't0' : '[]') + ' }; })';
                    }
                };
                break;
            case 'Brace':
            case 'Paren':
            case 'Bracket':
                return {
                    type: type,
                    elements: elements,
                    toCode: function (context) {
                        return '(' + pegObj[type].left + ' __ ' + (elements? 't0:' + this.elements.toCode(context) + ' __ ' : '') + pegObj[type].right + '\n\
{ return { type: "' + type + '", elements: ' + (elements? 't0' : '[]') + ' }; })';
                    }
                };
                break;
            }
        },

        // Identifier
        identifier: function () {
            return {
                type: 'Identifier',
                toCode: function (context) { return 'MacroIdentifier'; }
            };
        },

        // Expression
        expression: function () {
            return {
                type: 'Expression',
                toCode: function (context) { return 'AssignmentExpression'; }
            };
        },

        // Statement
        statement: function () {
            return {
                type: 'Statement',
                toCode: function (context) { return 'Statement'; }
            };
        },

        // symbol
        symbol: function () {
            return {
                type: 'Symbol',
                toCode: function (context) { return 'MacroSymbol'; }
            };
        },

        // keyword
        keyword: function (name) {
            return {
                type: 'LiteralKeyword',
                name: name,
                toCode: function (context) {
                     return '(v:MacroKeyword &{ return v.name === "' + name + '"; }\n\
{ return v; })';
                }
            };
        }, 

        // Punct (Punctuator, PunctuationMark)
        punct: function(type, value) {
            return {
                type: type,
                value: value,
                toCode: function (context) {
                    return '("' + value + '"\n\
{ return { type: "' + type + '", value: "' + value + '" }; })';
                }
            };
        },

        // Literal
        literal: function(type, value) {
            switch (type) {
            case 'NumericLiteral':
            case 'StringLiteral':
                return {
                    type: type,
                    value: value,
                    toCode: function (context) {
                        return '(v:' + type + ' &{ return eval(v) === ' + value + '; }\n\
{ return { type: "' + type + '", value: v }; })';
                    }
                };
                break;
            case 'BooleanLiteral':
            case 'RegularExpressionLiteral':
                return {
                    type: type,
                    value: value,
                    toCode: function (context) {
                        return '(v:' + type + ' &{ return eval(v.value) === ' + value + '; }\n\
{ return v; })';
                    }
                };
                break;
            case 'NullLiteral':
                return {
                    type: type,
                    value: value,
                    toCode: function (context) { return 'NullLiteral'; }
                };
                break;
            }
        },

        // Macro name
        macroName: function (name) {
            return {
                type: 'MacroName',
                name: name,
                toCode: function (context) {
                    return '("' + name + '" !IdentifierPart\n\
{ return { type: "MacroName", name:"' + name + '" }; })';
                }
            };
        },

        macroForm: function (name, body) {
            var form = [name];
            for (var i=0; i<body.length; i++) {
                form.push(convertToPegObj(body[i]));
            }
            form = pegObj.sequence(form);
            return {
                type: 'MacroForm',
                name: name.name,
                inputForm: form,
                toCode: function (context) {
                    var template = context === 'template';
                    return (template? '&{ return macroType; } ' : '')
                        + 'form:' + this.inputForm.toCode(context) + '\n\
{ return { type: "MacroForm", inputForm: form }; }';
                }
            };
        },

        // Sequence
        sequence: function(elements) {
            return {
                type: 'Sequence',
                elements: elements,
                toCode: function (context) {
                    var es = [];
                    var tags = [];
                    for (var i=0, n=0; i<this.elements.length; i++) {
                        if (this.elements[i]) {
                            es.push('t' + n + ':' + this.elements[i].toCode(context));
                            tags.push('t' + n);
                            n++;
                        }
                    }
                    return '(' + es.join(' __ ') + ' { return [' + tags.join(', ') + ']; })';
                }
            };
        },

        // Prioritized choice
        choice: function(elements) {
            return {
                type: 'Choice',
                elements: elements,
                toCode: function (context) {
                    var es = [];
                    for (var i=0; i<this.elements.length; i++) {
                        if (this.elements[i])
                            es.push(this.elements[i].toCode(context));
                    }
                    return es.join('\n / ');
                }
            };
        }
     
    };
    
    var jsMacroTypes = [

        // Repetition
        { type: 'Repetition',
          isType: function(t) { return t === this.type; },
          toPegObj: function(obj) {
              var elements = convertToPegObj(obj.elements);
              return pegObj.repetition(elements, obj.punctuationMark);
          }          
        },

        // RepBlock [# ~ #] は 取り除く
        { type: 'RepBlock',
          isType: function(t) { return t === this.type; },
          toPegObj: function(obj) {
              var elements = convertToPegObj(obj.elements);
              return pegObj.enclosing(this.type, elements);
          }
        },

        // Brace
        { type: 'Brace',
          isType: function(t) { return t === this.type; },
          toPegObj: function(obj) {
              var elements = convertToPegObj(obj.elements);
              return pegObj.enclosing(this.type, elements);
          }
        },

        // Parentheses
        { type: 'Paren',
          isType: function(t) { return t === this.type; },
          toPegObj: function(obj) {
              var elements = convertToPegObj(obj.elements);
              return pegObj.enclosing(this.type, elements);
          }
        },

        // Bracket
        { type: 'Bracket',
          isType: function(t) { return t === this.type; },
          toPegObj: function(obj) {
              var elements = convertToPegObj(obj.elements);
              return pegObj.enclosing(this.type, elements);
          }
        },

        // IdentifierVariable
        { type: 'IdentifierVariable',
          isType: function(t) { return t === this.type; },
          toPegObj: function(obj) {
              return pegObj.identifier();
          }
        },

        // ExpressionVariable
        { type: 'ExpressionVariable',
          isType: function(t) { return t === this.type; },
          toPegObj: function(obj) {
              return pegObj.expression();
          }
        },

        // StatementVariable
        { type: 'StatementVariable',
          isType: function(t) { return t === this.type; },
          toPegObj: function(obj) {
              return pegObj.statement();
          }
        },

        // SymbolVariable
        { type: 'SymbolVariable',
          isType: function(t) { return t === this.type; },
          toPegObj: function(obj) {
              return pegObj.symbol();
          }
        },

        // LiteralKeyword
        { type: 'LiteralKeyword',
          isType: function(t) { return t === this.type; },
          toPegObj: function(obj) {
              return pegObj.keyword(obj.name);
          }
        },

        // Punctuator
        { type: 'Punctuator',
          isType: function(t) { return t === this.type; },
          toPegObj: function(obj) {
              return pegObj.punct(this.type, obj.value);
          }
        },

        // PunctuationMark
        { type: 'PunctuationMark',
          isType: function(t) { return t === this.type; },
          toPegObj: function(obj) {
              return pegObj.punct(this.type, obj.value);
          }
        },

        // BooleanLiteral
        { type: 'BooleanLiteral',
          isType: function(t) { return t === this.type; },
          toPegObj: function(obj) {
              return pegObj.literal(this.type, obj.value);
          }
        },

        // NumericLiteral
        { type: 'NumericLiteral',
          isType: function(t) { return t === this.type; },
          toPegObj: function(obj) {
              return pegObj.literal(this.type, obj.value);
          }
        },

        // StringLiteral
        { type: 'StringLiteral',
          isType: function(t) { return t === this.type; },
          toPegObj: function(obj) {
              return pegObj.literal(this.type, obj.value);
          }
        },

        // NullLiteral
        { type: 'NullLiteral',
          isType: function(t) { return t === this.type; },
          toPegObj: function(obj) {
              return pegObj.literal(this.type, null);
          }
        },
        
        // RegularExpressionLiteral
        { type: 'RegularExpressionLiteral',
          isType: function(t) { return t === this.type; },
          toPegObj: function(obj) {
              return pegObj.literal(this.type, obj.value);
          }
        }
    ];

    var convertToPegObj = function(pattern) {

        if (pattern instanceof Array) {
            if (pattern.length === 0)
                return null;
            var result = [convertToPegObj(pattern[0])];
            for (var i=1; i<pattern.length; i++) {
                result.push(convertToPegObj(pattern[i]));
            }
            return pegObj.sequence(result);
        } else if (pattern) {
            for (var i=0; i<jsMacroTypes.length; i++) {
                var type = jsMacroTypes[i];
                if (type.isType(pattern.type)) {
                    return type.toPegObj(pattern);
                }
            }
            return null;
        }
        return null;
    };

    var canDeleteNode = function (element) {
        var type = element.type;
        if (type === 'Repetition') {
            if (element.elements === null) return true;
            return canDeleteNode(element.elements);
        } else if (type === 'RepBlock') {
            if (element.elements === null) return true;
            for (var i=0; i<element.elements.elements.length; i++) {
                if (i === element.elements.elements.length - 1 && element.elements.elements[i] !== null)
                    return canDeleteNode(element.elements.elements[i]);
                if (element.elements.elements[i] !== null)
                    return false;
            }
            return true;
        } else if (['Brace', 'Paren', 'Bracket'].indexOf(type) >= 0) {
            if (element.elements === null) return true;
            for (var i=0; i<element.elements.elements.length; i++) {
                if (element.elements.elements[i] !== null)
                    return false;
            }
            return true;
        } else if (['Identifier', 'Expression', 'Statement', 'Symbol', 'LiteralKeyword', 'Punctuator', 'PunctuationMark', 'NumericLiteral', 'StringLiteral', 'BooleanLiteral', 'RegularExpressionLiteral', 'NullLiteral'].indexOf(type) >= 0) {
            return true;
        } else {
            return false;
        }
    };

    var delete1Node = function (elements, start) {
        for (var i=start; i<elements.length; i++) {
            if (elements[i] && canDeleteNode(elements[i])) {
                elements[i] = null;
                console.log('delete true');
                return true;
            } else if (elements[i]) { // elements[i] は RepBlock, Brace, Paren, Bracket, Repetition のいずれか   
                console.log('delete recursive');
                if (elements[i].type === 'Repetition') {
                    console.log('rep');
                    return delete1Node(elements[i].elements, 0);
                }
                else
                    return delete1Node(elements[i].elements.elements, 0);
            }
        }
        console.log('delete false');
        return false;
    };
    
    var getSuffixTree = function (tree) {
        if (tree.type !== 'MacroForm')
            throw 'error. type property is not "MacroForm"';
        return delete1Node(tree.inputForm.elements, 1);

    };

    generator.generate = function(jsObj) {

        if (jsObj.type === 'Program') {
            var elements = jsObj.elements;
            var macroDefs = [];
            var expressionMacros = [];
            var statementMacros = [];
            for (var i=0; i<elements.length; i++) {
                var element = elements[i];
                if (element.type.indexOf('MacroDefinition') >= 0)
                    macroDefs.push(element);
            }

            for (var i=0; i<macroDefs.length; i++) {
                var macroDef = macroDefs[i];
                var macroName = pegObj.macroName(macroDef.macroName);
                var syntaxRules = macroDef.syntaxRules;
                var patterns = [];
                var p;
                for (var j=0; j<syntaxRules.length; j++) {
                    patterns.push(pegObj.macroForm(macroName, syntaxRules[j].pattern));
                }
                p = patterns[0];
                patterns = pegObj.choice(patterns);
                if (macroDef.type.indexOf('Expression') >= 0)
                    expressionMacros.push(patterns);
                else
                    statementMacros.push(patterns);
            }

            expressionMacros = expressionMacros.length > 0 ? pegObj.choice(expressionMacros) : '';
            statementMacros = statementMacros.length > 0 ? pegObj.choice(statementMacros) : '';

            console.log(JSON.stringify(p));
            console.log(getSuffixTree(p));
            console.log('\n\n\n\n\n\n');
            console.log(p.toCode('template'));
/*            var s ={ type: 'MacroForm', inputForm: { type: 'Sequence', elements: [{ type: 'Identifier' }, { type: 'Expression' }] } }
            getSuffixTree(s);
            console.log(s.inputForm.elements[1]);
*/
            return template + characterStatement
                + (expressionMacros?  macroExpression + expressionMacros.toCode('program') + '\n / ' + expressionMacros.toCode('template') + '\n\n' : '')
                + (statementMacros? macroStatement + statementMacros.toCode('program') + '\n / ' + statementMacros.toCode('template') + '\n\n' : '');

            
        } else {
            return 'error';
        }
    }

    return generator;
}());