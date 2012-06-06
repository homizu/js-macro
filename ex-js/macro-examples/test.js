// test マクロの定義
statement test {
    identifier: id;
    expression: expr1, expr2;
    statement: stmt;
    
    test (id, expr1, expr2, ...) {
        id = ""
        stmt ...
        "hoge"
    } => {
        if (expr1) {
            id = expr1 + "hoge";
        }
        if (expr2) {
            id = expr2;
        }
        ...
        stmt
        ...
    }
}