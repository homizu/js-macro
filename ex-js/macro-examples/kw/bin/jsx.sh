#!/bin/sh

PATH=$HOME/Software/bin:$PATH
root=`pwd`
module=`basename $root`
while [ `basename $root` != "ex-js" ]; do root=`dirname $root`; done

cd $root

./expand_gpjs.sh macro-examples/kw/$module/$module.js && \
    chmod 644 macro-examples/kw/$module/converted/$module-expanded.js
