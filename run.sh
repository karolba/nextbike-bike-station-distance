#!/bin/bash
set -e -o pipefail

if [[ $# != 1 ]]; then
	echo "Usage: $0 <url to public nextbike map>"
	exit 1
fi

file=./$(date '+NEXTBIKE_PLACES_DB-%Y-%m-%d-%H:%M:%S.json')
curl "$1" \
	| grep 'var NEXTBIKE_PLACES_DB' \
	| sed -e "s/^ *var NEXTBIKE_PLACES_DB = JSON.parse('//" -e "s/'); *\$//" \
	> "$file"
./process.js "$file"

echo ''
echo 'To display those statistics again, but without redownloading from nextbike, run:'
echo "\$ ./process.js $file"
