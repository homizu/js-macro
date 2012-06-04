// block マクロの定義
statement block {
    identifier: id;
    expression: expr;
    statement: stmt;
    literal: var;
    
    block {
        var id = expr; ...
        stmt ...
    } => ((function(id, ...) {
        stmt ...
    })(expr, ...));
    
}