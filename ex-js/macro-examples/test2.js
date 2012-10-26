var 京都 = 1;
console.log(京都*2);
console.log("[\n]");
console.log('[\n]');
//var x = hoge();
-1;
//hoge();

expression hoge {
    expression: s,p,e1,e2,f1,f2;
    { _ (s) {} => s }
    { _ (s) { [#e1 : f1#], [#e2:f2#], ... } => hoge(s.attr(e1,f1)) { e2:f2, ... } }
    { _ (s,p) { [#e1 : f1#], ... } => hoge(s.append(p)) { e1:f1, ... } }
}

console.log(1);
hoge()
hoge(svg) { "class": "title", "dy": ".71em" }
hoge(d3,"svg") { "class": "title", "dy": ".71em" }
(hoge(d3,"svg") {}).style()
/*
var b = a + a;
var a,b,c = 1;

function add (x) { return x+x; }
add(10);

expression inc {
{ inc => x++ }
}

statement test {
    identifier: x;
    { test x => { console.log(x);
                  var x = 100;
                  console.log(x); } }
}

(function (x) {test x})(1);
*/