// block マクロの定義
statement block {
    identifier: id;
    expression: expr;
    statement: stmt;
    keyword: var;
    
    {block {
        [# var [# id = expr #], ... ;#]
        stmt ...
     } => ((function() {
        var id = expr, ...;
        stmt ...
     })());}
    
}

block { 
    var i =  100, j = 200,
    x = i+j;
　  return x;
}