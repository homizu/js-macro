expression path {
    expression: line, f, t;

    { path [# f -> t : line #] ...
      => [{ from: f, to: t, via: line }, ...] }
}

path "新宿"->"東京" : "中央線"
     "東京"->"京都" : "新幹線";