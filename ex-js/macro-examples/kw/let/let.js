expression let {
    statement: stmt;
    identifier: id;
    literal: and;
    expression: e;

    { let [#id = e#] and ... {
          stmt ...
      } =>
      ((function (id, ...) {
            stmt ...
        })(e, ...))}
}

let id1=1/2 and id2=100E10 {
    return id1 + id2;
}
