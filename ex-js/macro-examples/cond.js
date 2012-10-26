// cond マクロの定義
statement cond {
    expression: pred1, pred2, exp1, exp2;
    keyword: ->;
    
    {cond{ [#pred1 -> exp1#] } =>
     if (pred1) {
        exp1;
     }}
    
    {cond{ [#pred1 -> exp1#], [#pred2 -> exp2#], ... } =>
     if (pred1) {
         exp1;
     } else {
         cond{ pred2 -> exp2, ... }
     }}
    
}

cond{ false -> console.log(1),
     true -> console.log(2) }