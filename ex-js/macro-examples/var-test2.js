(function (a) {
    console.log(a); // 1
    var a = 100;
    console.log(a); // 100
})(1);

/*
S式への変換例

((lambda (a)
    (define a '())
    (display a)    ;; ()
    (set! a 100)
    (display a)    ;; 100
) 1)

*/

// マクロ展開後
(function (a_60_123) {
    console.log(a_60_124); // undefined
    var a_60_124 = 100;
    console.log(a_60_124); // 100
})(1);