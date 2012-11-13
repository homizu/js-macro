/* Rewritten rules for jsx. */

UnicodeLetter
  = Lu
  / Ll
  / Lt
  / Lm
  / Lo
  / Nl
  / Kanji

Keyword
  = (
        "break"
      / "case"
      / "catch"
      / "continue"
      / "debugger"
      / "default"
      / "delete"
      / "do"
      / "else"
      / "expression" // added by homizu
      / "finally"
      / "for"
      / "function"
      / "if"
      / "instanceof"
      / "in"
      / "new"
      / "return"
      / "statement" // added by homizu
      / "switch"
      / "this"
      / "throw"
      / "try"
      / "typeof"
      / "var"
      / "void"
      / "while"
      / "with"
    )
    !IdentifierPart

Literal // changed
  = NullLiteral
  / BooleanLiteral
  / NumericLiteral
  / StringLiteral
  / RegularExpressionLiteral

BooleanLiteral // changed
  = TrueToken  { return { type: "BooleanLiteral", value: "true"  }; }
  / FalseToken { return { type: "BooleanLiteral", value: "false" }; }

NumericLiteral "number" // changed
  = literal:(HexIntegerLiteral / DecimalLiteral) !IdentifierStart {
      return { type: "NumericLiteral",
               value: literal };
    }

DecimalLiteral // changed
  = before:DecimalIntegerLiteral
    "."
    after:DecimalDigits?
    exponent:ExponentPart? {
        return before + "." + after + exponent;
    }
  / "." after:DecimalDigits exponent:ExponentPart? {
      return "." + after + exponent;
    }
  / before:DecimalIntegerLiteral exponent:ExponentPart? {
      return before + exponent;
    }

HexIntegerLiteral //changed
  = "0" [xX] digits:HexDigit+ { 
      return "0x" + digits.join("");
    }

StringLiteral "string" // changed
  = parts:('"' DoubleStringCharacters? '"' / "'" SingleStringCharacters? "'") {
      return { type: "StringLiteral",
               value: parts[1] };
    }

RegularExpressionLiteral "regular expression" //changed
  = "/" body:RegularExpressionBody "/" flags:RegularExpressionFlags {
      return {
        type:  "RegularExpressionLiteral",
        value: "/" + body + "/" + flags
      };
    }

ElementList // changed
  = (Elision __)?
    head:AssignmentExpression ellipsis:CommaEllipsis?
    tail:(__ "," __ Elision? __ AssignmentExpression CommaEllipsis?)* {
        return makeElementsList(head, ellipsis, tail, 5, 6);
    }

PropertyNameAndValueList // changed
  = head:PropertyAssignment ellipsis:CommaEllipsis?
    tail:(__ "," __ PropertyAssignment CommaEllipsis?)* {
        return makeElementsList(head, ellipsis, tail, 3, 4);
    }

PropertyName // changed
  = name:IdentifierName { return { type: "PropertyIdentifier", name: name }; }
  / StringLiteral
  / NumericLiteral

ArgumentList // changed
  = head:AssignmentExpression ellipsis:CommaEllipsis?
    tail:(__ "," __ AssignmentExpression CommaEllipsis?)* {
        return makeElementsList(head, ellipsis, tail, 3, 4);
    }

AssignmentExpression
  = MacroExpression // add
  / left:LeftHandSideExpression __
    operator:AssignmentOperator __
    right:AssignmentExpression {
      return {
        type:     "AssignmentExpression",
        operator: operator,
        left:     left,
        right:    right
      };
    }
  / ConditionalExpression

Expression // changed
  = head:IdentifierName &{ return metaVariables.statement.indexOf(head) >= 0;} ellipsis:Ellipsis?
    tail:(__ name:IdentifierName &{ return metaVariables.statement.indexOf(name) >= 0; } Ellipsis?)* {
      return {
        type: "Statements",
          elements: makeElementsList(head, ellipsis, tail, 1, 3)
      };
    }
  / head:AssignmentExpression ellipsis:CommaEllipsis?
    tail:(__ "," __ AssignmentExpression CommaEllipsis?)* {
      var result = head;
      if (ellipsis || tail.length > 0) {
         result = {
           type: "Expressions",
           elements: makeElementsList(head, ellipsis, tail, 3, 4)
         };
       }
      return result;
    }

