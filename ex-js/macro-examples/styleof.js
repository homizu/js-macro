// styleof macro (using jQuery API)
expression styleof {
    expression: obj;
    symbol: name, val;
    { styleof obj : name = val => obj.css(name, val) }
    { styleof obj : name => obj.css(name) }
}

$("p").mouseover(function () {
  styleof $(this) : color = red;
});

console.log(styleof $("p") : color);