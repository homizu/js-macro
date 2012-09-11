#!/bin/sh

PATH=$HOME/Software/bin:$PATH
cwd=`pwd`
module=`basename $cwd`
cd $HOME/research/projects/jsx-homizu/ex-js
./expand_gpjs.sh macro-examples/kw/$module/$module.js
chmod 644 macro-examples/kw/$1/converted/$module-expanded.js
