
## Projects showcase

To simplify, I used only plain HTML/CSS/JS. I built a boilerplate for each project (`projects/blueprint.html`) that is compiled to each project's site (`projects/build/someproject.html`) by replacing the `<span id="template"></span>` with the contents of `projects/templates/someproject.html`. This is done by running `projects/compile.sh`.

Note that relative paths in the compiled projects are relative to the `projects/build` directory.