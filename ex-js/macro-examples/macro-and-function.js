expression add {
    expression: x, y;
    { _ (x, y) => x + y }
}

console.log(add(1, 2));
    
function add (x, y) {
  console.log("This is add function.");
}

console.log(add(1, 2)); // マクロとして解析される


