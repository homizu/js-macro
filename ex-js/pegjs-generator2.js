module.exports = (function () {

    var generator = { debug: false };

    var template = 'Template\n = StatementInTemplate\n\n';
    var characterStatement = 'CharacterStatement\n = &{}\n\n';
    var macroExpression = 'MacroExpression\n = '
    var macroStatement = 'MacroStatement\n = '
    
    var pegObj2 = {
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
                programPeg: function () {
                    var m = mark? '__ "' + mark + '" ' : '';
                    return '(head:' + this.elements.programPeg() + '\n\
tail:(' + m + '__ ' + this.elements.programPeg() + ')*\n\
{ var elements = [head];\n\
for (var i=0; i<tail.length; i++) {\n\
elements.push(tail[i][' + (m? 3 : 1) + ']);\n\
}\n\
return { type: "Repeat", elements: elements };\n\
})?\n'; },
                templatePeg: function () {
                    var m = mark? '__ "' + mark + '" ' : '';
                     return '(head:' + this.elements.templatePeg() + '\n\
tail:(' + m + '__ ' + this.elements.templatePeg() + ')*\n\
ellipsis:(' + m + '__ "...")?\n\
{ var elements = [head];\n\
for (var i=0; i<tail.length; i++) {\n\
elements.push(tail[i][' + (m? 3 : 1) + ']);\n\
}\n\
if (ellipsis) elements.push({ type: "Ellipsis" });\n\
return { type: "Repeat", elements: elements };\n\
})?\n'; },
                toString: function() {
                    return '(head:' + elements + ' tail:(' + (mark? ('__ "' + mark + '" ') : '') + '__ ' + elements + ')*\n\
{ var elements = [head];\n\
for (var i=0; i<tail.length; i++) {\n\
elements.push(tail[i][' + (mark? 3 : 1) + ']);\n\
}\n\
return { type: "Repeat", elements: elements };\n\
})?\n'; }
            };
        },

        // Enclosing
        enclosing: function (type, elements) {
            var isNull = elements.type.charAt(0) === '-';
            if (!isNull)
                elements = pegObj2.tag('t0', elements);
            switch (type) {
            case 'RepBlock':
                return {
                    type: type,
                    elements: elements,
                    programPeg: function () {
                        return '(' + (isNull? '' : (this.elements.programPeg() + ' __ ')) + '\n\
{ return { type: "RepBlock", elements: ' + (isNull? '[]' : 't0') + ' }; })';
                    },
                    templatePeg: function () {
                        return '(' + (isNull? '' : (this.elements.templatePeg() + ' __ ')) + '\n\
{ return { type: "RepBlock", elements: ' + (isNull? '[]' : 't0') + ' }; })';
                    },
                    toString: function () {
                        return '(' + (isNull? '' : (elements + ' __ ')) + '\n\
{ return { type: "RepBlock", elements: ' + (isNull? '[]' : 't0') + ' }; })';
                    }
                };
                break;
            case 'Brace':
            case 'Paren':
            case 'Bracket':
                return {
                    type: type,
                    elements: elements,
                    programPeg: function () {
                        return '(' + pegObj2[type].left + ' __ ' + (isNull? '' : (this.elements.programPeg() + ' __ ')) + pegObj2[type].right + '\n\
{ return { type: "' + type + '", elements: ' + (isNull? '[]' : 't0') + ' }; })';
                    },
                    templatePeg: function () {
                        return '(' + pegObj2[type].left + ' __ ' + (isNull? '' : (this.elements.templatePeg() + ' __ ')) + pegObj2[type].right + '\n\
{ return { type: "' + type + '", elements: ' + (isNull? '[]' : 't0') + ' }; })';
                    },
                    toString: function () {
                        return '(' + pegObj2[type].left + ' __ ' + (isNull? '' : (elements + ' __ ')) + pegObj2[type].right + '\n\
{ return { type: "' + type + '", elements: ' + (isNull? '[]' : 't0') + ' }; })';
                    }
                };
                break;
            }
        },

        // Identifier
        identifier: function () {
            return {
                type: 'Identifier',
                programPeg: function () { return 'MacroIdentifier'; },
                templatePeg: function () { return this.programPeg(); },
                toString: function () { return 'MacroIdentifier'; }
            };
        },

        // Expression
        expression: function () {
            return {
                type: 'Expression',
                programPeg: function () { return 'AssignmentExpression'; },
                templatePeg: function () { return this.programPeg(); },
                toString: function () { return 'AssignmentExpression'; }
            };
        },

        // Statement
        statement: function () {
            return {
                type: 'Statement',
                programPeg: function () { return 'Statement'; },
                templatePeg: function () { return this.programPeg(); },
                toString: function () { return 'Statement'; }
            };
        },

        // symbol
        symbol: function () {
            return {
                type: 'Symbol',
                programPeg: function () { return 'MacroSymbol'; },
                templatePeg: function () { return this.programPeg(); },
                toString: function () { return 'MacroSymbol'; }
            };
        },

        // keyword
        keyword: function (name) {
            return {
                type: 'LiteralKeyword',
                name: name,
                programPeg: function () {
                    return '(v:MacroKeyword &{ return v.name === "' + name + '"; }\n\
{ return v; })';
                },
                templatePeg: function () { return this.programPeg(); },
                toString: function () {
                    return '(v:MacroKeyword &{ return v.name === "' + name + '"; }\n\
{ return v; })';
                }
            };
        }, 

        // Punct
        punct: function(type, value) {
            return {
                type: type,
                value: value,
                programPeg: function () {
                    return '("' + value + '"\n\
{ return { type: "' + type + '", value: "' + value + '" }; })';
                },
                templatePeg: function () { return this.programPeg(); },
                toString: function () { return '("' + value + '"\n\
{ return { type: "' + type + '", value: "' + value + '" }; })'; }
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
                    programPeg: function () {
                        return '(v:' + type + ' &{ return eval(v) === ' + value + '; }\n\
{ return { type: "' + type + '", value: v }; })';
                    },
                    templatePeg: function () { return this.programPeg(); },
                    toString: function () {
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
                    programPeg: function () {
                        return '(v:' + type + ' &{ return eval(v.value) === ' + value + '; }\n\
{ return v; })';
                    },
                    templatePeg: function () { return this.programPeg(); },
                    toString: function () {
                        return '(v:' + type + ' &{ return eval(v.value) === ' + value + '; }\n\
{ return v; })';
                    }
                };
                break;
            case 'NullLiteral':
                return {
                    type: type,
                    value: value,
                    programPeg: function () { return 'NullLiteral'; },
                    templatePeg: function () { return this.programPeg(); },
                    toString: function () {
                        return 'NullLiteral';
                    }
                };
                break;
            }
        },

        // Macro name
        macroName: function (name) {
            return {
                type: 'MacroName',
                name: name,
                programPeg: function () {
                    return '("' + name + '" !IdentifierPart\n\
{ return { type: "MacroName", name:"' + name + '" }; })';
                },
                templatePeg: function () { return this.programPeg(); },
                toString: function () {
                    return '("' + name + '" !IdentifierPart\n\
{ return { type: "MacroName", name:"' + name + '" }; })' }
            };
        },

        macroForm: function (name, body) {
            var form = [name];
            for (var i=0; i<body.length; i++) {
                form.push(convertToPegObj(body[i]));
            }
            form = pegObj2.sequence(form);
            return {
                type: 'MacroForm',
                name: name.name,
                inputForm: form,
                programPeg: function () {
                    return 'form:' + form.programPeg() + '\n\
{ return { type: "MacroForm", inputForm: form }; }';
                },
                templatePeg: function () {
                    return 'form:' + form.templatePeg() + '\n\
{ return { type: "MacroForm", inputForm: form }; }';
                },
                toString: function () {
                    return 'form:' + form + '\n\
{ return { type: "MacroForm", inputForm: form }; }';
                }
            };
        },

        // Tag (Label)
        tag: function(tag, value) {
            return {
                type: 'Tag',
                value: value,
                tag: tag,
                programPeg: function () { return tag + ':' + this.value.programPeg(); },
                templatePeg: function () { return tag + ':' + this.value.templatePeg(); },
                toString: function() { return tag + ':' + value; }
            };
        },

        // Sequence
        sequence: function(array) {
            var newArray = [];
            for (var i=0; i<array.length; i++) {
                if (array[i].type.charAt(0) !== '-')
                    newArray.push(array[i]);
            }
            var result = [];
            var tags = [];
            for (var i=0; i<newArray.length; i++) {
                result.push(pegObj2.tag('t'+i, newArray[i]));
                tags.push('t'+i);
            }
            return {
                type: 'Sequence',
                elements: result,
                programPeg: function () {
                    var es = [];
                    for (var i=0; i<this.elements.length; i++) {
                        es.push(this.elements[i].programPeg());
                    }
                    return '(' + es.join(' __ ') + ' { return [' + tags.join(', ') + ']; })';
                },
                templatePeg: function () {
                    var es = [];
                    for (var i=0; i<this.elements.length; i++) {
                        es.push(this.elements[i].templatePeg());
                    }
                    return '(' + es.join(' __ ') + ' { return [' + tags.join(', ') + ']; })';
                },
                toString: function() { return '(' + this.elements.join(' __ ') + ' { return [' + tags.join(', ') + ']; })'; }
            };
        },

        // Prioritized choice
        choice: function(array) {
            var newArray = [];
            for (var i=0; i<array.length; i++) {
                if (array[i].type.charAt(0) !== '-')
                    newArray.push(array[i]);
            }
            
            return {
                type: 'Choice',
                elements: newArray,
                programPeg: function () {
                    var es = [];
                    for (var i=0; i<this.elements.length; i++) {
                        es.push(this.elements[i].programPeg());
                    }
                    return es.join('\n / ');
                },
                templatePeg: function () {
                    var es = [];
                    for (var i=0; i<this.elements.length; i++) {
                        es.push(this.elements[i].templatePeg());
                    }
                    return es.join('\n / ');
                },
                toString: function() { return this.elements.join('\n / '); } 
            };
        }, 
/*
        // White spaces
        whitespace: function() {
            return {
                type: '-Whitespace',
                toString: function() { return '__';}
            };
        },
        
*/
       // Null Object
        'null': function() {
            return {
                type: '-Null',
                programPeg: function () { return ''; },
                tempaltePeg: function () { return ''; },
                toString: function() { return ''; }
            };
        }
        
    };
    
    
    var jsMacroTypes = [

        // Repetition
        { type: 'Repetition',
          isType: function(t) { return t === this.type; },
          toPegObj: function(obj) {
              var elements = convertToPegObj(obj.elements);
              return pegObj2.repetition(elements, obj.punctuationMark);
          }          
        },

        // RepBlock [# ~ #] は 取り除く
        { type: 'RepBlock',
          isType: function(t) { return t === this.type; },
          toPegObj: function(obj) {
              var elements = convertToPegObj(obj.elements);
              return pegObj2.enclosing(this.type, elements);
          }
        },

        // Brace
        { type: 'Brace',
          isType: function(t) { return t === this.type; },
          toPegObj: function(obj) {
              var elements = convertToPegObj(obj.elements);
              return pegObj2.enclosing(this.type, elements);
          }
        },

        // Parentheses
        { type: 'Paren',
          isType: function(t) { return t === this.type; },
          toPegObj: function(obj) {
              var elements = convertToPegObj(obj.elements);
              return pegObj2.enclosing(this.type, elements);
          }
        },

        // Bracket
        { type: 'Bracket',
          isType: function(t) { return t === this.type; },
          toPegObj: function(obj) {
              var elements = convertToPegObj(obj.elements);
              return pegObj2.enclosing(this.type, elements);
          }
        },

        // IdentifierVariable
        { type: 'IdentifierVariable',
          isType: function(t) { return t === this.type; },
          toPegObj: function(obj) {
              return pegObj2.identifier();
          }
        },

        // ExpressionVariable
        { type: 'ExpressionVariable',
          isType: function(t) { return t === this.type; },
          toPegObj: function(obj) {
              return pegObj2.expression();
          }
        },

        // StatementVariable
        { type: 'StatementVariable',
          isType: function(t) { return t === this.type; },
          toPegObj: function(obj) {
              return pegObj2.statement();
          }
        },

        // SymbolVariable
        { type: 'SymbolVariable',
          isType: function(t) { return t === this.type; },
          toPegObj: function(obj) {
              return pegObj2.symbol();
          }
        },

        // LiteralKeyword
        { type: 'LiteralKeyword',
          isType: function(t) { return t === this.type; },
          toPegObj: function(obj) {
              return pegObj2.keyword(obj.name);
          }
        },

        // Punctuator
        { type: 'Punctuator',
          isType: function(t) { return t === this.type; },
          toPegObj: function(obj) {
              return pegObj2.punct(this.type, obj.value);
          }
        },

        // PunctuationMark
        { type: 'PunctuationMark',
          isType: function(t) { return t === this.type; },
          toPegObj: function(obj) {
              return pegObj2.punct(this.type, obj.value);
          }
        },

        // BooleanLiteral
        { type: 'BooleanLiteral',
          isType: function(t) { return t === this.type; },
          toPegObj: function(obj) {
              return pegObj2.literal(this.type, obj.value);
          }
        },

        // NumericLiteral
        { type: 'NumericLiteral',
          isType: function(t) { return t === this.type; },
          toPegObj: function(obj) {
              return pegObj2.literal(this.type, obj.value);
          }
        },

        // StringLiteral
        { type: 'StringLiteral',
          isType: function(t) { return t === this.type; },
          toPegObj: function(obj) {
              return pegObj2.literal(this.type, obj.value);
          }
        },

        // NullLiteral
        { type: 'NullLiteral',
          isType: function(t) { return t === this.type; },
          toPegObj: function(obj) {
              return pegObj2.literal(this.type, null);
          }
        },
        
        // RegularExpressionLiteral
        { type: 'RegularExpressionLiteral',
          isType: function(t) { return t === this.type; },
          toPegObj: function(obj) {
              return pegObj2.literal(this.type, obj.value);
          }
        }
    ];

    var convertToPegObj = function(pattern) {

        if (pattern instanceof Array) {
            if (pattern.length === 0)
                return pegObj2.null();
            var result = [convertToPegObj(pattern[0])];
            for (var i=1; i<pattern.length; i++) {
                result.push(convertToPegObj(pattern[i]));
            }
            return pegObj2.sequence(result);
        } else if (pattern) {
            for (var i=0; i<jsMacroTypes.length; i++) {
                var type = jsMacroTypes[i];
                if (type.isType(pattern.type)) {
                    return type.toPegObj(pattern);
                }
            }
            return pegObj2.null();
        }
        return pegObj2.null();            
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
                var macroName = pegObj2.macroName(macroDef.macroName);
                var syntaxRules = macroDef.syntaxRules;
                var patterns = [];
                for (var j=0; j<syntaxRules.length; j++) {
                    patterns.push(pegObj2.macroForm(macroName, syntaxRules[j].pattern));
                }
                patterns = pegObj2.choice(patterns);
                if (macroDef.type.indexOf('Expression') >= 0)
                    expressionMacros.push(patterns);
                else
                    statementMacros.push(patterns);
            }

            return template + characterStatement
                + (expressionMacros.length > 0 ?  macroExpression + pegObj2.choice(expressionMacros).templatePeg() + '\n\n' : '')
                + (statementMacros.length > 0 ? macroStatement + pegObj2.choice(statementMacros).templatePeg() + '\n\n' : '');
            
        } else {
            return 'error';
        }
    }

    return generator;
}());