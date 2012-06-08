// let マクロの定義(イメージ)
statement let {
    identifier: id;
    expression: expr;
    statement: stmt;
    literal: var, and;
    
    let () {} => ((function() {})());

    let (var [#id = expr#], ...) {
        stmt ...
    } => ((function (id, ...) {
        stmt ...
    })(expr, ...));
}

let () {}

/*

// let マクロの使用
let (var id1=expr1, id2=expr) {
    var result = id1 + id2;
    return result;
}
*/
