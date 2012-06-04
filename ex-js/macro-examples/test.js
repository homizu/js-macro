// test マクロの定義
statement test {
    identifier: id;
    expression: expr1, expr2;
    statement: stmt;
    
    test (id, expr1, expr2, ...) {
        stmt ...
    } => {
        if (expr1) {
            id = expr1;
        }
        if (expr2) {
            id = expr2;
        }
        ...
        stmt
        ...
    }
}