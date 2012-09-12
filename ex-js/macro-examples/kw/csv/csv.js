expression CSV {
  expression: data;
  literal: EoD;
  { CSV [# data, ... #]; ... EoD; => [ [ data, ... ], ... ] }
  { CSV [# data, ... #]; ... ; EoD; => [ [ data, ... ], ... ] }
}

var csv1 = CSV
  "穂水", "homizu";
  "脇田", "wakita";
  "佐々木", "sasaki";
  "荒井", "arai"
EoD;

/*
 * 以下の例は最後のデータの末尾にセミコロンを追加した例．
 * マクロ定義にはこれにもマッチする規則を書いたつもりだが jsx は
 * マクロとして認識してくれない．
var csv2 = CSV
  "穂水", "homizu";
  "脇田", "wakita";
  "佐々木", "sasaki";
  "荒井", "arai";
EoD;
*/

if (false) ;  // Yet another nortorious work around...

$(function () {
    $('#demo-area').append($('<p>').text(JSON.stringify(csv1, null, 2)));
    // $('#demo-area').append($('<p>').text(JSON.stringify(csv2, null, 2)));
  });

// vim: shiftwidth=2
