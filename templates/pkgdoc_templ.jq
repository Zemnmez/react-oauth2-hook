def jsdoc: "/**\n" + (. | split("\n") | map(" * " + .) | join("\n")) + "\n */";

("
> \(.description)

## Installation

```bash
yarn add \(.name)
```

\(.documentation)

@example

```javascript
\(.example)
```

@module \(.name)
\(.requirements | map("@requires " + .) | join("\n") )
@summary \(.description)
@version \(.version)
@license \(.license)
@author \(.author)
@copyright \(.author) \(.year)
@copyright \(.author) \(.year)
@license \(.license)
" | ltrimstr("\n") | rtrimstr("\n") | jsdoc) + "\n\n" + (" " |jsdoc) + "\n\n"
