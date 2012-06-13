/*
// test マクロの定義
statement test {
    identifier: id;
    expression: expr1, expr2;
    statement: stmt;
    
    test (id, expr1, expr2, ...) {
        id = ""
        stmt ...
        "hoge"
    } => {
        if (expr1) {
            id = expr1 + "hoge";
        }
        if (expr2) {
            id = expr2;
        }
        ...
        stmt
        ...
    }
}
*/
// let マクロの定義(イメージ)
statement let {
    identifier: id;
    expression: expr;
    statement: stmt;
    literal: var, and;
    
    {let () {} => ((function() {})());}

    {let (var [#id = expr#], ...) {
        stmt ...
     } => ((function (id, ...) {
        stmt ...
     })(expr, ...));}
}

/*
// let マクロの使用
let (var id1=expr1, id2=expr) {
    var result = id1 + id2;
    return result;
}
*/


// or マクロの定義
expression or {
    identifier: temp;
    expression: exp1, exp2;
    
    {or => false}
    {or(exp1) => exp1}
    {or(exp1, exp2, ...) => let (var temp = exp1) { return temp? temp : or(exp2, ...); }}

}