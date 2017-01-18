# Red, White & Black - Jekyll

### Background

This is a rebuilt version of the Ruby on Rails version of [Red, White and Black](http://scrc.lib.ncsu.edu/m/exhibits/redwhiteblack/). It is built using [Jekyll](https://jekyllrb.com/), [Foundation 6 (CSS)](http://foundation.zurb.com/sites.html), and  [NCSU Stylesheets](https://github.com/NCSU-Libraries/ncsulib_foundation).  

### Required Software

The following software needs to be installed on your local machine in order to build and deploy the site.

- [Jekyll](https://jekyllrb.com/)
- [Ruby](https://www.ruby-lang.org/en/) v2 or above
- [Python](https://www.python.org/)
- rSync

Red, White & Black also requires the use of the two following Ruby gems

- [jekyll-maps ()](https://github.com/ayastreb/jekyll-maps)
- [Jekyll-lunr-js-search](https://github.com/slashdotdash/jekyll-lunr-js-search)

## Quickstart (Requires NCSU.edu Google Apps Access)

In order to download the site and run a local version for development and testing, follow these steps.

git clone https://github.ncsu.edu/tdstoffe/red-white-black`

`cd red-white-black`

`bundle install`

`jekyll serve`

After following those steps you should have a working version of the site that you can open in any browser by going to http://127.0.0.1:4000/redwhiteblack/



## Technical Structure

Jekyll is able to take advantage of data files that are in a CSV or YAML format to generate content for pages. Red, White & Black takes advantage of that and utilizes Google Forms and Google Spreadsheets as the primary data source for the site in order to simplify the data structure. There is one primary Google Spreadsheet ([RWB Data](https://docs.google.com/a/ncsu.edu/spreadsheets/d/1ufPGXya1YjLS621o8Pz5AAHJOLZ02gCvbiIFQ8EiYRA/edit?usp=sharing) ) that manages the data sources for RWB. That spreadsheet contains four worksheets.

### Google Spreadsheet

​1) **Form Responses 1** - This worksheet automatically collects all [Red, White and Black Submission Form](https://goo.gl/forms/VrEW9vrFpzoLKtsG2) 		responses that are used to create new events for the website. The form is designed to capture all of the required elements of an events page as well as some optional elements such as 'image id' and 'audio id'.

​2) **Events Data** - This worksheet contains all of the primary content for the website. Data from the `Form Responses 1` worksheet is then automatically migrated to the 'events data' worksheet using the 'Query' formula\* . Once the data is in the events data worsheet a variety of formulas transform the data into the correct formatting for the YAML frontmatter.


*The Query formula allows you to automatically pull in new Google Form responses from the responses worksheet and then use formulas against those responses. The first 53 rows on the events data page do not use the query formula (as the data was imported). Starting on line 54 new form entries are automatically populated on the events data worksheet.*

  Here are an explanation of the other formulas that are being used on the Google Spreadsheet:

- image_id:  `=IF(F2 <>"",TEXT(F2,"0000000"),"")` - This formula checks to ensure there is an image id provided from the spreadsheet and then works to add any leading zeros that were removed. This allows the URL construction for the IIIF image server to work.

- categories: `=IF(D2<>"",LOWER(SUBSTITUTE(TRIM(D2)," ","-")),"")`- This formula takes the building name, trims leading and trailing white space and replaces remaining spaces with a hyphen. It is used in the YAML front matter to help the places page find every event that occured at that location.

- event_decade: `=IF(G2<>"",FLOOR(YEAR(G2),10),"")` - Rounds the year given for the event to the correct decade. This allows the 'Timeline of Events' page to accurately display events in the correct timeline.

- event_ year: `=IF(G2<>"", YEAR(G2),"")` - Extracts the year of the event from the full date. This field is used to provide the year in headings as well as to generate file names. By generating event file names beginning with the year it is possible for those to appear in chronological order on the 'Timeline of Events' page.
- excerpt: `=SUBSTITUTE(C2,":",":")` - Excerpt is used to provide an excerpt in the YAML frontmatter for events. This excerpt is shown in the search results. Having a colon (:) in YAML frontmatter breaks it, so here we are replacing each colon with the appropriate HTML character so that it remains seen on the search results.

3)  **Places Data** - The `places data` worksheet looks at the events data worksheet and creates a list of unique locations as well as some additional fields that will be used to create a new locan pin on teh home page map.

4)  **places-lat-lon** - This worksheet is a full list of every building on campus with the corresponding map coordinates for that location. The `places data` worksheet uses this to add geographic coordinates to any new locations as they are added to the map.

### Jekyll Data Files

We use the data in the Google Spreadsheets files both to generate indivual markdown files for each event and location, as well as to serve dynamic data to those individually created pages. This is implemented through the use of three build scripts:

1) **event-page-generation.py** - This script downloads a CSV of the events data page of the Google Spreadsheet which was made available as a CSV via the 'Publish to the Web' feature of Google Spreadsheets. Once downloaded it uses some of the colums to generate YAML frontmatter for each individual events page that will be created. This YAML frontmatter is used by '/includes/events.html' to dynamically build a unique events page for each event in the CSV file. The script then copies the downloaded CSV to the '/data/' directory. Each of the individual markdown files has an event_id in the YAML frontmatter - this id corresponds with an array position in the CSV to deliver more content to the page dynamically.

2) **location-yaml-generation.py** - This script downloads a CSV of  the `places page` worksheet from Google. It then creates a single file '/data/cluster/locations.yaml' with the location information for each pin that should appear on the map. Included in this YAML information is the building name, coordinates and a link to an image of the building.

3) **places-page-generation.py** - This script downloads a CSV of the `places page` worksheet from Google. it then creates individual markdown files for each location. These markdown files dynamically display a list of links to all events that occured at that location.

## Search

Red, White and Black includes full-text search from within the browser. This is implemented using [lunr.js](http://lunrjs.com/). Lunr.js works by using javascript to create a json index of all of the text on the site, including the YAML frontmatter. The index is located in /_site/js/index.json. The search box then points at the lunr index to provide search, and jquery is used to display search results.

## Build and Deploy

The build/deploy process is ran by entering the following commands:

`cd red-white-black/build_scripts`

`./build.sh`

The build.sh script runs all three of the page and data generation python scripts, moves the files into their correct directories, removes unnecessary files and uses rsync to rsync to the directory you specify in the .build.sh file. 
