### long-term goals

- [x] parse math expressions
- [ ] parse html and convert it to csv table
- [ ] parse excel formulas and execute formula calls efficiently
- [ ] parse basic function scopes with (,,param) format for parameter definitions


### short-term goals

- [x] convert deno into npm typescript package module
- [x] add bnf grammar rules
- [x] provide more structure in folders for the project
- [x] implement error handling mechanism
- [x] set line and line start numbers in token positional details associated with each token by token id
- [x] handle parsing html elements/components including different rules for script tags
- [x] change error logging using rust's ast structure i.e. two different spans for each node and token with line and column properties to log position
- [ ] handle parsing excel ranges, cells, rows and columns
- [ ] handle standalone components for html; like 'meta', 'input' or the ambiguous 'br' or 'link'
- [x] parse angular like selector identifiers for the name tags of format "ng-component"
- [ ] implement regular expression for picking specific patterns while parsing html
- [x] implement parsing html comments
- [x] parse html text content children within html elements
- [ ] parse interporlation within strings; e.g. "type System.{identifier} is not implemented"

### issues

- [x] parser does not log the tree properly when two consecutive html components are in two different lines
- [x] throw errors when closing html element with an unmatching closing tag
- [ ] using rust like only line and column properties in the ast is not enough to point out the problematic token within line
- [x] simplify html component structure, do not include uneccessary tag structures, after all said and done
- [ ] decorators are not properly locating errors while parsing
- [ ] parseContent must have higher precedence before parseTag; order: parseComponent, parseContent, parseScript, parseTag





