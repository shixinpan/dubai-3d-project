import type { LayerProps } from 'react-map-gl';

// For more information on data-driven styles, see https://www.mapbox.com/help/gl-dds-ref/
export const dataLayer: LayerProps = {
	id: 'data',
	type: 'fill-extrusion',
	paint: {
		'fill-extrusion-color': '#006400',
		'fill-extrusion-height': ['get', 'height'],
		// 'fill-extrusion-base': ['get', 'base_height'],
		'fill-extrusion-opacity': 0.8
	}
};