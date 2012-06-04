// newobj マクロの定義
expression newobj {
    identifier: proto;
    expression: specs;
    
    newobj(proto, specs) =>
    ((function () {
        var new_obj = { __proto__ : proto };
        var id;
        for (id in specs) new_obj[id] = specs[id];
        return new_obj;
    })());
}