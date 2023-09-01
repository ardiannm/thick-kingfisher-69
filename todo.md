## intenting to

- [x] convert deno into npm typescript package module
- [x] add bnf grammar rules
- [x] provide more structure in folders for the project
- [x] implement error handling mechanism.
- [x] set line and line start numbers in token positional details associated with each token by token id.
- [x] handle parsing html elements/components including different rules for script tags
- [x] change error logging using rust's ast structure i.e. two different spans for each node and token with line and column properties to log position.
- [ ] handle parsing excel ranges, cells, rows and columns
- [ ] parse textcontent like characters as html content within html components recursively
- [ ] handle standalone components for html; like 'meta', 'input' or the ambiguous 'br' or 'link'
- [ ] parse angular like selector identifiers for the name tags of format "ng-component"
- [ ] implement regular expression for picking specific patterns while parsing html

## issues

- [x] parser does not log the tree properly when two consecutive html components are in two different lines.
- [x] throw errors when closing html element with an unmatching closing tag.
- [ ] using start/end line/column rust like properties in the tree is not enough to point out the problematic token within line.
- [x] simplify html component structure, do not include uneccessary tag structures, after all said and done