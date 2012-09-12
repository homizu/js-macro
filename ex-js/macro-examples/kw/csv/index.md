Title: The CSV Macro
CSS: ../lib/jsx.css

# CSV マクロ

このマクロは，CSV データを簡単に作成するためのものです．

    CSV
        d11, d12, ...;
        d21, d22, ...;
        ...
        d91, d92, ...
    EoD

## バグ

- csv.js に書いたセミコロン問題

- カンマなしのバージョンを定義しようとしたら失敗した．もしかして ... の直前には literal が必須？

- シンボルをサポートしてくれるとさらにいいのだけれど

-----

# Demo

<div id="demo-area"></div>

-----

# JSX Code

<script src="../lib/jquery.min.js"></script>
<script src="converted/csv-expanded.js"></script>
