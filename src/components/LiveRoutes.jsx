import React, { useState, useEffect, useRef } from 'react';
import stationList from '../data/stations.json';

// Get API URL from environment variable
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const LiveRoutes = () => {
  const [source, setSource] = useState('');
  const [destination, setDestination] = useState('');
  const [journeyDate, setJourneyDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);
  
  const [stations, setStations] = useState([]);
  const [sourceSuggestions, setSourceSuggestions] = useState([]);
  const [destSuggestions, setDestSuggestions] = useState([]);
  const [showSourceDropdown, setShowSourceDropdown] = useState(false);
  const [showDestDropdown, setShowDestDropdown] = useState(false);
  
  const sourceRef = useRef(null);
  const destRef = useRef(null);

  useEffect(() => {
    const today = new Date();
    const day = String(today.getDate()).padStart(2, '0');
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const year = today.getFullYear();
    setJourneyDate(`${day}/${month}-${year}`);
  }, []);

  useEffect(() => {
    setStations(stationList);
    setSourceSuggestions(stationList);
    setDestSuggestions(stationList);
  }, []);

  useEffect(() => {
    if (source.length > 0) {
      const filtered = stations.filter(s => 
        s.code.toLowerCase().includes(source.toLowerCase()) ||
        s.name.toLowerCase().includes(source.toLowerCase())
      );
      setSourceSuggestions(filtered);
      setShowSourceDropdown(true);
    } else {
      setSourceSuggestions(stations);
      setShowSourceDropdown(true);
    }
  }, [source, stations]);

  useEffect(() => {
    if (destination.length > 0) {
      const filtered = stations.filter(d => 
        d.code.toLowerCase().includes(destination.toLowerCase()) ||
        d.name.toLowerCase().includes(destination.toLowerCase())
      );
      setDestSuggestions(filtered);
      setShowDestDropdown(true);
    } else {
      setDestSuggestions(stations);
      setShowDestDropdown(true);
    }
  }, [destination, stations]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sourceRef.current && !sourceRef.current.contains(event.target)) {
        setShowSourceDropdown(false);
      }
      if (destRef.current && !destRef.current.contains(event.target)) {
        setShowDestDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectSource = (station) => {
    setSource(station.code);
    setShowSourceDropdown(false);
  };

  const selectDestination = (station) => {
    setDestination(station.code);
    setShowDestDropdown(false);
  };

  const swapStations = () => {
    const temp = source;
    setSource(destination);
    setDestination(temp);
  };

  const handleDateChange = (e) => {
    let value = e.target.value;
    value = value.replace(/[^0-9]/g, '');
    if (value.length >= 2 && value.length < 4) {
      value = value.slice(0, 2) + '/' + value.slice(2);
    } else if (value.length >= 4 && value.length < 6) {
      value = value.slice(0, 2) + '/' + value.slice(2, 4) + '-' + value.slice(4);
    } else if (value.length >= 6) {
      value = value.slice(0, 2) + '/' + value.slice(2, 4) + '-' + value.slice(4, 8);
    }
    setJourneyDate(value);
  };

  const handleSearch = async () => {
    if (!source || !destination) {
      setError('Please select both source and destination stations');
      return;
    }

    if (!journeyDate || journeyDate.length < 10) {
      setError('Please enter a valid date in DD/MM-YYYY format');
      return;
    }

    setLoading(true);
    setError('');
    setSearched(true);
    setResults(null);

    try {
      const response = await fetch(`${API_URL}/api/test-search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          srcstn: source, 
          dstnstn: destination,
          jrnydt: journeyDate 
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setResults(data.fullResponse);
      } else {
        setError(data.error || 'Failed to fetch data');
      }
    } catch (err) {
      setError(`Connection error. Make sure the backend server is running at ${API_URL}`);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setSource('');
    setDestination('');
    setResults(null);
    setSearched(false);
    setError('');
    const today = new Date();
    const day = String(today.getDate()).padStart(2, '0');
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const year = today.getFullYear();
    setJourneyDate(`${day}/${month}-${year}`);
  };

  return (
    <div className="results-area">
      <div className="live-search-card" style={{
        background: 'white',
        borderRadius: '8px',
        padding: '24px',
        marginBottom: '24px',
        border: '1px solid #e2e8f0'
      }}>
        <div className="stations-row" style={{ display: 'flex', gap: '16px', marginBottom: '16px', alignItems: 'flex-end' }}>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: '11px', fontWeight: '700', color: '#6b7a8a', display: 'block', marginBottom: '8px' }}>
              SOURCE STATION
            </label>
            <div className="input-box" ref={sourceRef} style={{ position: 'relative' }}>
              <input
                type="text"
                placeholder="Type station name or code"
                value={source}
                onChange={(e) => setSource(e.target.value.toUpperCase())}
                onFocus={() => setShowSourceDropdown(true)}
                autoComplete="off"
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  border: '1.5px solid #e2e8f0',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
              />
              {showSourceDropdown && sourceSuggestions.length > 0 && (
                <div className="suggestions" style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  background: 'white',
                  border: '1px solid #e2e8f0',
                  borderRadius: '6px',
                  maxHeight: '240px',
                  overflowY: 'auto',
                  zIndex: 100,
                  marginTop: '4px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
                }}>
                  <div className="suggestions-header" style={{
                    padding: '8px 14px',
                    fontSize: '11px',
                    fontWeight: '600',
                    color: '#6b7a8a',
                    background: '#f8f9fa',
                    borderBottom: '1px solid #e2e8f0'
                  }}>
                    Showing {sourceSuggestions.length} stations
                  </div>
                  {sourceSuggestions.map((station, idx) => (
                    <div 
                      key={idx} 
                      className="suggestion-item" 
                      onClick={() => selectSource(station)}
                      style={{
                        padding: '10px 14px',
                        fontSize: '12px',
                        cursor: 'pointer',
                        borderBottom: '1px solid #f0f2f5',
                        fontFamily: 'JetBrains Mono, monospace'
                      }}
                    >
                      {station.code} - {station.name}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div 
            className="swap-icon" 
            onClick={swapStations}
            style={{
              width: '44px',
              height: '44px',
              background: '#f8f9fa',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '18px',
              cursor: 'pointer',
              border: '1px solid #e2e8f0'
            }}
          >
            ↔
          </div>

          <div style={{ flex: 1 }}>
            <label style={{ fontSize: '11px', fontWeight: '700', color: '#6b7a8a', display: 'block', marginBottom: '8px' }}>
              DESTINATION STATION
            </label>
            <div className="input-box" ref={destRef} style={{ position: 'relative' }}>
              <input
                type="text"
                placeholder="Type station name or code"
                value={destination}
                onChange={(e) => setDestination(e.target.value.toUpperCase())}
                onFocus={() => setShowDestDropdown(true)}
                autoComplete="off"
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  border: '1.5px solid #e2e8f0',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
              />
              {showDestDropdown && destSuggestions.length > 0 && (
                <div className="suggestions" style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  background: 'white',
                  border: '1px solid #e2e8f0',
                  borderRadius: '6px',
                  maxHeight: '240px',
                  overflowY: 'auto',
                  zIndex: 100,
                  marginTop: '4px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
                }}>
                  <div className="suggestions-header" style={{
                    padding: '8px 14px',
                    fontSize: '11px',
                    fontWeight: '600',
                    color: '#6b7a8a',
                    background: '#f8f9fa',
                    borderBottom: '1px solid #e2e8f0'
                  }}>
                    Showing {destSuggestions.length} stations
                  </div>
                  {destSuggestions.map((station, idx) => (
                    <div 
                      key={idx} 
                      className="suggestion-item" 
                      onClick={() => selectDestination(station)}
                      style={{
                        padding: '10px 14px',
                        fontSize: '12px',
                        cursor: 'pointer',
                        borderBottom: '1px solid #f0f2f5',
                        fontFamily: 'JetBrains Mono, monospace'
                      }}
                    >
                      {station.code} - {station.name}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ fontSize: '11px', fontWeight: '700', color: '#6b7a8a', display: 'block', marginBottom: '8px' }}>
            JOURNEY DATE (DD/MM-YYYY)
          </label>
          <input
            type="text"
            placeholder="DD/MM-YYYY"
            value={journeyDate}
            onChange={handleDateChange}
            style={{
              width: '200px',
              padding: '12px 14px',
              border: '1.5px solid #e2e8f0',
              borderRadius: '6px',
              fontSize: '14px',
              fontFamily: 'JetBrains Mono, monospace'
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={handleSearch}
            disabled={loading}
            className="btn-search"
            style={{
              flex: 1,
              background: '#e85a2c',
              color: 'white',
              border: 'none',
              padding: '12px',
              borderRadius: '6px',
              fontSize: '13px',
              fontWeight: '700',
              cursor: 'pointer',
              opacity: loading ? 0.6 : 1
            }}
          >
            {loading ? 'FETCHING LIVE DATA...' : 'GET LIVE AVAILABILITY'}
          </button>
          <button
            onClick={handleClear}
            className="btn-clear"
            style={{
              flex: 1,
              background: '#f0f2f5',
              color: '#4a5568',
              border: 'none',
              padding: '12px',
              borderRadius: '6px',
              fontSize: '13px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            CLEAR
          </button>
        </div>
      </div>

      {loading && (
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Fetching live data from Indian Railways...</p>
        </div>
      )}

      {error && !loading && (
        <div className="error-message">
          <span>⚠</span> {error}
        </div>
      )}

      {searched && !loading && results && results.train_det && (
        <div className="results-list">
          <div className="results-header">
            <h3>Live Train Data for {journeyDate}</h3>
            <div className="results-count">{results.train_det.length} trains found</div>
          </div>
          
          {results.train_det.map((train, idx) => (
            <div key={idx} className="provider-card">
              <div className="card-header">
                <div className="provider-name">
                  {train.trainname}
                  <span className="comp-badge">{train.trntypedet}</span>
                </div>
                <div className="train-badge">TRAIN: {train.trnno}</div>
              </div>
              <div className="card-body">
                <div className="detail-row">
                  <span className="detail-label">ROUTE</span>
                  <span className="detail-value">{train.srcstndet} ({train.srcstn}) → {train.dstnstndet} ({train.dstnstn})</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">CAPACITY</span>
                  <span className="detail-value">Total: {train.totalcapacity} tons | Available: {train.spaceavail} tons</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">DISTANCE</span>
                  <span className="detail-value">{train.distance} km</span>
                </div>
                
                {train.leasedet && train.leasedet.length > 0 && (
                  <>
                    <div className="detail-row">
                      <span className="detail-label">LEASED OPERATORS</span>
                      <span className="detail-value">{train.leasedet.length} operators</span>
                    </div>
                    {train.leasedet.map((lease, lIdx) => (
                      <div key={lIdx} style={{
                        marginTop: '10px',
                        padding: '10px',
                        background: '#f8f9fa',
                        borderRadius: '6px',
                        border: '1px solid #e2e8f0'
                      }}>
                        <div><strong>{lease.name}</strong></div>
                        <div className="detail-row">
                          <span className="detail-label">PHONE</span>
                          <span className="detail-value">{lease.officetele}</span>
                          <span className="detail-label">EMAIL</span>
                          <span className="detail-value">{lease.address}</span>
                        </div>
                        <div className="detail-row">
                          <span className="detail-label">LEASED SPACE</span>
                          <span className="detail-value">{lease.leasespace} tons</span>
                          <span className="detail-label">ROUTE</span>
                          <span className="detail-value">{lease.stnfrom} → {lease.stnto}</span>
                        </div>
                      </div>
                    ))}
                  </>
                )}
              </div>
              <div className="card-footer">
                {train.srcstndet} → {train.dstnstndet}
              </div>
            </div>
          ))}
        </div>
      )}

      {searched && !loading && (!results || !results.train_det || results.train_det.length === 0) && (
        <div className="empty-state">
          <div className="empty-icon">🚂</div>
          <h4>No trains found</h4>
          <p>Try different source and destination stations or date</p>
        </div>
      )}
    </div>
  );
};

export default LiveRoutes;
