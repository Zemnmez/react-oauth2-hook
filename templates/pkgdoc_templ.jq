def jsdoc: "/**\n" + (. | split("\n") | map(" * " + .) | join("\n")) + "\n */";

("
@module \(.name)
\(.requirements | map("@requires " + .) | join("\n") )
@summary \(.description)
@version \(.version)
@license \(.license)
@author \(.author)
@copyright \(.author) \(.year)
@description
\(.documentation)
@example
\(.example)
@copyright \(.author) \(.year)
@license \(.license)
" | ltrimstr("\n") | rtrimstr("\n") | jsdoc) + "\n\n"
