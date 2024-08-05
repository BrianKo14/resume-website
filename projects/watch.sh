#!/bin/bash

# Watch for changes in .html and .js files
find . \( -name "*.html" -o -name "*.js" \) | entr ./compile.sh