var f = function (e) {
    try {
        console.log(e);
        throw { message: "error" };
    } catch (e) {
        console.log(e.message);
    }
}

f(1);

/*
マクロ展開後
var f = function (e_65__67_) {
  try {
    (console.log (e_65__67_));
    throw { message: "error" };
  } catch (e_65__67_) {
    (console.log (e_65__67_.message));
  }
};
(f (1));

動くことは動くが，catch節の引数は別の変数名にしたい．