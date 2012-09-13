expression money {
    expression: n, e;
    literal: million, thousand, hundred;
    { money(n million e ...) => n * 1000000 + (money(e ...)) }
    { money(n thousand e ...) => n * 1000 + (money(e ...)) }
    { money(n hundred e ...) => n * 100 + (money (e ...)) }
    { money(e ...) => alart("syntax-error") }
    { money() => 0 }

}

console.log(money(100 million 5 thousand 3 hundred));
console.log(money(5 thousand));
console.log(money(3 hundred));
