import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Plot from 'react-plotly.js';
import './TemperatureDashboard.css';

const TemperatureDashboard = () => {
  const [data, setData] = useState([]);
  const [locations, setLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState('All');
  const [selectedMetric, setSelectedMetric] = useState('avgTemps');
  const [dateRange, setDateRange] = useState('7days');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [customRange, setCustomRange] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const handleApply = () => {
    setCustomRange(false); // Close the accordion on apply
    fetchData();
  };

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      let url = `http://localhost:3000/api/temperature/last?last=${dateRange}&location=${
        selectedLocation === 'All' ? '' : selectedLocation
      }`;
      if (customRange) {
        url = `http://localhost:3000/api/temperature/range?startDate=${startDate}&endDate=${endDate}&location=${
          selectedLocation === 'All' ? '' : selectedLocation
        }`;
      }
      const response = await axios.get(url);
      setData(response.data);
      setLocations(Object.keys(response.data));
    } catch (error) {
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const renderPlot = () => {
    const plotData = [];
    const dates = new Set();

    // Process data for plotting
    for (const location in data) {
      const locationData = data[location];
      const plotDates = locationData.dates;

      plotData.push({
        x: plotDates,
        y: locationData[selectedMetric],
        type: 'scatter',
        mode: 'lines+markers',
        name: location,
      });

      plotDates.forEach(date => dates.add(date)); // Add dates to the Set
    }

    return (
      <Plot
        data={plotData}
        layout={{
          title: 'Temperature Data',
          xaxis: { title: 'Date' },
          yaxis: { title: 'Temperature' },
        }}
      />
    );
  };

  useEffect(() => {
    fetchData();
  }, [selectedLocation, selectedMetric, dateRange]);

  return (
    <div className="dashboard-container">
      <h1>Temperature Dashboard</h1>
      <div className="controls">
        <div className="control-group">
          <div className="dropdown">
            <label htmlFor="location-select">Select Location:</label>
            <select
              id="location-select"
              value={selectedLocation}
              onChange={e => setSelectedLocation(e.target.value)}
            >
              <option value="All">All</option>
              {locations.map(location => (
                <option key={location} value={location}>
                  {location}
                </option>
              ))}
            </select>
          </div>
          <div className="dropdown">
            <label htmlFor="metric-select">Select Metric:</label>
            <select
              id="metric-select"
              value={selectedMetric}
              onChange={e => setSelectedMetric(e.target.value)}
            >
              <option value="minTemps">Min Temp</option>
              <option value="maxTemps">Max Temp</option>
              <option value="avgTemps">Avg Temp</option>
            </select>
          </div>
        </div>
        <div className="control-group">
          <div className="dropdown">
            <label htmlFor="date-range-select">Select Date Range:</label>
            <select
              id="date-range-select"
              value={dateRange}
              onChange={e => setDateRange(e.target.value)}
            >
              <option value="7days">Last 7 Days</option>
              <option value="10days">Last 10 Days</option>
              <option value="15days">Last 15 Days</option>
              <option value="30days">Last 30 Days</option>
            </select>
          </div>
          <div className="dropdown">
            <label
              htmlFor="custom-date-toggle"
              className="accordion-toggle"
              onClick={() => setCustomRange(!customRange)}
            >
              Custom Date Range
            </label>
            {customRange && (
              <div className="datepicker">
                <label htmlFor="start-date">Start Date:</label>
                <input
                  type="date"
                  id="start-date"
                  value={startDate}
                  onChange={e => setStartDate(e.target.value)}
                />
                <label htmlFor="end-date">End Date:</label>
                <input
                  type="date"
                  id="end-date"
                  value={endDate}
                  onChange={e => setEndDate(e.target.value)}
                />
                <button
                  className="apply-button"
                  onClick={handleApply}
                  disabled={!startDate || !endDate}
                >
                  Apply
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="plot-container">
        {loading && <div className="loading">Loading data...</div>}
        {error && <div className="error">{error}</div>}
        {!loading && renderPlot()}
      </div>
    </div>
  );
};

export default TemperatureDashboard;
