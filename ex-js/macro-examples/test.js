statement some_macro {
    identifier: x;
    { _ (x) => {
                 console.log(x);
                 var x = 10;
               }
    }
}

expression my_display {
    { _ => console.log(x) }
}

var x = 100;
(function () {
    some_macro(x);
    console.log(x);
    my_display;
})();

var x = 200;
some_macro(x)
console.log(x);
my_display;

/*expression test {
    expression: e;
    literal: and;
    { test [# e #] and ... => console.log(e, ...) }
    { test [# e #] => console.log(e) }
}

(test 1+1 and 2);
*/


/*
// test マクロの定義
statement test {
    identifier: id;
    expression: expr1, expr2;
    statement: stmt;
    
    {test (id, expr1, expr2, ...) {
        stmt ...
    } => {
        if (expr1) {
            id = expr1 + "hoge";
        }
        if (expr2) {
            id = expr2;
        }
        ...
        }
    }
    
}

test (iidd, 1, 2, 3) {
    hogehoge;
}
*/



/*
var pi = 3.14;

expression let {
    identifier: id;
    expression: expr;
    statement: stmt;
    literal: var;

    {let (var id=expr) {
        stmt
     } => ((function (id) {
        stmt
     })(expr*pi))}
    
}

let (var num=1E3) {
    return num * 3;
}

{
    function hoge (x) { return x; }
    hoge(10);
}

for (var i=1;i<10;i++) {
    if (i==5)
        break;
    console.log("true");
}

statement test {
    identifier: x;
    
    {test(x)=>{
        var x = 10;
        var y = 20;
        (function dec (i) {
         if (i===0) return 0;
         else {
            console.log(i);
            return dec(i-1);
         } })(10)
    }}
}

test(z)

expression test2 {
    identifier: yyy;
    
    { test2(yyy) => function(yyy) {
        var xxx = 10;
        console.log(xxx);
        var t = function() {
        console.log(yyy);
        console.log(xxx);
        var xxx = 30;
        var yyy = 20;
        console.log(xxx, yyy);
        };
        t();
        console.log(yyy);
        console.log(xxx);
    }}
    }
    
var zzz = 1;
var f = test2(zzz);
f(zzz);
*/


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