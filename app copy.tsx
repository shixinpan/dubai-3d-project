import { useState } from 'react';
import ReactMapGL from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

const Map: React.FC = () => {
  const accessToken = import.meta.env.VITE_MAPBOX_TOKEN || '';
  const [viewPort, setViewPort] = useState({
    latitude: 25.197402,
    longitude: 55.273487,
    zoom: 10,
  });

  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <ReactMapGL
        {...viewPort}
        mapboxAccessToken={accessToken}
        width="100%"
        height="100%"
        transitionDuration='200'
        mapStyle="mapbox://styles/yapanliu/clhjwupb702xd01p85edr889t"
        center={[viewPort.longitude, viewPort.latitude]}
      >

      </ReactMapGL>
    </div>

  );
};

export default Map;
