/* Initializer for jsx (JavaScript with a macro system) */

{
  var group = { "(": { close: ")", type: "Paren" }, 
                "{": { close: "}", type: "Brace" },
                "[": { close: "]", type: "Bracket"} }; // 括弧を表すオブジェクト
  var macroType = false;                // マクロの種類(expression, statement)を表す変数
  var metaVariables = { identifier: [],
                        expression: [], 
                        statement: [], 
                        literal: [] };  // メタ変数のリストを保持するオブジェクト
  var identifierType = "";              // パターン中の識別子の種類を表す変数

  // ...が出現する要素の並びからリストを作る関数
  var makeElementsList = function (head, ellipsis, tail, elementIndex, ellipsisIndex) {
      var elements = [head];
      if (ellipsis)
         elements.push({ type: "Ellipsis" });
      for (var i=0; i<tail.length; i++) {
          elements.push(tail[i][elementIndex]);
          if (tail[i][ellipsisIndex])
             elements.push({ type: "Ellipsis" });
      }
      return elements;
  }
}
////////////////////////////////////////////////////////////////////////////////////////////////////

