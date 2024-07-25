## Latest Release

### Version v4.1.0

- simplify the general api
- use syntax tree as a central concept in the entire build factory process while parsing the tree
- pass syntax tree down to every syntax node and token, using a robust api to reference each part of the syntax tree and source text from anywhere in the code, using token spans, line spans, and text spans
- debug auto and manual cell declaration logic
- intertwine connection between different interpreting phases (source text to lexing, to parsing, to binding, and evaluating)
- use new diagnostic severity logic to prevent parsing, binding, or evaluating while in a fatal state
- neat solidjs ui to help see and debug the code and get better live feedback for the parser

[View all releases](https://github.com/ardiannm/Parser/releases)
