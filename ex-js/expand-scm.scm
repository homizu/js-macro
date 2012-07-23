#!/usr/local/bin/ypsilon

;; JSタグ付きS式をマクロ展開し，JavaScriptコードに変換するプログラム．
;; 引数のscmファイルが存在するフォルダと同じフォルダに以下の2ファイルを生成する．
;; XXX-expanded.scm: JSタグ付きS式をマクロ展開したS式
;; XXX-expanded.js : マクロ展開後のS式をJavaScriptに変換したもの

(import (pregexp))
(load "./scheme-to-js.scm")

(define (expand-scm scm-file-path)
  (let* ((file-name (car (pregexp-split "-sform\\.scm" scm-file-path)))
         (in (transcoded-port (open-file-input-port scm-file-path)
                              (make-transcoder (utf-8-codec))))
         (scm-out (transcoded-port (open-file-output-port
                                    (string-append file-name "-expanded.scm")
                                    (file-options no-fail))
                                   (make-transcoder (utf-8-codec))))
         (js-out (transcoded-port (open-file-output-port
                                   (string-append file-name "-expanded.js")
                                   (file-options no-fail))
                                  (make-transcoder (utf-8-codec))))
         (sform (read in))
         (expanded (macro-expand sform))
         (js (scheme-to-javascript expanded)))
    (pretty-print expanded scm-out)
    (pretty-print sform)
    (newline)
    (newline)
    (pretty-print expanded)
    (newline)
    (newline)
    (display js js-out)
    (display "JS\n")
    (display js)
    (newline)
    (close-input-port in)
    (close-output-port scm-out)
    (close-output-port js-out)))

(define (main args)
  (expand-scm (cadr args)))

(main (command-line))


