expression Append {
    expression: obj, c1, c2;
    literal: to;
    { _ [] to obj => obj }
    { _ [c1, c2, ...] to obj => Append [c2, ...] to obj.append(c1) }
}

var $body = Append [$title, $menu, $main] to $('body');

expression Add {
    expression: obj, c1, c2;
    { _ obj <- [] => obj }
    { _ obj <- [c1, c2, ...] => Add obj.append(c1) <- [c2, ...] }
}

var $body2 = Add $('body') <- [$title, $menu, $main];

/*
expression add {
    expression: s,t,e1,e2,f1,f2;
    { _ s {} => s }
    { _ s { [#e1:f1#], [#e2:f2#], ... } => add s.attr(e1,f1) { e2:f2, ... } }
    { _ s <- t { [#e1:f1#], ... } => add s.append(t) { e1:f1, ... } }
}

expression Append {
    expression: s, t, e1, e2, f1, f2;

var svg  = add svg <- "g" { "height": 100 };
*/