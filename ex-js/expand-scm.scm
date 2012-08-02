#!/usr/bin/env ypsilon

;; JSタグ付きS式をマクロ展開し，JavaScriptコードに変換するプログラム．
;; 引数のscmファイルが存在するフォルダと同じフォルダに以下の2ファイルを生成する．
;; XXX-expanded.scm: JSタグ付きS式をマクロ展開したS式
;; XXX-expanded.js : マクロ展開後のS式をJavaScriptに変換したもの

(import (pregexp))
(import (time))
(load "./common.scm")
(load "./scheme-to-js.scm")

(define debug #t) ;; 結果を表示するかどうか
(define regexp-replace pregexp-replace) ;; racketとの互換性をもたせる
(define (open-output-port output)
  (transcoded-port (open-file-output-port output (file-options no-fail))
                   (make-transcoder (utf-8-codec))))

;; JSタグ付きS式をマクロ展開し，JavaScriptに変換
(define (expand-scm sform-file-path) ;; 引数のファイル名は -sform.scm で終わる
  (let* ((in (transcoded-port (open-file-input-port sform-file-path)
                              (make-transcoder (utf-8-codec))))
         (expanded (macro-expand (read in)))
         (js (scheme-to-javascript expanded)))
    (write-file (change-suffix sform-file-path "-expanded.scm") expanded pretty-print)
    (write-file (change-suffix sform-file-path "-expanded.js") js display)
    (close-input-port in)))

(define (main args)
  (time (begin (expand-scm (cadr args)) (display "MacroExpand and Scheme->JavaScript"))))

(main (command-line))


