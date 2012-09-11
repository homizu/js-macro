function hoge () {
  console.log("hoge");
}

var f = function () { console.log(1); };

function g () { console.log(2); }

var h = function h () { console.log(3); };


(function () {
    var f = function () { console.log(1); };

    function g () { console.log(2); }

    var h = function h () { console.log(3); };
})();
