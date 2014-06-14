all: js

js: index.js
	
index.js: javascripts/index.js
	browserify -x jquery -x knockout -x jsml-jquery -x highlight.js -x grammar -x ML -x Sammy javascripts/index.js > javascripts/index.min.js
