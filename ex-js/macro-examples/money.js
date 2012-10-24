expression money {
    expression: n, e;
    literal: million, thousand, hundred;
    { money n million e ... - => n * 1000000 + (money e ... -) }
    { money n thousand e ... - => n * 1000 + (money e ... -) }
    { money n hundred e ... - => n * 100 + (money e ... -) }
    { money n - => n }
    { money - => 0 }
//    { money(e ...) => alert("syntax-error") }

}

console.log(money 100 million 5 thousand 3 hundred 1 -);
console.log(money 5 thousand -);
console.log(money 3 hundred -);

expression $ {
    expression: n, e;
    literal: million, thousand, hundred;
    { $ n million e ... - => n * 1000000 + ($ e ... -) }
    { $ n thousand e ... - => n * 1000 + ($ e ... -) }
    { $ n hundred e ... - => n * 100 + ($ e ... -) }
    { $ n - => n }
    { $ - => 0 }
}

console.log($ 100 million 5 thousand 3 hundred 1 -);
console.log($ 3 hundred -);
