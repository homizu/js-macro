#!/usr/bin/env sh

expand_times=1 # number of macro-expand times. 1 or 2

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

if [ $expand_times -eq 1 ]
then
    ./convert-json-gp.scm $treefile &&
    ./expand-scm.scm $sformfile
else
    ./convert-json.scm $treefile &&
    ./expand-scm-2times.scm $sformfile
fi
