// newobj マクロの定義
expression newobj {
    identifier: proto;
    expression: specs;
    
    {newobj(proto, specs) =>
     ((function () {
         var new_obj = { __proto__ : proto };
         for (var id in specs) new_obj[id] = specs[id];
         return new_obj;
     })())}
}

var obj1 = { x: 100, y:200 };
var obj2 = newobj(obj1, { z: 300 });

with (newobj(obj2, { w: 400 })) { console.log(x+w); }