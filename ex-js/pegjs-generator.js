var generator = { debug: false };

(function () {

    var js_macro_types = [
        // Ellipsis Scope
        { type: 'EllipsisScope',
          isType: function(t) { return t === this.type; }
        },

        // Block
        { type: 'Block',
          isType: function(t) { return t === this.type; }
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
        { type; 'Identifier',
          isType: function(t) { return t === this.type; }
        },

        // Literal
        { type: 'Literal',
          isType: function(t) { return t === this.type; }
        },

        // Punctuator
        { type: 'Punctuator',
          isType: function(t) { return t === this.type; }
        },

        // Punctuation Mark
        { type: 'PunctuationMark',
          isType: function(t) { return t === this.type; }
        },

        // Ellipsis
        { type: 'Ellipsis',
          isType: function(t) { return t === this.type; }
        }

        
    ];

    var pe_types = [
        // White spaces
        { type: '-whitespaces',
          toString: function() { return '__'; }
        },

        // Literal string
        { type: 'literal-string',
          toString: function() { return '"' + this.data + '"'; }
        },

        // Literal number
        { type: 'literal-number',
          toString: function() { return 'number:NumericLiteral &{ return number === ' + this.data + '; }' ;}
        },
        
        // Grouping
        { type: 'grouping',
          toString: function() { return '( __' + this.data.toString() + '__ )'; }
        },

        // Zero-or-more repetitions
        { type: 'zero-or-more',
          toString: function() { return  this.data.toString() + '*'; }
        },

        // Sequence
        { type: 'sequence',
          toString: function() { return this.left.toString() + ' ' + this.right.toString(); }
        },

        // Prioritized choice
        { type: 'prioritized-choice',
          toString: function() { return this.left.toString() + ' / ' + this.right.toString(); }
        } 
    ];

}());