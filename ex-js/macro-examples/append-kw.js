expression Append {
    expression: obj, c1, c2;
    literal: to;
    { _ to obj => obj }
    { _ c1, c2, ... to obj => Append c2 , ... to obj.append(c1) }
}

var $body = Append $title, $menu, $main to $('body');

