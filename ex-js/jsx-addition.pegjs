/* Additional rules for jsx. */

ExpressionToken = "expression"       !IdentifierPart { return "expression"; } // added by homizu
StatementToken  = "statement"        !IdentifierPart { return "statement"; } // added by homizu

Ellipsis // added
  = &{ return macroType; } __ "..."

CommaEllipsis // added
  = &{ return macroType; } __ "," __ "..."

MacroDefinition
  = (type:(ExpressionToken / StatementToken) { macroType = type; }) __
    macroName:Identifier __ "{" __
    (MetaVariableDecralation __)*
    syntaxRules:SyntaxRuleList __ "}" { 
        var type = macroType.charAt(0).toUpperCase() + macroType.slice(1) + "MacroDefinition";
        var literals = metaVariables.literal;
        macroType = false;
        for (var i in metaVariables)
            metaVariables[i] = [];
        return { type: type,
                 macroName: macroName,
                 literals: literals,
                 syntaxRules: syntaxRules };
    }

MetaVariableDecralation
  = type:("identifier" / "expression" / "statement") __ ":" __ list:VariableList __ ";" { 
        metaVariables[type] = metaVariables[type].concat(list);
    }
  / "literal" __ ":" __ list:LiteralKeywordList __ ";" {
        metaVariables.literal = metaVariables.literal.concat(list);
    }

VariableList
  = head:IdentifierName tail:(__ "," __ IdentifierName)* {
        var result = [head];
        for (var i=0; i<tail.length; i++) {
            result.push(tail[i][3]);
        }
        return result;
    }

LiteralKeywordList
  = head:LiteralKeyword tail:(__ "," __ LiteralKeyword)* {
        var result = [head];
        for (var i=0; i<tail.length; i++) {
            result.push(tail[i][3]);
        }
        return result;
    }

// リテラルキーワード "=>" は禁止
LiteralKeyword
  = IdentifierName
  / PatternPunctuator

SyntaxRuleList
  = head:SyntaxRule tail:(__ SyntaxRule)* {
        var result = [head];
        for (var i=0; i<tail.length; i++) {
            result.push(tail[i][1]);
        }
        return result;
    }

SyntaxRule
  = "{" __ pat:Pattern __ "=>" __ temp:Template __ "}" {
        return { type: "SyntaxRule",
                 pattern: pat,
                 template: temp };
    }

// パターン
Pattern
  = ("_" / !"=>" Identifier) __ patterns:SubPatternList? { return patterns || []; }

SubPatternList
  = head:SubPattern middle:(__ (","/";")? __ SubPattern)*
    ellipsis:(__ PunctuationMark? __ "...")? tail:(__ (","/";")? __ SubPattern)* __
    semicolon: ";"? {
        var result = [head];
        for (var i=0; i<middle.length; i++) {
            if (middle[i][1])
               result.push({ type: "PunctuationMark", value: middle[i][1] });
            result.push(middle[i][3]);
        }
        if (ellipsis) {
           var last = result.pop();
           var mark = ellipsis[1];
           var elements = last;
           if (!mark && last.type === "LiteralKeyword") {
              var secondLast = result.pop();
              if (secondLast.type === "RepBlock") {
                 mark = last.name;
                 elements = secondLast.elements;
              } else {
                 result.push(secondLast);
              }
           } else if (last.type === "RepBlock")
             elements = last.elements;
           result.push({ type: "Repetition",
                         elements: elements,
                         punctuationMark: mark });
           result.push({ type: "Ellipsis" });
        }
        for (var i=0; i<tail.length; i++) {
            if (tail[i][1])
               result.push({ type: "PunctuationMark", value: tail[i][1] });
            result.push(tail[i][3]);
        }
        if (semicolon)
           result.push({ type: "PunctuationMark", value: ";" });
        return result;
     }

SubPattern
  = "[#" __ patterns: SubPatternList __ "#]" {
        return {
          type: "RepBlock",
          elements: patterns
        };
    }
  / g_open:("("/"{"/"[") __ patterns:SubPatternList? __ g_close:(")"/"}"/"]")
    &{ return group[g_open].close === g_close; } {
       return {
         type: group[g_open].type,
         elements: patterns !== "" ? patterns : []
       };
    }
  / Literal
  / name:IdentifierName
    &{ if (metaVariables.identifier.indexOf(name) >= 0) {
           return identifierType = 'IdentifierVariable';
       } else if (metaVariables.expression.indexOf(name) >= 0) {
           return identifierType = 'ExpressionVariable';
       } else if (metaVariables.statement.indexOf(name) >= 0) {
           return identifierType = 'StatementVariable';
       } else if (metaVariables.literal.indexOf(name) >= 0) {
           return identifierType = 'LiteralKeyword';
       }
    } {
      return {
          type: identifierType,
          name: name
      };                 
    }
  / punc:PatternPunctuator {
        return {
           type: "Punctuator",
           value: punc
        };
    }

PunctuationMark
  = ";"
  / ","
  / name:LiteralKeyword &{
      return metaVariables.literal.indexOf(name) >= 0;
    }{ return name; }

PatternPunctuator
  =  puncs:Punctuator+ !{ return puncs.join("") === "=>"; } { return puncs.join(""); }

Punctuator
  = "<" / ">" / "=" / "!" / "+"
  / "-" / "*" / "%" / "&" / "|"
  / "^" / "!" / "~" / "?" / ":"

// テンプレート(パーザー拡張前)
Template
  = head:Statement tail:(__ Statement)* {
      var result = [head];
      for (var i=0; i<tail.length; i++) {
          result.push(tail[i][1]);
      }
      return result;
    }

CharacterStatement
  = !ExcludeWord char:.
     { return { type: "Characterstmt", value: char }; }

ExcludeWord
  = EOS
  / ExpressionToken
  / StatementToken
  / CaseToken
  / DefaultToken

MacroExpression
  = &{}

MacroStatement
  = &{}

StatementInTemplate
  = &{ return macroType === "expression"; } e:AssignmentExpression { return e; }
  / &{ return macroType === "statement"; } s:Statement { return s; }

PatternIdentifier
  = name:IdentifierName {
      return { type: "Variable", name: name };
    }

PatternEllipsis
  = "..." {
      return { type: "Repeat",
               elements: [{ type: "Ellipsis" }] };
    }
////////////////////////////////////////////////////////////////////////////////////////////////////

