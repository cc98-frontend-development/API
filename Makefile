all: js

js: index.js
	
index.js: javascripts/index.js
	browserify -x knockout -x jquery -x jsml-jquery -x highlight.js -x grammar -x Sammy javascripts/index.js > javascripts/index.min.js
