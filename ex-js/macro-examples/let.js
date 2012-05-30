// let マクロの定義(イメージ)
syntax let {
    identifier: id;
    expression: expr;
    statement: stmt1, stmt2;
    literal: var, =>>;

    let (var [#id = expr#] =>> ...) {
        stmt stmt2 ...
    } => ((function (id, ...) {
        stmt1 stmt2 ...
    })(expr, ...));
}

hoge1, (hoge2, hoge3)

/*
// let マクロの使用
let (var id1=expr1, var id2=expr) {
    var result = id1 + id2;
    return result;
}
*/
