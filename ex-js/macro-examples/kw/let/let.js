expression Let {
    identifier: id;
    literal: and, In;
    expression: e, M;

    { Let [# id = e #] and ... In M =>
      (function (id, ...) { return M; })(e, ...)
    }
}

var $div = $('#demo-area');
var small = Number.MIN_VALUE;

if (false) ;  // A dirty get around the "bug-newline" issue.

$('<p>').text('small = ' + small).appendTo($div);

Let small = "ε" In
Let large = Number.MAX_VALUE In
$('<p>').text('small = ' + small + ', large = ' + large).appendTo($div);

$('<p>').text('small = ' + small).appendTo($div);
