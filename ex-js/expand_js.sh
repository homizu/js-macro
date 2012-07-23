#!/bin/sh

if [ $# -eq 1 ]
then
  JS_FILE=$1 &&
  ./make_exjs_tree.js $JS_FILE &&
  TREE_FILE=`echo $JS_FILE | sed -e "s/\/\([^/.]*\)\.js$/\/converted\/\1.tree/" -e "s/^\([^/.]*\)\.js$/converted\/\1.tree/"` &&
  ./convert-json.scm $TREE_FILE &&
  SFORM_FILE=`echo $TREE_FILE | sed -e "s/\.tree$/-sform.scm/"` &&
  ./expand-scm.scm $SFORM_FILE
else
  echo "Expected 1 argument, but got $# arguments"
  exit 1
fi