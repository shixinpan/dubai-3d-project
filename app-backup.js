import React, { useState, useEffect, useMemo, useCallback } from 'react';
import axios from 'axios';
import { createRoot } from 'react-dom/client';
import Map, { Source, Layer } from 'react-map-gl';
import ControlPanel from './control-panel';
import Login from './login';
import './login.css';
import './logout.css';
import { dataLayer } from './map-style';
import { updatePercentiles } from './utils';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN; // Set your mapbox token here

export default function App() {
  const [month, setMonth] = useState(0);
  const [allData, setAllData] = useState(null);  //fetch the 3d data
  const [clickInfo, setClickInfo] = useState(null);  // fetch the building info
  const [token, setToken] = useState(sessionStorage.getItem('token'));
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [buildingID, setbuildingID] = useState('');

  useEffect(() => {
    if (!token) return;

    /* global fetch */
    fetch('http://localhost:3001/api/3d')
      .then(resp => resp.json())
      .then(json => setAllData(json))
      .catch(err => console.error('Could not load data', err)); // eslint-disable-line
  }, [token]);


  // get the paramaters and then pass to function
  const fetchDataForBuilding = async (buildingId, startDate, endDate) => {
    try {
      const uuidResponse = await fetch(`http://localhost:3001/api/getuuid?buildingId=${buildingId}`);
      if (!uuidResponse.ok) {
        throw new Error('无法获取 UUID');
      }
      const uuidData = await uuidResponse.json();
      const uuid = uuidData.uuid;
      console.log('uuid是',uuid)
  
      let apiUrl = `http://localhost:3001/api/dbdata/last24hours?uuid=${uuid}`;
      console.log('apiUrl是',apiUrl)
  
      if (startDate && endDate) {
        apiUrl = `http://localhost:3001/api/dbdata?uuid=${uuid}&startDate=${startDate}&endDate=${endDate}`;
        console.log('apiUrl是',apiUrl)
      }
  
      const response = await fetch(apiUrl);
      if (!response.ok) {
        throw new Error('无法获取数据');
      }
      const jsonData = await response.json();
  
      setClickInfo(jsonData || []);
    } catch (error) {
      console.error('获取数据时出错：', error);
      setClickInfo([]);
    }
  };
  

  const handleDateChange = (startDate, endDate) => {
    setStartDate(startDate);
    setEndDate(endDate);

    if (clickInfo && clickInfo.properties && clickInfo.properties.id) {
      //console.log('clickInfo.properties.id',clickInfo.properties.id)
      fetchDataForBuilding(clickInfo.properties.id, startDate, endDate);
    }
  };

  // when click the building , get the id
  const onClick = useCallback(
    async event => {
      const {
        features,  //get the id from 3d data
        point: { x, y }
      } = event;
      const clickedFeature = features && features[0]; //features[0] is id
      setbuildingID(clickedFeature.properties.id);
      if (clickedFeature && clickedFeature.properties.id) { //there are two ids and another is properties.id
        setClickInfo(null); // Clear previous data
        fetchDataForBuilding(clickedFeature.properties.id,startDate, endDate);  //pass buildingID to 'fetchDataForBuilding',return API data
      } else {
        setClickInfo(null);
      }
    },
    [startDate, endDate]
  );

  console.log('buildingID的值是',buildingID)

  console.log('第一个clickInfo的值是',clickInfo)

  const data = useMemo(() => {
    return allData && updatePercentiles(allData, f => f.properties.height[month]);
  }, [allData, month]);

  const handleLogin = token => {
    sessionStorage.setItem('token', token);
    setToken(token);
  };

  const handleLogout = () => {
    sessionStorage.removeItem('token');
    setToken(null);
  };

  if (!token) {
    return <Login onLogin={handleLogin} />;
  }

  // Add the ControlPanel component here and pass necessary props
  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <button onClick={handleLogout} className="logout-button">
        Logout
      </button>
      <Map
        initialViewState={{
          latitude: 25.222743,
          longitude: 55.277657,
          zoom: 14
        }}
        mapStyle="mapbox://styles/mapbox/light-v9"
        mapboxAccessToken={MAPBOX_TOKEN}
        interactiveLayerIds={['data']}
        onClick={onClick}
      >
        <Source type="geojson" data={data}>
          <Layer {...dataLayer} />
        </Source>
        <ControlPanel
          data={data}
          buildingID = {buildingID}
          selectedBuilding={clickInfo}
          fetchDataForBuilding={fetchDataForBuilding}
          onDateChange={handleDateChange} // Pass the handleDateChange function to ControlPanel
        />
      </Map>
    </div>
  );
}

export function renderToDom(container) {
  createRoot(container).render(<App />);
}
