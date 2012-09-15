#!/bin/sh

cwd=`pwd`
root=$cwd
module=`basename $root`
while [ `basename $root` != "ex-js" ]; do root=`dirname $root`; done

if [ "$1" == "--expanded" ]; then
    sed 's/^/    /' converted/$module.js
else
    sed 's/^/    /' $module.js
fi
