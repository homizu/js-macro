module.exports = (function () {

    var generator = { debug: false };

    var pegjsTemplate = 'Template\n = StatementInTemplate\n';
    var pegjsStatement = 'Statement\n = '
    var pegjsStatements = '\n / Block\n / VariableStatement\n / EmptyStatement\n / ExpressionStatement\n / IfStatement\n / IterationStatement\n / ContinueStatement\n / BreakStatement\n / ReturnStatement\n / WithStatement\n / LabelledStatement\n / SwitchStatement\n / ThrowStatement\n / TryStatement\n / DebuggerStatement\n / MacroDefinition\n / FunctionDeclaration\n / FunctionExpression\n';

    var pegjsExpression = 'AssignmentExpression =\n '
    var pegjsExpressions = '\n / left:LeftHandSideExpression __\n operator:AssignmentOperator __\n right:AssignmentExpression {\n return {\n type:     "AssignmentExpression",\n operator: operator,\n left:     left,\n right:    right\n };\n }\n / ConditionalExpression\n';

    var pegObj = {
/* 定義通りに実装したもの       
        // Grouping
        grouping: function(data) {
            return { 
                type: 'grouping',
                data: data,
                toString: function() { return '(' + this.data + ')'; }
            };
        },
        
        // Zero-or-one
        optional: function(data) {
            return { 
                type: 'optional',
                data: data,
                toString: function() { return  '(' + this.data + ')?'; }
            };
        },
        
        // Zero-or-more repetitions
        repetition: function(data) {
            return {
                type: 'repetitions',
                data: data,
                toString: function() { return  '(' + this.data + ')*'; }
            };
        },

        // Sequence
        sequence: function(array) {
            var result = array[0];
            for (var i=1; i<array.length; i++) {
                result = {
                    type: 'sequence',
                    left: result,
                    right: array[i],
                    toString: function() { return this.left.toString() + ' ' + this.right.toString(); }
                };
            }
            return result;
        },

        // Prioritized choice
        choice: function(array) {
            var result = array[0];
            for (var i=1; i<array.length; i++) {
                result = {
                    type: 'choice',
                    left: result,
                    right: array[i],
                    toString: function() { return this.left.toString() + ' / ' + this.right.toString(); }
                };
            }
            return result;
        }, 
*/

        // Tag (Label)
        tag: function(tag, data) {
            return {
                type: 'Tag',
                data: data,
                tag: tag,
                toString: function() { return tag + ':' + this.data; }
            };
        },

        // Ellipsis repetition
        repetition: function(data, mark) {
            return {
                type: 'Repetition',
                data: data,
                mark: mark,
                toString: function() { return '(head:'+ data + ' tail:(' + (mark? (pegObj.whitespace() + ' ' + pegObj.string(mark + ' ')) : '') + pegObj.whitespace() + ' ' + data + ')* ellipsis:"..."? !{ return !inTemplate && ellipsis; } { var elements = [head]; for (var i=0; i<tail.length; i++) { elements.push(tail[i][' + (mark? 3 : 1) + ']); } if (ellipsis) elements.push({ type: "Ellipsis" });  return { type: "Repetition", elements: elements, punctuationMark: "' + mark + '" }; })?'; }
            };
            
        },
        
        // Sequence
        sequence: function(array) {
            var newArray = [];
            for (var i=0; i<array.length; i++) {
                if (array[i].type.charAt(0) !== '=')
                    newArray.push(array[i]);
            }
            var result = [pegObj.tag('t0', newArray[0])];
            var tags = ['t0'];
            for (var i=1; i<newArray.length; i++) {
                result.push(pegObj.whitespace());
                result.push(pegObj.tag('t'+i, newArray[i]));
                tags.push('t'+i);
            }
            return {
                type: 'Sequence',
                data: result,
                toString: function() { return '(' + this.data.join(' ') + ' { return [' + tags.join(', ') + ']; })'; }
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
                data: newArray,
                toString: function() { return this.data.join('\n / '); } 
            };
        }, 

        // White spaces
        whitespace: function() {
            return {
                type: '-Whitespace',
                toString: function() { return '__';}
            };
        },
        
        // Literal string
        string: function(data, literal) {
            return {
                type: 'String',
                data: data,
                toString: function() { return (literal? '(' : '') + '"' + this.data + '"' + (literal? '{ return { type: "String", data: "' + this.data + '" }; })' : ''); }
            };
        },
        
        // Literal number
        number: function(data) {
            return {
                type: 'Number',
                data: data,
                toString: function() { return '(number:NumericLiteral &{ return (number - 0) === ' + this.data + '; } { return { type: "Number", data: number }; })'; }
            };
        },
        
        // Identifier
        identifier: function() {
            return {
                type: 'Identifier',
                toString: function() { return '(name:IdentifierName { return { type: "' + this.type + '", name: name }; })'; }
            };
        },
        
        // Expression
        expression: function() {
            return {
                type: 'Expression',
                toString: function() { return 'AssignmentExpression'; }
            };
        },
        
        // Statement
        statement: function() {
            return {
                type: 'Statement',
                toString: function() { return 'Statement'; }
            };
        },

        // Null Object
        'null': function() {
            return {
                type: '-Null',
                toString: function() { return ''; }
            };
        },


        // Enclosing
        enclosing: function(type, data) {
            var lefts = { Block: pegObj.string('{'),
                          Paren: pegObj.string('('),
                          Bracket: pegObj.string(']') };
            var rights = { Block: pegObj.string('}'),
                           Paren: pegObj.string(')'),
                           Bracket: pegObj.string(']') };
            var isNull = data.type.charAt(0) === '-';
            if (!isNull)
                data = pegObj.tag('t0', data);
            return {
                type: type,
                data: data,
                toString: function() {
                    return '(' + lefts[type] + ' ' + pegObj.whitespace() +' ' + (isNull ? '' : ( data + ' ' +  pegObj.whitespace() + ' ')) +  rights[type]
                        + ' { return { type: "' + this.type + '", elements: ' + (isNull? '""' : 't0') +' }; })';
                }
            };
        },
 
        // Macro name
        macroName: function(name) {
            return {
                type: 'MacroName',
                name: name,
                toString: function() { return '("' + this.name + '" { return { type: "MacroName", name:"' + name + '"}; })' }
            };
        },
        
        // Macro input form
        macroForm: function(name, body) {
            var form;
            if (body.type.charAt(0) === '-')
                form = name;
            else
                form = pegObj.sequence([name, body]);
            return {
                type: 'MacroForm',
                name: name.name,
                inputForm: form,
                toString: function() {
                    return 'form:' + form + '{ return { type: "' + this.name + this.type + '", inputForm: form }; }';
                }
            };
        }
    };
    
    
    var jsMacroTypes = [

        // Repetition
        { type: 'Repetition',
          isType: function(t) { return t === this.type; },
          toPegObj: function(obj) {
              var data = convertToPegObj(obj.data);
              return pegObj.repetition(data, obj.punctuationMark);
          }          
        },

        // Block
        { type: 'Block',
          isType: function(t) { return t === this.type; },
          toPegObj: function(obj) {
              var data = convertToPegObj(obj.elements);
              return pegObj.enclosing(this.type, data);
          }
        },

        // Parentheses
        { type: 'Paren',
          isType: function(t) { return t === this.type; },
          toPegObj: function(obj) {
              var data = convertToPegObj(obj.elements);
              return pegObj.enclosing(this.type, data);
          }
        },

        // Bracket
        { type: 'Bracket',
          isType: function(t) { return t === this.type; },
          toPegObj: function(obj) {
              var data = convertToPegObj(obj.elements);
              return pegObj.enclosing(this.type, data);
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

        // LiteralKeyword
        { type: 'LiteralKeyword',
          isType: function(t) { return t === this.type; },
          toPegObj: function(obj) {
              return pegObj.string(obj.name, true);
          }
        },

        // Punctuator
        { type: 'Punctuator',
          isType: function(t) { return t === this.type; },
          toPegObj: function(obj) {
              return pegObj.string(obj.data, true);
          }
        },

        // BooleanLiteral
        { type: 'BooleanLiteral',
          isType: function(t) { return t === this.type; },
          toPegObj: function(obj) {
              return pegObj.string(obj.value, true);
          }
        },

        // NumericLiteral
        { type: 'NumericLiteral',
          isType: function(t) { return t === this.type; },
          toPegObj: function(obj) {
              return pegObj.number(obj.value);
          }
        },

        // StringLiteral
        { type: 'StringLiteral',
          isType: function(t) { return t === this.type; },
          toPegObj: function(obj) {
              return pegObj.string('\"'+ obj.value + '\"', true);
          }
        },

        // NullLiteral
        { type: 'NullLiteral',
          isType: function(t) { return t === this.type; },
          toPegObj: function(obj) {
              return pegObj.string('null', true);
          }
        },
        
        // RegularExpressionLiteral
        { type: 'RegularExpressionLiteral',
          isType: function(t) { return t === this.type; },
          toPegObj: function(obj) {
              return pegObj.string('/' + obj.body + '/' + obj.flags, true);
          }
        }
    ];

    var convertToPegObj = function(pattern) {

        if (pattern instanceof Array) {
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
        }
        return pegObj.null();            
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
                for (var j=0; j<syntaxRules.length; j++) {
                    patterns.unshift(pegObj.macroForm(macroName, convertToPegObj(syntaxRules[j].pattern)));
                }
                patterns = pegObj.choice(patterns);
                if (macroDef.type.indexOf('Expression') >= 0)
                    expressionMacros.push(patterns);
                else
                    statementMacros.push(patterns);
            }

            return pegjsTemplate
                + (expressionMacros.length > 0 ?  pegjsExpression + pegObj.choice(expressionMacros) + pegjsExpressions : '')
                + (statementMacros.length > 0 ? pegjsStatement + pegObj.choice(statementMacros) + pegjsStatements : '');
                
        } else {
            return 'error';
        }
    }

    return generator;
}());