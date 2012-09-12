#!/usr/bin/env sh

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

./make_exjs_tree.js $input_js &&
./convert-json-simple.scm $treefile &&
./expand-scm-simple.scm $sformfile

