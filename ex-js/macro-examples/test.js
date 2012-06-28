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

expression let {
    identifier: id;
    expression: expr;
    statement: stmt;
    literal: var;

    {let (var id=expr) {
        stmt
     } => ((function (id) {
        stmt
     })(expr));}
    
}

let (var num=1E3) {
    return num * 3;
}


/*
// let マクロの定義(イメージ)
expression let {
    identifier: id;
    expression: expr;
    statement: stmt;
    literal: var, and;
    
    {let () {} => false;}

    {let (var [#id=expr#] and ...) {
        stmt ...
     } => ((function (id, ...) {
        stmt ...
     })(expr, ...));}
    
}

let () {}


// let マクロの使用
let (var id1="expr1" and id2=1E3) {
    var result = id1 + id2;
    return result;
}



// or マクロの定義
expression or {
    identifier: temp;
    expression: exp1, exp2;
    
    {or() => false}
    {or(exp1) => exp1}
    {or(exp1, exp2, ...) => let (var temp = exp1) { return temp? temp : or(exp2, ...); }}

}

*/