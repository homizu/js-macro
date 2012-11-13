expression let {
  identifier: v;
  expression: e1, e2;
  keyword: In;
  { let v = e1 In e2 =>
    (function (v) { return e2 })(e1) }
}

function SVG$Shape(type, plist) {
  var shape = document.createElementNS("http://www.w3.org/2000/svg", type);
  plist.forEach(function (attr_value) {
      shape.setAttribute(attr_value[0].replace(/_/g, '-'), attr_value[1]);
    });
  return shape;
}

expression Rect {
  expression: value;
  symbol: attr;
  { Rect [# attr: value #] ... => SVG$Shape('rect', [[attr, value], ...]) }
}

expression Circle {
  expression: value;
  symbol: attr;
  { Rect [# attr: value #] ... => SVG$Shape('circle', [[attr, value], ...]) }
}

$(function () {
    var add =
      let svg = $('#svg').get()[0] In
        function (shape) { svg.appendChild(shape); };

    add(Rect x:20 y:20 width:100 height:80 fill:'blue');
    add(Circle cx:200 cy:60 r:40 fill:'white' stroke:'red' stroke_width:3);
  });
