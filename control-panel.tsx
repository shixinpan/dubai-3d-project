import React, { useState, useEffect } from 'react';

export default function ControlPanel(props) {
  const { selectedBuilding,buildingID,onDateChange, fetchDataForBuilding } = props;
  const [clickInfo, setClickInfo] = useState(null);
  const [SelectedID, setSelectedID] = useState(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedField, setSelectedField] = useState('humidity');
  const [scaleLabel, setScaleLabel] = useState('');


  useEffect(() => {
    // Set the clickInfo state whenever the selectedBuilding changes
    setClickInfo(selectedBuilding);
    console.log('设置的clickinfo是',setClickInfo)
  }, [selectedBuilding]);

  // get the building id
  useEffect(() => {
    setSelectedID(buildingID);
  }, [buildingID]);


  useEffect(() => {
    // Chart creation logic goes here
    if (clickInfo && clickInfo.length > 0) {
      console.log('clickInfo的数值是',clickInfo)

      const xValues = clickInfo.map((data) => new Date(data.timestamp).toLocaleDateString());
      //const yValues = clickInfo.map((data) => new Date(data.pm10).toLocaleDateString());
      const yValues = clickInfo.map((data) => parseFloat(data[selectedField])); // 使用选中字段的值

      const chartContainer = document.getElementById('myChart');
      if (chartContainer) {
        // Load Chart.js library dynamically if it hasn't been loaded yet
        //chartContainer.innerHTML = '';
        if (!window.Chart) {
          const script = document.createElement('script');
          script.src = 'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/2.9.4/Chart.js';
          script.async = true;
          script.onload = () => {
            // Chart.js library has been loaded, create the chart
            createChart(xValues, yValues);
          };
          chartContainer.appendChild(script);
        } else {
          // Chart.js library is already loaded, create the chart
          createChart(xValues, yValues);
        }
      }
    }
  }, [clickInfo, selectedField]);

  useEffect(() => {
    // Set scale label based on selected field
    switch (selectedField) {
      case 'pm25':
        setScaleLabel('ppm');
        //setScaleLabel('（' + selectedField.toUpperCase() + '）');
        break;
      case 'pm10':
        setScaleLabel('ppm');
        break;
      case 'humidity':
        setScaleLabel('Relative Humidity (%)');
      // Add more cases for other fields if needed
        break;
      case 'TVOC':
        setScaleLabel('TVOC');
        break;
      case 'CO2':
        setScaleLabel('CO2');
        break;
      default:
        setScaleLabel('Temperature');
        break;
    }
  }, [selectedField]);

  const createChart = (xValues, yValues) => {
    new Chart('myChart', {
      type: 'line',
      data: {
        labels: xValues,
        datasets: [
          {
            fill: false,
            lineTension: 0,
            borderColor: 'rgba(255, 0, 0, 1.0)',
            borderWidth: 1,
            borderDash: [], 
            data: yValues,
            pointRadius: 0.5,
          },
        ],
      },
      options: {
        legend: { display: false },
        scales: {
          yAxes: [{
            position: 'left', 
            ticks: {
              beginAtZero: false,
              callback: function(value, index, values) {
                return value.toFixed(1); 
              }
            },
            scaleLabel: {
              display: true,
              labelString: scaleLabel, // Use the dynamically generated scale label
            }
          }],
        },
      },
    });
  };


  //这里不能传id，要传buildingID，然后再计算出uuid
  const handleDateChange = () => {
    if (SelectedID) {
      fetchDataForBuilding(SelectedID, startDate, endDate, selectedField);
    } else {
      console.log("Building ID is missing");
    }
  };

  const handleStartDateChange = event => {
    setStartDate(event.target.value);
  };

  const handleEndDateChange = event => {
    setEndDate(event.target.value);
  };

  const handleFieldChange = (event) => {
    setSelectedField(event.target.value);
  };

  const handleDownload = () => {
    if (clickInfo && clickInfo.length > 0) {
      const csv = convertToCSV(clickInfo);

      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'data.csv';
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  function convertToCSV(data) {
    if (!data || data.length === 0) {
      return '';
    }
  
    const headers = Object.keys(data[0]);
    const rows = data.map(row => headers.map(header => row[header]).join(','));
    const csv = [headers.join(','), ...rows].join('\n');
  
    return csv;
  }
  

  return (
    <div className="control-panel">
      <div>
        <label htmlFor="start-date" className="date-text">Start Date:</label>
        <input type="date" id="start-date" value={startDate} onChange={handleStartDateChange} className="date-input" />
        <label htmlFor="end-date" className="date-text">End Date:</label>
        <input type="date" id="end-date" value={endDate} onChange={handleEndDateChange} className="date-input"/>
        <label htmlFor="select-field" className="date-text">Field:</label>
        <select id="select-field" value={selectedField} onChange={handleFieldChange} className="option">
          <option value="humidity">humidity</option>
          <option value="pm10">pm10</option>
          <option value="pm25">pm25</option>
          <option value="TVOC">TVOC</option>
          <option value="CO2">CO2</option>
          <option value="Temperature">Temperature</option>
        </select>
        <button onClick={handleDateChange} className="btn">Fetch Data</button>
        <button onClick={handleDownload} className="btn">Download</button>
      </div>
      {clickInfo && clickInfo.length > 0 && (
        <canvas id="myChart" style={{ width: '100%', maxWidth: '600px' }}></canvas>
      )}
    </div>
  );
}
