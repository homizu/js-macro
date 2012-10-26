expression Append {
    expression: obj, c1, c2;
    keyword: to;
    
//    { _ [] to obj => obj }
//    { _ [c1, c2, ...] to obj => Append [c2, ...] to obj.append(c1) }
    { _ to obj => obj }
    { _ c1 and c2 and ... to obj => Append c2 and ... to obj.append(c1) }
}

// var $body = Append [$title, $menu, $main] to $('body');
var $body = Append $title and $menu and $main to $('body');

