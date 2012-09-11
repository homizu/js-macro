expression Path {
  expression: line, f, t;

  { path [# f -> t : line #] ...
    => [{ from: f, to: t, via: line }, ...] }
}

$(function () {
    var $table = $('<table>').appendTo($('#demo-area'));
    (Path
      "Shinjuku" -> "Tokyo" : "Chuo line"
      "Tokyo" -> "Kyoto" : "Super Express").forEach(function (train) {
          var $tr, $td;
          $tr = $('<tr>').appendTo($table);
          $td = $('<td>').appendTo($tr); $td.text(train.via);
          $td = $('<td>').appendTo($tr); $td.text(train.from);
          $td = $('<td>').appendTo($tr); $td.text(train.to);
        });
    });

// vim: shiftwidth=2
