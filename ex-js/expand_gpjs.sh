#!/usr/bin/env sh

path=/Users/homizu8/Dropbox/m-research/macro/pegjs/ex-js
export NODE_PATH=$NODE_PATH:$path
export YPSILON_LOADPATH=$YPSILON_LOADPATH:$path


if [ ! $# -eq 1 ]
then
    echo "Expected 1 argument, but got $# arguments"
    exit 1
fi

input_js=$1

dir=`dirname $input_js`
converted_dir=$dir/converted
base=`basename -s .js $input_js`
treefile=$converted_dir/$base.tree
sformfile=$converted_dir/$base-sform.scm
expandedfile=$converted_dir/$base-expanded.*

time $path/make_exjs_tree.js $input_js &&
time $path/convert-json-simple.scm $treefile &&
time $path/expand-scm-simple.scm $sformfile &&
chmod 644 $expandedfile

