expression money {
    expression: n, e;
    literal: million, thousand, hundred;
    { money(n million e ...) => n * 1000000 }
    { money(n thousand e ...) => n * 1000 }
    { money(n hundred e ...) => n * 100 }
}

console.log(money(100 million));
console.log(money(5 thousand));
console.log(money(3 hundred));
