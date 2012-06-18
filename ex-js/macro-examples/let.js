// let マクロの定義
statement let {
    identifier: id;
    expression: expr;
    statement: stmt;
    literal: var, and;
    
    {let () {} => ((function() {})());}

    {let (var [#id = expr#] and ...) {
        stmt ...
     } => ((function (id, ...) {
        stmt ...
     })(expr, ...));}
}



// let マクロの使用
let (var id1=1 and id2=expr) {
    var result = id1 + id2;
    return result;
}

