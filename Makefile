dist: src $(wildcard src/*)
	yarn run rollup -c

doc: src/doc.tsx $(wildcard src/*.ts*)
	yarn run typedoc --entryPoint react-oauth2-hook --theme markdown --out $@

src/doc.tsx: templates/pkgdoc_templ.jq pkginfo.json
	jq -r -f $^ > $@

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
