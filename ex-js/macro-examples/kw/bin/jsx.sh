#!/bin/sh

PATH=$HOME/Software/bin:$PATH
cwd=`pwd`
root=$cwd
module=`basename $root`
while [ `basename $root` != "ex-js" ]; do root=`dirname $root`; done

cd $root

./expand_gpjs.sh $cwd/$module.js &&
    chmod 644 $cwd/converted/$module-expanded.js
mv $cwd/converted/$module-expanded.js $cwd/converted/$module.js

#./expand_gpjs.sh macro-examples/kw/$module/$module.js && \
#    chmod 644 macro-examples/kw/$module/converted/$module-expanded.js
