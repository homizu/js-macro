module.exports = (function () {

    var generator = { debug: false };

    var pegjsStatement = 'Statement\n = Block\n / VariableStatement\n / EmptyStatement\n / ExpressionStatement\n / IfStatement\n / IterationStatement\n / ContinueStatement\n / BreakStatement\n / ReturnStatement\n / WithStatement\n / LabelledStatement\n / SwitchStatement\n / ThrowStatement\n / TryStatement\n / DebuggerStatement\n / MacroDefinition\n / FunctionDeclaration\n / FunctionExpression\n';

    var pegjsExpression = 'AssignmentExpression\n = left:LeftHandSideExpression __\n operator:AssignmentOperator __\n right:AssignmentExpression {\n return {\n type:     "AssignmentExpression",\n operator: operator,\n left:     left,\n right:    right\n };\n }\n / ConditionalExpression\n';

    var pegObj = {
        
        // Grouping
        grouping: function(data) {
            return { 
                data: data,
                toString: function() { return '( __' + this.data.toString() + '__ )'; }
            };
        },
        
        // Zero-or-one
        optional: function(data) {
            return { 
                data: data,
                toString: function() { return  '(' + this.data.toString() + ')?'; }
            };
        },
        
        // Zero-or-more repetitions
        repetition: function(data) {
            return {
                data: data,
                toString: function() { return  '(' + this.data.toString() + ')*'; }
            };
        },
        
        // Sequence
        sequence: function(array) {
            var result = array[0];
            for (var i=1; i<array.length; i++) {
                result = {
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
                    left: result,
                    right: array[i],
                    toString: function() { return this.left.toString() + ' / ' + this.right.toString(); }
                };
            }
            return result;
        }, 
        
        // White spaces
        whitespace: function() {
            return {
                toString: function() { return '__';}
            };
        },
        
        // Literal string
        string: function(data) {
            return {
                data: data,
                toString: function() { return '"' + this.data + '"'; }
            };
        },
        
        // Literal number
        number: function(data) {
            return {
                data: data,
                toString: function() { return 'number:NumericLiteral &{ return (number - 0) === ' + this.data + '; }'; }
            };
        },
        
        // Identifier
        identifier: function() {
            return {
                toString: function() { return 'IdentifierName'; }
            };
        },
        
        // Expression
        expression: function() {
            return {
                toString: function() { return 'AssignmentExpression'; }
            };
        },
        
        // Statement
        statement: function() {
            return {
                toString: function() { return 'Statement'; }
            };
        },

        // Null Object
        'null': function() {
            return {
                toString: function() { return ''; }
            };
        }
    };
    
    
    var js_macro_types = [

        // Ellipsis
        { type: 'Ellipsis',
          isType: function(t) { return t === this.type; },
          toPegObj: function(obj) {
              var data = convertToPegObj(obj.data);
              var result = [pegObj.whitespace()];
              if (obj.punctuationMark) {
                  result.push(pegObj.string(obj.punctuationMark));
                  result.push(pegObj.whitespace());
              }
              result.push(data);
              result = pegObj.sequence(result);
              result = pegObj.repetition(result);
              result = pegObj.sequence([data, result]);
              return pegObj.optional(result);
          }          
        },

        // Block
        { type: 'Block',
          isType: function(t) { return t === this.type; },
          toPegObj: function(obj) {
              var data = convertToPegObj(obj.elements);
              return pegObj.sequence([pegObj.string('{'),
                                      pegObj.whitespace(),
                                      data,
                                      pegObj.whitespace(),
                                      pegObj.string('}')]);
          }
        },

        // Parentheses
        { type: 'Paren',
          isType: function(t) { return t === this.type; },
          toPegObj: function(obj) {
              var data = convertToPegObj(obj.elements);
              return pegObj.sequence([pegObj.string('('),
                                      pegObj.whitespace(),
                                      data,
                                      pegObj.whitespace(),
                                      pegObj.string(')')]);
          }
        },

        // Bracket
        { type: 'Bracket',
          isType: function(t) { return t === this.type; },
          toPegObj: function(obj) {
              var data = convertToPegObj(obj.elements);
              return pegObj.sequence([pegObj.string('{'),
                                      pegObj.whitespace(),
                                      data,
                                      pegObj.whitespace(),
                                      pegObj.string('}')]);
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
              return pegObj.string(obj.name);
          }
        },

        // Punctuator
        { type: 'Punctuator',
          isType: function(t) { return t === this.type; },
          toPegObj: function(obj) {
              return pegObj.string(obj.data);
          }
        },

        // BooleanLiteral
        { type: 'BooleanLiteral',
          isType: function(t) { return t === this.type; },
          toPegObj: function(obj) {
              return pegObj.string(obj.value);
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
              return pegObj.string('\"'+ obj.value + '\"');
          }
        },

        // NullLiteral
        { type: 'NullLiteral',
          isType: function(t) { return t === this.type; },
          toPegObj: function(obj) {
              return pegObj.string('null');
          }
        },
        
        // RegularExpressionLiteral
        { type: 'RegularExpressionLiteral',
          isType: function(t) { return t === this.type; },
          toPegObj: function(obj) {
              return pegObj.string('/' + obj.body + '/' + obj.flags);
          }
        }
    ];

    var convertToPegObj = function(pattern) {

        if (pattern instanceof Array) {
            var result = [convertToPegObj(pattern[0])];
            for (var i=1; i<pattern.length; i++) {
                result.push(pegObj.whitespace());
                result.push(convertToPegObj(pattern[i]));
            }
            return pegObj.sequence(result);
        } else if (pattern) {
            for (var i=0; i<js_macro_types.length; i++) {
                var type = js_macro_types[i];
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
                var macroName = pegObj.string(macroDef.macroName);
                var syntaxRules = macroDef.syntaxRules;
                var patterns;
                var pattern = syntaxRules[0].pattern
                if (pattern)
                    patterns = [pegObj.sequence([macroName,
                                                 pegObj.whitespace(),
                                                 convertToPegObj(pattern)])];
                else
                    patterns = [macroName];
                for (var j=1; j<syntaxRules.length; j++) {
                    pattern = syntaxRules[j].pattern;
                    if (pattern)
                        patterns.push(pegObj.sequence([macroName,
                                                       pegObj.whitespace(),
                                                       convertToPegObj(pattern)]));
                    else
                        patterns.push(macroName);
                }
                patterns = pegObj.choice(patterns);
               
                if (macroDef.type.indexOf('Expression') >= 0)
                    expressionMacros.push(patterns);
                else
                    statementMacros.push(patterns);
            }

            return (expressionMacros.length > 0 ? pegjsExpression + ' / ' + pegObj.choice(expressionMacros).toString() + '\n' : "")
                + (statementMacros.length > 0 ? pegjsStatement + ' / ' + pegObj.choice(statementMacros).toString() + '\n' : "");
                
        } else {
            return 'error';
        }
                    
/*

        var pattern =
            {
                  "type": "Ellipsis",
                  "data": [
                    {
                      "type": "IdentifierVariable",
                      "name": "id"
                    },
                    {
                      "type": "Punctuator",
                      "data": "="
                    },
                    {
                      "type": "ExpressionVariable",
                      "name": "expr"
                    }
                  ],
                  "punctuationMark": "and"
        };

        var pattern2 = 
            {
              "type": "Block",
              "elements": [
                {
                  "type": "Ellipsis",
                  "data": {
                    "type": "StatementVariable",
                    "name": "stmt"
                  },
                  "punctuationMark": ""
                }
              ]
            };
       
        var pegObj = convertToPegObj(pattern);
        if (pegObj)
            return pegObj.toString();
        else
            return "";

*/
    }


    return generator;
}());