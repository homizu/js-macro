// or マクロの定義
expression or {
    identifier: temp;
    expression exp1, exp2;
    
    or() => false;
    or(exp1) => exp1;
    or(exp1, exp2, ...) => let (var temp = exp1) { return temp? temp : or(exp2, ...); }

}