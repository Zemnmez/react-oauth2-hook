
dist: src $(wildcard src/*)
	yarn run rollup -c

header.md: README_TEMPL.jq package.json
	jq -r "$$(cat $<)" package.json > $@

.INTERMEDIATE: doc.json
doc.json: $(wildcard src/*.js)
	npx jsdoc -X $^ > $@

.INTERMEDIATE: doc-with-files.json
doc-with-files.json: doc.json $(wildcard src/*.js)
	jq "[., {files: {

README.md: templates/readme.jq doc.json
	jq -rf $^ > $@

.INTERMEDIATE: simple-bundle.js
simple-bundle.js: $(wildcard src/*.js)
	yarn run babel $^ -o $@

.INTERMEDIATE: pkginfo.json
pkginfo.json: example/src/App.js DESC.md
	jq '[.,                                           \
		{documentation: $$docs},                    \
		{example: $$example, examplefile: $$examplefile},       \
		{requirements: [.peerDependencies | keys][0]  }, \
		{year: $$year}                                  \
		] | add' package.json                         \
		--arg docs "$$(cat DESC.md)"                  \
		--arg example "$$(cat $<)"  \
		--arg examplefile "$$(basename $<)" \
		--arg year "$$(date +%Y)" > $@

src/doc.js: templates/pkgdoc_templ.jq pkginfo.json
	jq -r -f $^ > $@
