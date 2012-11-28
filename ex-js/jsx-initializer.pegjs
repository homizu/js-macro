/* Initializer for jsx (JavaScript with a macro system) */

{
  var group = { "[#": { close: "#]", type: "RepBlock" },
                "(": { close: ")", type: "Paren" }, 
                "{": { close: "}", type: "Brace" },
                "[": { close: "]", type: "Bracket"} }; // 括弧を表すオブジェクト
  var macroType = false;                // マクロの種類(expression, statement)を表す変数
  var outerMacro = false;               // マクロ内マクロを検出するための変数
  var metaVariables = { identifier: [],
                        expression: [], 
                        statement: [],
                        symbol: [],
                        literal: [] };  // メタ変数のリストを保持するオブジェクト

  // ...が出現する要素の並びからリストを作る関数
  var makeElementsList = function (head, ellipsis, tail, elementIndex, ellipsisIndex) {
      var elements = [head];
      if (ellipsis) {
          elements.push({ type: "Ellipsis" });
          for (var i=0; i<ellipsis[2].length; i++) {
              elements.push({ type: "Ellipsis" });
          }
      }
      for (var i=0; i<tail.length; i++) {
          elements.push(tail[i][elementIndex]);
          if (tail[i][ellipsisIndex]) {
              elements.push({ type: "Ellipsis" });
              for (var j=0; j<tail[i][ellipsisIndex][2].length; j++) {
                  elements.push({ type: "Ellipsis" });
              }
          }
      }
      return elements;
  }

  // シンタックスエラーを表すオブジェクト
  function JSMacroSyntaxError(line, column, message) {
      this.line = line;
      this.column = column;
      this.message = message;
  }

  // misplacedエラーのメッセージを作成する関数
  var buildMisplacedMessage = function (name) {
      return "Misplaced " + name + ". The " + name + " must be at the top of the function body or in the body of the top-level program.";
  } 

  // line, column がないときのための予備
  var line = undefined, column = undefined;
}
////////////////////////////////////////////////////////////////////////////////////////////////////

