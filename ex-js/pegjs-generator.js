module.exports = (function () {

    var generator = { debug: false };

    var peg_types = {
       
        // Grouping
        grouping: {
            type: 'grouping',
            toString: function() { return '( __' + this.data.toString() + '__ )'; }
        },
        
        // Zero-or-one
        optional: {
            type: 'zero-or-one',
            toString: function() { return  this.data.toString() + '?'; }
        },

        // Zero-or-more repetitions
        repetition: {
            type: 'zero-or-more',
            toString: function() { return  this.data.toString() + '*'; }
        },

        // Sequence
        sequence: {
            type: 'sequence',
            toString: function() { return this.left.toString() + ' ' + this.right.toString(); }
        },

        // Prioritized choice
        choice: { 
            type: 'prioritized-choice',
            toString: function() { return this.left.toString() + ' / ' + this.right.toString(); }
        }, 
        
        // White spaces
        whitespace: {
            type: '-whitespaces',
            toString: function() { return '__'; }
        },

        // Literal string
        literal_string: {
            type: 'literal-string',
            toString: function() { return '"' + this.data + '"'; }
        },

        // Literal number
        literal_number: {
            type: 'literal-number',
            toString: function() { return 'number:NumericLiteral &{ return (number - 0) === ' + this.data + '; }'; }
        },
        
        // Identifier
        identifier: {
            type: 'identifier',
            toString: function() { return 'IdentifierName'; }
        },

        // Expression
        expression: {
            type: 'expression',
            toString: function() { return 'Expression'; }
        },

        // Statement
        statement: {
            type: 'statement',
            toString: function() { return 'Statement'; }
        }
        
        
    };

var toStrings = {
       
        // Grouping
    grouping: function() { return '( __' + this.data.toString() + '__ )'; },
        
    // Zero-or-one
    optional: function() { return  '(' + this.data.toString() + ')?'; },
    
    // Zero-or-more repetitions
    repetition: function() { return  '(' + this.data.toString() + ')*'; },

    // Sequence
    sequence: function() { return this.left.toString() + ' ' + this.right.toString(); },

    // Prioritized choice
    choice: function() { return this.left.toString() + ' / ' + this.right.toString(); }, 
        
    // White spaces
    whitespace: function() { return '__';},

    // Literal string
    literal_string: function() { return '"' + this.data + '"'; },

    // Literal number
    literal_number: function() { return 'number:NumericLiteral &{ return (number - 0) === ' + this.data + '; }'; },
        
    // Identifier
    identifier: function() { return 'IdentifierName'; },

    // Expression
    expression: function() { return 'Expression'; },

    // Statement
    statement: function() { return 'Statement'; }
        
    };
    

    var js_macro_types = [
/*        // Ellipsis Scope
        { type: 'EllipsisScope',
          isType: function(t) { return t === this.type; }
        },
*/
        // Block
        { type: 'Block',
          isType: function(t) { return t === this.type; },
          toPegObj: function(obj) {
          }
        },

        // Parentheses
        { type: 'Paren',
          isType: function(t) { return t === this.type; }
        },

        // Bracket
        { type: 'Bracket',
          isType: function(t) { return t === this.type; }
        },

        // Identifier
        { type: 'Identifier',
          isType: function(t) { return t === this.type; },
          toPegObj: function(obj) {
              return {
                  data: obj.name,
                  toString: toStrings['identifier']
              };
          }
        },

        // Literal
        { type: 'Literal',
          isType: function(t) { return t === this.type; }
        },

        // Punctuator
        { type: 'Punctuator',
          isType: function(t) { return t === this.type; },
          toPegObj: function(obj) {
              return {
                  data: obj.data,
                  toString: toStrings['literal_string']
              }
          }
        },

        // Punctuation Mark
        { type: 'PunctuationMark',
          isType: function(t) { return t === this.type; }
        },

        // Ellipsis
        { type: 'Ellipsis',
          isType: function(t) { return t === this.type; },
          toPegObj: function(obj) {
              var data = convertPegObj(obj.data);
              var result = {
                  left: {
                      toString: toStrings['whitespace']
                  },
                  right: data,
                  toString: toStrings['sequence']
              };
              if (obj.punctuationMark) {
                  result = {
                      left: {
                          toString: toStrings['whitespace']
                      },
                      right: {
                          left: {
                              data: obj.punctuationMark,
                              toString: toStrings['literal_string']
                          },
                          right: result,
                          toString: toStrings['sequence']
                      },
                      toString: toStrings['sequence']
                  };
              }
              return {
                  data: {
                      left: data,
                      right:{
                          data: result,
                          toString: toStrings['repetition']
                      },
                      toString: toStrings['sequence']
                  },
                  toString: toStrings['optional']
              };
          }

        }

        
    ];

    var convertPegObj = function(pattern) {
        var result = null;
        if (pattern instanceof Array) {
            result = convertPegObj(pattern[0]);
            for (var i=1; i<pattern.length; i++) {
                result = {
                    left: {
                        left: result,
                        right: { toString: toStrings['whitespace'] },
                        toString: toStrings['sequence']
                    },
                    right: convertPegObj(pattern[i]),
                    toString: toStrings['sequence']
                };
            }
        } else if (pattern) {
            for (var i=0; i<js_macro_types.length; i++) {
                var type = js_macro_types[i];
                if (type.isType(pattern.type)) {
                    result = type.toPegObj(pattern);
                    break;
                }
            }
        }
        return result;            
    };



    generator.generate = function(tree) {


        var peg_tree;

        peg_tree = {
            left: {
                data: 100,
                toString: peg_types['literal_number'].toString
            },
            right: {
                left: {
                    data: "+",
                    toString: peg_types['literal_string'].toString
                },
                right: {
                    toString: peg_types['expression'].toString
                },
                toString: peg_types['sequence'].toString
            },

            toString: peg_types['sequence'].toString

        };

        var pattern =
            {
                  "type": "Ellipsis",
                  "data": [
                    {
                      "type": "Identifier",
                      "name": "id"
                    },
                    {
                      "type": "Punctuator",
                      "data": "="
                    },
                    {
                      "type": "Identifier",
                      "name": "expr"
                    }
                  ],
                  "punctuationMark": "and"
        };
       
        return convertPegObj(pattern).toString();
    }


    return generator;
}());