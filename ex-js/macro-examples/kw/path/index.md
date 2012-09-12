Title: The Path Macro
CSS: ../lib/jsx.css

# Path マクロ

このマクロは，道程のデータを配列として表現する目的で使います．

    Path 
        出発地点
        -> 中継地点1 : 交通手段
        -> 中継地点2 : 交通手段
        ...
        -> 目的地 : 交通手段

以下のデモでは，このように作成された交通手段の情報を利用して，HTMLの表を作成しています．

-----

# Demo

<div id="demo-area"></div>

-----

# JSX Code

<script src="../lib/jquery.min.js"></script>
<script src="converted/path-expanded.js"></script>
