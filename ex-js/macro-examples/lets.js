expression Let {
    identifier: id;
    expression: e, M;
    keyword: In, =;

    { Let [# id = e #] and ... In M =>
      [[id, e], ...]
    }
}

Let In 1+2;
Let x=1 In x*x;
Let x=1+2+3 and y=4*5*6 In y/x

expression test{
    identifier: id1, id2;
    expression: e1, e2, M;
    { test[id1, id2, ...][e1, e2, ...]M => Let id1 = e1 and id2 = e2 and ... In M }
}

test[x,][1,]x;
test[x,y][1,2]x+y;

expression Lets {
    identifier: id1, id2;
    keyword: In;
    expression: e1, e2, M;
    
    { Lets [# id1 = e1 #] and [# id2 = e2 #] and ... In M =>
      (function (id1) { return (Lets id2 = e2 and ... In M); })(e1) }
    { Lets In M => M }
}

Lets x = 1 and y = x*2 In y+y;
/*
var $div = $('#demo-area');
var small = Number.MIN_VALUE;

$('<p>').text('small = ' + small).appendTo($div);

Let small = "ε" In
Let large = Number.MAX_VALUE In
$('<p>').text('small = ' + small + ', large = ' + large).appendTo($div);

$('<p>').text('small = ' + small).appendTo($div);
*/