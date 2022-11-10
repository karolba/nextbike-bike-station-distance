#!/bin/sh
file=./$(date '+nextbike-%Y-%m-%d-%H:%M:%S.json')
curl 'https://wroclawskirower.pl/mapa-stacji/' \
	| grep 'var NEXTBIKE_PLACES_DB' \
	| sed -e "s/^ *var NEXTBIKE_PLACES_DB = JSON.parse('//" -e "s/'); *\$//" \
	> "$file"
./process.js "$file"
