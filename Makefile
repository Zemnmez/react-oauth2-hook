dist: src $(wildcard src/*)
	yarn run rollup -c

doc: $(wildcard src/*.ts*)
	yarn run typedoc --theme markdown --out $@
