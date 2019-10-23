import React from 'react';
import './Map.scss';

import mapData from '../../helpers/map.json'

let mapMatrix = []

for (let i=0; i<29; i++) {
	console.log('here')
	let row = []
	for (var j=0; j<24; j++) {
		row.push(null)
	}
	mapMatrix.push(row)
}

for (var room in mapData) {
	let x = parseInt(mapData[room].coordinates.slice(1,3))
	let y = parseInt(mapData[room].coordinates.slice(4,6))
	mapMatrix[y-46][x-50] = mapData[room]
}

// mapMatrix.reverse()

console.log(mapMatrix)
console.log(mapData[177])

let classes = ''

function hasExits(room) {
	classes = 'room'
	if (room) {
		room.exits.includes('n') && (classes += ' north')
		room.exits.includes('e') && (classes += ' east')
		room.exits.includes('s') && (classes += ' south')
		room.exits.includes('w') && (classes += ' west')
	}
	return classes
}

function Map() {
  return (
    <div className="Map pannel">
    	<div className="translucent"></div>

		<div className="map-display">
			{mapMatrix.map(row => (
				<div className="row">
					{row.map(room => (
						<div className={hasExits(room)}>
							{room && room.room_id}
						</div>
					))}
				</div>
			))}
		</div>
    </div>
  );
}

export default Map;