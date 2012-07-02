expression let {
    identifier: id;
    expression: expr;
    statement: stmt;
    literal: var, and;

    {let (var [#id=expr#] and ...) {
        stmt ...
     } => ((function (id, ...) {
        stmt ...
     })(expr, ...))}
    
}

// or マクロの定義
expression or {
    identifier: temp;
    expression: exp1, exp2, exp3;
    
    {or() => false}
    {or(exp1) => exp1}
    {or(exp1, exp2, exp3, ...) => let (var temp = exp1) { return temp? temp : or(exp2, exp3, ...); }}

}

or (1, 2, 3)