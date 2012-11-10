#!/usr/bin/env sh

# JSX environment varialbe should point to the path of the "ex-js" directory
# export JSX=$HOME/research/projects/jsx-homizu/ex-js
export NODE_PATH=/usr/local/lib/node_modules:$JSX

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

time $JSX/make_exjs_tree.js $input_js &&
time $JSX/convert-json-simple.scm $treefile &&
time $JSX/expand-scm-simple.scm $sformfile &&
chmod 644 $expandedfile

