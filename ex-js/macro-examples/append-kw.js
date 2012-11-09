expression Append {
    expression: dom, c1, c2;
    keyword: to;
    { _ to dom => dom }
    { _ c1, c2, ... to dom => Append c2 , ... to dom.append(c1) }
}

var pageBody = Append title, menu, main to jQuery('body');

