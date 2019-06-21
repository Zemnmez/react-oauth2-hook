def code(lang): "```\(lang)
\(.)
```";

def filter(f): [.[] | select(f)];

[

# module header
(.[] | select(.kind == "module") | "# \(.name)

> \(.summary)

[![NPM](https://img.shields.io/npm/v/\(.name).svg)](https://www.npmjs.com/package/\(.name))

| | |
|----|----|
| licence | \(.license) |
| version | \(.version) |
| requires | \(.requires | map(. | ltrimstr("module:") |
"[\(.)](//npmjs.com/package/\(.))"
) | join(" ")) |
| | |

# Install
```bash
yarn add \(.name)
```
# Example
\((.examples[] | code("javascript")))

\(.description)

"),

"
## Reference
- Exports",


(. | filter(.meta.code.name) | filter(.meta.code.name | test("^exports\\.")) | map(
" - [\(.name)(\(.params | select(.) | map(.name) | join(", ") ))](#\(.name))"
) | join("\n")),
"
",

(.[] | select(.kind == "member") |
"## \(.name)

\(. | select(.params) |
	"### Params
\(.params | map ( "- `\(.name)` \(.description)" ) | join("\n"))
	"
)

\(.description)

\(select(.examples) |
"### Example
\(.examples | map(. | code("javascript")) | join("\n"))")")

] |  join("\n")
