#!/bin/bash

python event-page-generation.py
python places-page-generation.py
python location-yaml-generation.py
cd ../
jekyll build
rsync -r _site/ tdstoffe@sandbox.lib.ncsu.edu:/var/www/webdev/htdocs/redwhiteblack