ExpressionNoIn // changed  // for in で使う
  = head:AssignmentExpressionNoIn ellipsis:CommaEllipsis?
    tail:(__ "," __ AssignmentExpressionNoIn CommaEllipsis?)* {
      var result = head;
      if (ellipsis || tail.length > 0) {
         result = {
           type: "Expressions",
           elements: makeElementsList(head, ellipsis, tail, 3, 4)
         };
      }
      return result;
    }

Statement // changed
  = MacroStatement       // added
  / Block
  / VariableStatement {
      throw new JSMacroSyntaxError(line, column, buildMisplacedMessage("var declaration"));
    }
  / EmptyStatement
  / ExpressionStatement
  / IfStatement
  / IterationStatement
  / ContinueStatement
  / BreakStatement
  / ReturnStatement
  / WithStatement {
      throw new JSMacroSyntaxError(line, column, "Invalid with statement. The with statement must not be used.");
    }
  / LabelledStatement
  / SwitchStatement
  / ThrowStatement
  / TryStatement
  / DebuggerStatement
  / MacroDefinition {
      throw new JSMacroSyntaxError(line, column, buildMisplacedMessage("macro definition"));
    }
  / FunctionDeclaration {
      throw new JSMacroSyntaxError(line, column, buildMisplacedMessage("function declaration"));
    }
  / FunctionExpression
  / CharacterStatement   // added

StatementList // changed
  = head:Statement ellipsis:Ellipsis?
    tail:(__ Statement Ellipsis?)* {
      return makeElementsList(head, ellipsis, tail, 1, 2);
    }

VariableDeclarationList // changed
  = head:VariableDeclaration ellipsis:CommaEllipsis?
    tail:(__ "," __ VariableDeclaration CommaEllipsis?)* {
      return makeElementsList(head, ellipsis, tail, 3, 4);
    }

VariableDeclarationListNoIn // changed
  = head:VariableDeclarationNoIn ellipsis:CommaEllipsis?
    tail:(__ "," __ VariableDeclarationNoIn CommaEllipsis?)* {
      return makeElementsList(head, ellipsis, tail, 3, 4);
    }

ForStatement // changed
  = ForToken __
    "(" __
    initializer:(
        VarToken __ VariableDeclarationListNoIn {
          throw new JSMacroSyntaxError(line, column, buildMisplacedMessage("var declaration"));
        }
      / ExpressionNoIn?
    ) __
    ";" __
    test:Expression? __
    ";" __
    counter:Expression? __
    ")" __
    statement:Statement
    {
      return {
        type:        "ForStatement",
        initializer: initializer !== "" ? initializer : null,
        test:        test !== "" ? test : null,
        counter:     counter !== "" ? counter : null,
        statement:   statement
      };
    }

ForInStatement // changed
  = ForToken __
    "(" __
    iterator:(
        VarToken __ VariableDeclarationNoIn {
          throw new JSMacroSyntaxError(line, column, buildMisplacedMessage("var declaration"));
        }
      / LeftHandSideExpression
    ) __
    InToken __
    collection:Expression __
    ")" __
    statement:Statement
    {
      return {
        type:       "ForInStatement",
        iterator:   iterator,
        collection: collection,
        statement:  statement
      };
    }

FunctionDeclaration // changed
  = FunctionToken __ name:Identifier __
    "(" __ params:FormalParameterList? __ ")" __
    "{" __ elements:FunctionBody __ "}" {
      return {
        type:     "FunctionDeclaration",
        name:     name,
        params:   params !== "" ? params : [],
        elements: elements
      };
    }

FormalParameterList // changed
  = head:Identifier ellipsis:CommaEllipsis?
    tail:(__ "," __ Identifier CommaEllipsis?)* {
      return makeElementsList(head, ellipsis, tail, 3, 4);
    }

FunctionBody // changed
  = declarations:(DeclarationStatement __)* statements:(Statement __)* {
      var elements = [];
      for (var i = 0; i < declarations.length; i++) {
          elements.push(declarations[i][0]);
      }
      for (i = 0; i < statements.length; i++) {
          elements.push(statements[i][0]);
      }
      return elements;
    }

SourceElements // changed (The SourceElement is not used in the parser because of optimization.)
    = head:(DeclarationStatement / Statement) tail:(__ (DeclarationStatement / Statement))* {
      var result=[head];
      for (var i = 0; i < tail.length; i++) {
        result.push(tail[i][1]);
      }
      return result;
    }

////////////////////////////////////////////////////////////////////////////////////////////////////

