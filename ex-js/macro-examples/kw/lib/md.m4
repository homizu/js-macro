m4_define(`DemoSection',
`-----

#Demo

<div id="demo-area"></div>
')m4_dnl
m4_define(`CodeSection',
`-----

#JSX Code

m4_esyscmd(../bin/code.sh)
')m4_dnl
m4_define(`ExpandedSection',
`-----

#Expanded JavaScript Code

m4_esyscmd(../bin/code.sh --expanded)
')m4_dnl
m4_define(`Script', `<script src="$1"></script>')m4_dnl
m4_define(`LoadJquery', `Script(../lib/jquery.min.js)')m4_dnl
m4_define(`LoadJQuery', `LoadJquery')m4_dnl
CSS: ../lib/jsx.css
