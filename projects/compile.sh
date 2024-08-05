#!/bin/bash

# Hard coded values
directory="./templates"
blueprint="./blueprint.html"
outputDirectory="./build"
templateKey="<span id=\"template\"></span>"

# Read the contents of blueprint
blueprintContent=$(<"$blueprint")

# Clean the build directory
rm -rf "$outputDirectory"/*

# Loop over all files in the given directory
for template in "$directory"/*; do
	if [ -f "$template" ]; then

		# Read the contents of template
		templateContent=$(<"$template")

		# Replace "key" with the contents of template
		result="${blueprintContent//$templateKey/$templateContent}"

		# Determine the output file name
		baseName=$(basename "$template")
		outputFile="$outputDirectory/$baseName"

		# Write the result to the output file
		echo "$result" >"$outputFile"

		echo "Output written to $outputFile"
	fi
done
