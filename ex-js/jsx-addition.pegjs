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
  = type:("identifier" / "expression" / "statement" / "symbol") __ ":" __ list:VariableList __ ";" { 
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
  / Punctuator

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
  = head:SubPattern middle:(__ SubPattern)* ellipsis:(__ "...")? tail:(__ SubPattern)* {
        var result = [head];
        for (var i=0; i<middle.length; i++) {
            result.push(middle[i][1]);
        }
        if (ellipsis) {
            var elements, mark=[];
            for (var i=result.length-1; i>=0; i--) {
                if (result[i].type === 'PunctuationMark') {
                    mark.push(result.pop().value);
                } else {
                    elements = result.pop();
                    break;
                }
            }
            if (!elements) throw new Error("Bad ellipsis usage in macro definition.");
            result.push({ type: "Repetition",
                          elements: elements,
                          punctuationMark: mark.reverse() });
            result.push({ type: "Ellipsis" });
        }
        for (var i=0; i<tail.length; i++) {
            result.push(tail[i][1]);
        }
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
  / name:IdentifierName {
        var type;
        if (metaVariables.identifier.indexOf(name) >= 0)
           type = 'IdentifierVariable';
        else if (metaVariables.expression.indexOf(name) >= 0)
           type = 'ExpressionVariable';
        else if (metaVariables.statement.indexOf(name) >= 0)
           type = 'StatementVariable';
        else if (metaVariables.symbol.indexOf(name) >= 0)
           type = 'SymbolVariable';
        else if (metaVariables.literal.indexOf(name) >= 0)
           type = 'LiteralKeyword';
        
        if (type)
           return {
               type: type,
               name: name
           };
        else
           return {
               type: "PunctuationMark",
               value: name
           };
    }
  / punc:(Punctuator / "," / ";") {
        if (metaVariables.literal.indexOf(punc) >= 0)
           return {
               type: "LiteralKeyword",
               name: punc
           };
        else
           return {
               type: "PunctuationMark",
               value: punc
           };
    }

Punctuator
  =  puncs:PunctuatorSymbol+ !{ return puncs.join("") === "=>"; } { return puncs.join(""); }

PunctuatorSymbol
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

MacroIdentifier
  = name:IdentifierName {
      return { type: "Variable", name: name };
    }

MacroSymbol
  = name:IdentifierName {
      return { type: "StringLiteral", value: name };
    }

MacroKeyword
  = name:LiteralKeyword {
      return { type: "LiteralKeyword", name: name };
    }

MacroEllipsis
  = "..." {
      return { type: "Repeat",
               elements: [{ type: "Ellipsis" }] };
    }
////////////////////////////////////////////////////////////////////////////////////////////////////

