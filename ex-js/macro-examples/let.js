// let マクロの定義(イメージ)
syntax let {
    identifier: id;
    expression: expr;
    statement: stmt;

    let (var id = expr) {
        stmt
    } => ((function (id) {
        stmt
    })(expr));
}
/*
// let マクロの使用
let (var id1=expr1, var id2=expr) {
    var result = id1 + id2;
    return result;
}
*/