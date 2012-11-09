expression Let {
    identifier: id;
    literal: and, In;
    expression: e, M;

    { Let [# id = e #] and ... In M =>
      (function (id, ...) { return M; })(e, ...)
    }
}

expression Lets {
    identifier: id1, id2;
    literal: and, In;
    expression: e1, e2, M;
    
    { Lets id1 = e1 and [# id2 = e2 #] and ... In M =>
      (function (id1) { return (Lets id2 = e2 and ... In M); })(e2) }
}

var $div = $('#demo-area');
var small = Number.MIN_VALUE;

$('<p>').text('small = ' + small).appendTo($div);

Let small = "ε" In
Let large = Number.MAX_VALUE In
$('<p>').text('small = ' + small + ', large = ' + large).appendTo($div);

$('<p>').text('small = ' + small).appendTo($div);
