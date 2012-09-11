statement test {
    identifier: x;
    { test x => { console.log(x);
                  var x = 100;
                  console.log(x); } }
}

(function (x) {test x})(1);

(function (x) {
    (function () { test x })();
})(1);

if (true) test x; // misplaced definition エラー