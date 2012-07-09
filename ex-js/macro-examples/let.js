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
let (var id1=1/2 and id2=100E10) {
    var hoge,result = id1 + id2;
    result = result * 2;
    return result;
}

1,2,3
1,(2,3)