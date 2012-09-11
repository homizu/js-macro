var g = function(i) {
    console.log(i);
    with (o = { i: 100, j: 200 }) {
        console.log(i); i=i*3;
    }
    console.log(o.i);
}

g(1);

g = function (e) { with (e) { console.log(i); } }

/* 
JSで実行すると以下のようになる．
1
100
300

しかし，本システムで展開すると以下のようになり，本来のコードとは異なる結果が出る．
var g = function (i_65__67_) {
  (console.log (i_65__67_));
  with ((o = { i: 100, j: 200 })) {
    (console.log (i_65__67_));
    (i_65__67_ = (i_65__67_ * 3));
  }
  (console.log (o.i));
};
(g (1));

1
1
100
*/

