import React, { useState } from 'react';
import ReactMapGL, { Layer, Source, ViewState } from 'react-map-gl';
import data from './data/onegeo-sample.json'; // replace with your JSON file path

const MapComponent: React.FC = () => {
	const [viewport, setViewport] = useState<ViewState>({
		latitude: 25.178492,
		longitude: 55.308499,
		zoom: 12,
		bearing: 0,
		pitch: 0,
		padding: 0,
	});

	const layerStyle = {
		'id': 'data',
		'type': 'fill-extrusion',
		'paint': {
			'fill-extrusion-color': '#006400',
			'fill-extrusion-height': ['get', 'height'],
			// 'fill-extrusion-base': ['get', 'base_height'],
			'fill-extrusion-opacity': 0.6
		}
	};

	const accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

	return (
		<ReactMapGL
			{...viewport}
			width="100%"
			height="100%"
			mapStyle="mapbox://styles/mapbox/satellite-streets-v12"
			mapboxAccessToken={accessToken} // make sure to add your own Mapbox token here
			onViewportChange={(nextViewport: ViewState) => setViewport(nextViewport)}
			interactive={true}
			dragPan={true}
			dragRotate={true}
			scrollZoom={true}
		>
			<Source type="geojson" data={data}>
				<Layer {...layerStyle} />
			</Source>
		</ReactMapGL>
	);
};

export default MapComponent;
