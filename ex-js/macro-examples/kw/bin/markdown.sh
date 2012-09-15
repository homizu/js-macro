#!/bin/sh

/usr/bin/m4 -P -I ../lib md.m4 $1 | /usr/local/bin/multimarkdown > $2
