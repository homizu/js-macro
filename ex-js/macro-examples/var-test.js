// let マクロの定義
expression let {
    identifier: id;
    expression: expr;
    statement: stmt;
    literal: var, and;

    {let (var [#id = expr#] and ...) {
        stmt ...
     } => ((function (id, ...) {
        stmt ...
     })(expr, ...))}
}

var x = 100;

statement inc {
    { inc => { var x = 2; x++; } }
}

let (var x = 1) {
(function() {
x++;
console.log(x);
var x = 10;
x++;
inc;
console.log(x);
})();
console.log(x);
};

inc;
console.log(x);

(function(x) {
  (function () {
    console.log(x);
    inc;
    console.log(x);
  })();
})();

(function() {
    var x;
})();