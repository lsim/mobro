#!/bin/bash

echo "Building new bundle"

# Make sure we are at a reasonable node level
n 4.2.6

# Build the stuff
gulp build.prod

# Clean out stuff we don't want for the release bundle
rm -rf dist/tmp

# Create the zip
zip -r mobro-dist dist
