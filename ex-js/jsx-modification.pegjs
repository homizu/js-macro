/* Rewritten rules for jsx. */

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

BooleanLiteral //changed
  = TrueToken  { return { type: "BooleanLiteral", value: "true"  }; }
  / FalseToken { return { type: "BooleanLiteral", value: "false" }; }

DecimalLiteral //changed
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

Statement  
  = MacroStatement       // added
  / Block
  / VariableStatement
  / EmptyStatement
  / ExpressionStatement
  / IfStatement
  / IterationStatement
  / ContinueStatement
  / BreakStatement
  / ReturnStatement
  / WithStatement
  / LabelledStatement
  / SwitchStatement
  / ThrowStatement
  / TryStatement
  / DebuggerStatement
  / MacroDefinition      // added
  / FunctionDeclaration
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
////////////////////////////////////////////////////////////////////////////////////////////////////

