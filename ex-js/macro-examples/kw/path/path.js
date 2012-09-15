expression Path {
  expression: s, t, via;
  { Path s [# -> t : via #] ...
    => [ s, [t, via], ... ] }
}

$(function () {
    var path = (Path "新宿" -> "東京" : "中央線" -> "京都" : "新幹線");
    var $table, place;

    $('<p>').text('path = ' + JSON.stringify(path)).appendTo($('#demo-area'));

    $table = $('<table>').appendTo($('#demo-area'));
    place = path[0];
    path.shift();
    path.forEach(function (to_via) {
        var $tr = $('<tr>').appendTo($table);
        $('<td>').text(place).appendTo($tr);
        $('<td>').text(to_via[0]).appendTo($tr);
        $('<td>').text(to_via[1]).appendTo($tr);
        place = to_via[0];
      });
  });

// vim: shiftwidth=2
