// let マクロの定義
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
    expression: exp1, exp2;
    
    {or() => false}
    {or(exp1) => exp1}
    {or(exp1, exp2, ...) => let (var temp = exp1) { return temp? temp : or(exp2, ...); }}

}

let (var or = false and temp = 'okay') {
    return or(or, temp);
}
