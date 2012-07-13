/*// let マクロの定義
expression let {
    identifier: id;
    expression: expr;
    statement: stmt;
    literal: var, and;

    {let (var [#id = expr#] and ...) {
        stmt ...
     } => ((function (id, ...) {
        stmt ...
     })(expr, ...));}
}

// let マクロの使用
let (var id1=1/2 and id2=100E10) {
    var result = id1 + id2;
    result = result * 2;
    return result;
}
*/
expression let2 {
    identifier: id;
    expression: expr;
    statement: stmt;
    literal: var, and;

    {let2 [#id = expr#] and ...{
        stmt ...
     } => ((function (id, ..., x, y) {
        stmt ...
     })(expr, ..., 1, 2))}
}

let2 id1=1/2 and id2 = 100E10 {
    var result = id1 + id2;
    result = result * 2;
    return result;
}

