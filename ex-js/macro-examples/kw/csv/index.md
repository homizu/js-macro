Title: The CSV Macro

CSV データを簡単に作成するためのマクロです．

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

DemoSection
CodeSection
ExpandedSection

LoadJQuery
Script(converted/csv.js)
