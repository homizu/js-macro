expression Path {
  expression: line, f, t;

  { path [# f -> t : line #] ...
    => [{ from: f, to: t, via: line }, ...] }
}

$(function () {
    var $table = $('<table>').appendTo($('#demo-area'));
    (Path
      "新宿" -> "東京" : "中央線"
      "東京" -> "京都" : "新幹線").forEach(function (train) {
          var $tr, $td;
          $tr = $('<tr>').appendTo($table);
          $td = $('<td>').appendTo($tr); $td.text(train.via);
          $td = $('<td>').appendTo($tr); $td.text(train.from);
          $td = $('<td>').appendTo($tr); $td.text(train.to);
        });
    });

// vim: shiftwidth=2
