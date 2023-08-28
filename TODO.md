## PROGRESS

- [x] Convert Deno into NPM Typescript package module
- [x] Add BNF Grammar Rules
- [x] Provide more structure in folders for the project
- [x] Implement error handling mechanism.
- [x] Set line and line start numbers in token positional details associated with each token by token id.
- [x] Handle parsing HTML elements/components including different rules for script tags
- [ ] Change error logging using Rust's ast structure i.e. two different Spans for each node and token with line and column properties to log position.
- [ ] Handle parsing excel ranges, cells, rows and columns

## ISSUES

- [ ] Parser does not log the tree properly when two consecutive html components are in two different lines.
