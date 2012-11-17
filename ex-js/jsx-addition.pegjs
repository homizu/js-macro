/* Additional rules for jsx. */

ExpressionToken = "expression"       !IdentifierPart { return "expression"; } // added by homizu
StatementToken  = "statement"        !IdentifierPart { return "statement"; } // added by homizu

Ellipsis // added
  = &{ return macroType; } __ "..."

CommaEllipsis // added
  = &{ return macroType; } __ "," __ "..."

DeclarationStatement // added
  = MacroDefinition
  / VariableStatement
  / FunctionDeclaration

MacroDefinition
  = type:(t:(ExpressionToken / StatementToken) {
        outerMacro = macroType; return macroType = t; }) __
    macroName:Identifier __ "{" __
    (MetaVariableDecralation __)*
    syntaxRules:SyntaxRuleList __ "}"
    c:CheckOuterMacro {
        if (c)
           throw new JSMacroSyntaxError(line, column, "Unexpected macro definition. The macro definition must not be in the macro's template."); 
        var type = type.charAt(0).toUpperCase() + type.slice(1) + "MacroDefinition";
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
  / "keyword" __ ":" __ list:LiteralKeywordList __ ";" {
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
  = head:SubPattern middle:(__ SubPattern)* ellipsis:(__ "..." { return { line: line, column: column }; })?
    tail:(__ SubPattern)* {
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
            if (!elements)
                throw new JSMacroSyntaxError(ellipsis.line, ellipsis.column, "Bad ellipsis usage. Something except punctuation marks must be before ellipsis.");
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
  / IdentifierVariable
  / ExpressionVariable
  / StatementVariable
  / SymbolVariable
  / name:LiteralKeyword &{ return metaVariables.literal.indexOf(name) >= 0; } {
        return {
            type: "LiteralKeyword",
            name: name
        };
    }
  / name:(IdentifierName / Punctuator / "," / ";" / "|") {
        return {
            type: "PunctuationMark",
            value: name
        };
    }

IdentifierVariable
  = name:IdentifierName &{ return metaVariables.identifier.indexOf(name) >= 0; } {
        return {
            type: "IdentifierVariable",
            name: name
        };
    }

ExpressionVariable
  = name:IdentifierName &{ return metaVariables.expression.indexOf(name) >= 0; } {
        return {
            type: "ExpressionVariable",
            name: name
        };
    }

StatementVariable
  = name:IdentifierName &{ return metaVariables.statement.indexOf(name) >= 0; } {
        return {
            type: "StatementVariable",
            name: name
        };
    }

SymbolVariable
  = name:IdentifierName &{ return metaVariables.symbol.indexOf(name) >= 0; } {
        return {
            type: "SymbolVariable",
            name: name
        };
    }

Punctuator
  =  puncs:PunctuatorSymbol+ !{ return puncs.join("") === "=>"; } { return puncs.join(""); }

PunctuatorSymbol
  = "<" / ">" / "=" / "!" / "+"
  / "-" / "*" / "%" / "&" / "/"
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

CheckOuterMacro
  = { return false; }

Errors
  = &{}

ForbiddenInStatement
  = VariableStatement {
      throw new JSMacroSyntaxError(line, column, buildMisplacedMessage("var declaration"));
    }
  / MacroDefinition {
      throw new JSMacroSyntaxError(line, column, buildMisplacedMessage("macro definition"));
    }
  / FunctionDeclaration {
      throw new JSMacroSyntaxError(line, column, buildMisplacedMessage("function declaration"));
    }
  / WithStatement {
      throw new JSMacroSyntaxError(line, column, "Invalid with statement. The with statement must not be used.");
    }

CharacterStatement
  = !ExcludeWord char:.
     { return { type: "Characterstmt", value: char }; }

ExcludeWord
  = EOS
  / CaseClause
  / DefaultClause

MacroExpression
  = &{}

MacroStatement
  = &{}

StatementInTemplate
  = &{ return macroType === "expression"; }
    e:(ae:AssignmentExpression (";" { 
        throw new JSMacroSyntaxError(line, column, "Unexpected semicolon. The expression macro's template must be an expression.");
       })? { return ae; }
       / Statement { throw new JSMacroSyntaxError(line, column, "Unexpected statement. The expression macro's template must be an expression."); }) {
      return e;
    }
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

