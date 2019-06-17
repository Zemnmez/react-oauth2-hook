header.md: README_TEMPL.jq package.json
	jq -r "$$(cat $<)" package.json > $@

jsdoc.md: $(wildcard src/*.js)
	npx jsdoc2md $^ > $@

README.md: header.md jsdoc.md
	cat $^ > $@
