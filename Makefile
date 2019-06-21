dist: src $(wildcard src/*)
	yarn run rollup -c

.INTERMEDIATE: docs
docs: src/doc.tsx $(wildcard src/*.ts*)
	- rm README.md # for some reason it ignores --entrypoint if there's an existing readme...
	yarn run typedoc --entryPoint 'react-oauth2-hook' --theme markdown --out docs/
	cp docs/* .
	rm -r docs

README.md: docs
	# by default, typedoc makes the header of the module a second-level
	# header and puts it in a quote. i have no explanation for why
	# but this does fix it.
	sed -E -i .backup '1s/^> *#(.*)/\1/' README.md
	rm $@.backup

src/doc.tsx: templates/pkgdoc_templ.jq pkginfo.json
	jq -r -f $^ > $@

.INTERMEDIATE: pkginfo.json
pkginfo.json: example/src/example.js DESC.md
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
