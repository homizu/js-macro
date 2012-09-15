#!/bin/sh

cwd=`pwd`
root=$cwd
module=`basename $root`
while [ `basename $root` != "ex-js" ]; do root=`dirname $root`; done

sed 's/^/    /' converted/$module.js
