Title: The SVG Macro

Smart Vector Graphicsを利用するためのマクロです．

    Rect x:20 y:20 width:100 height:80

    Circle cx:200 cy:60 r:40 fill:'white' stroke:'red' stroke_width:3

以下のデモでは，このような表現で長方形と円を描画できることを示します．

-----

#Demo

<svg id="svg" xmlns="http://www.w3.org/2000/svg" version="1.1"
     width="300" height="120">
</svg>

CodeSection
ExpandedSection

LoadJquery
Script(converted/svg-expanded.js)
