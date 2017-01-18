#!/bin/bash
cd ../
jekyll build
rsync -r _site/ tdstoffe@sandbox.lib.ncsu.edu:/var/www/webdev/htdocs/iiif-crop
