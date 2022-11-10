#!/usr/bin/env node

if(!((!process.stdin.isTTY && process.argv.length == 2) || process.argv.length == 3)) {
	console.error(`Usage: ${process.argv[1]} json-file\n`
	            + `       ${process.argv[1]} < json-file`)
	process.exit()
}

const Distance = require('geo-distance');

const data = JSON.parse(require('fs').readFileSync(process.argv[2] || '/dev/stdin').toString())

const bikes = data.filter(obj => obj.bike)
const stations = data.filter(obj => !obj.bike)

const toLocation = bikeOrStation => ({ lat: bikeOrStation.lat, lon: bikeOrStation.lng })
const mapsLink = bikeOrStation => `https://maps.google.com/?q=${bikeOrStation.lat},${bikeOrStation.lng}`

const minDistance = args => args.reduce((acc, val) => acc < val ? acc : val, Distance('1000000 km'))
const maxDistance = args => args.reduce((acc, val) => acc > val ? acc : val, Distance('0 km'))

console.log(`Bikes: ${bikes.length}/${data.length}, stations: ${stations.length}/${data.length}`)

console.log(`Minimum distance: `, 
	minDistance(
		stations.map(toLocation)
			.map(stationLocation =>
				minDistance(
					bikes.map(toLocation)
					     .map(bikeLocation => Distance.between(stationLocation, bikeLocation)))))
	.human_readable().toString())

const limit = 20

const bikeStationDistance = 
	stations.map(station => ({ station: station, loc: toLocation(station) }))
		.map(stationLoc =>
			bikes.map(bike => ({ bike: bike, loc: toLocation(bike)}))
			     .map(bikeLoc => ({ distance: Distance.between(stationLoc.loc, bikeLoc.loc),
						bike: bikeLoc.bike,
						station: stationLoc.station})))
		.flat()
		.sort((d1, d2) => d1.distance - d2.distance)
		.slice(0, limit)

console.log(`Top ${limit} least distances:`)

console.table(bikeStationDistance
	      .map(({bike, station, distance}) => 
	           ({ "distance": distance.human_readable_in_units('m').toString(),
	      	      "bike": bike.name,
	              "bike location": `${toLocation(bike).lat},${toLocation(bike).lon}`,
	      	      "bike.bikes": bike.bikes,
	              "station": station.name,
	              "station location": `${toLocation(station).lat},${toLocation(station).lon}` })))

console.log(`Maps links`)
console.table(bikeStationDistance
	      .map(({bike, station, distance}) => 
	           ({ "distance": distance.human_readable_in_units('m').toString(),
	              "bike on map": mapsLink(bike),
	              "station on map": mapsLink(station) })))

