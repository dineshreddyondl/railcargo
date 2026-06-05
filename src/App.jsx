import React, { useState, useEffect, useRef } from 'react';
import './App.css';

function App() {
  // State for filters
  const [source, setSource] = useState('');
  const [destination, setDestination] = useState('');
  const [selectedOperator, setSelectedOperator] = useState('');
  
  // State for dropdown suggestions
  const [sourceSuggestions, setSourceSuggestions] = useState([]);
  const [destSuggestions, setDestSuggestions] = useState([]);
  const [operatorSuggestions, setOperatorSuggestions] = useState([]);
  
  // State for UI
  const [showSourceSuggestions, setShowSourceSuggestions] = useState(false);
  const [showDestSuggestions, setShowDestSuggestions] = useState(false);
  const [showOperatorSuggestions, setShowOperatorSuggestions] = useState(false);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [activeMode, setActiveMode] = useState('quick');
  const [allData, setAllData] = useState([]);
  const [sameStationError, setSameStationError] = useState(false);
  
  // Operator wise data
  const [operatorTrains, setOperatorTrains] = useState([]);
  const [operatorRoutes, setOperatorRoutes] = useState([]);
  const [operatorTrips, setOperatorTrips] = useState([]);
  const [operatorSelected, setOperatorSelected] = useState(false);
  
  // Refs for dropdowns
  const sourceRef = useRef(null);
  const destRef = useRef(null);
  const operatorRef = useRef(null);
  
  // Available options for dropdowns
  const [availableSources, setAvailableSources] = useState([]);
  const [availableDestinations, setAvailableDestinations] = useState([]);
  const [availableOperators, setAvailableOperators] = useState([]);

  // Load JSON data
  useEffect(() => {
    fetch('/data/party_data.json')
      .then(response => response.json())
      .then(data => {
        const partyData = data.party_det || data;
        setAllData(partyData);
        
        const sources = [...new Set(partyData.map(item => item.src))].filter(Boolean).sort();
        const destinations = [...new Set(partyData.map(item => item.dest))].filter(Boolean).sort();
        const operators = [...new Set(partyData.map(item => item.contractor_name))].filter(Boolean).sort();
        
        setAvailableSources(sources);
        setAvailableDestinations(destinations);
        setAvailableOperators(operators);
      })
      .catch(err => console.error('Error loading data:', err));
  }, []);

  // Check if source and destination are same
  useEffect(() => {
    if (source && destination && source === destination) {
      setSameStationError(true);
    } else {
      setSameStationError(false);
    }
  }, [source, destination]);

  // Filter suggestions based on input
  useEffect(() => {
    if (source.length > 0 && document.activeElement === sourceRef.current?.querySelector('input')) {
      const filtered = availableSources.filter(s => 
        s.toLowerCase().includes(source.toLowerCase()) && s !== source
      );
      setSourceSuggestions(filtered.slice(0, 10));
      setShowSourceSuggestions(true);
    } else {
      setSourceSuggestions([]);
      setShowSourceSuggestions(false);
    }
  }, [source, availableSources]);

  useEffect(() => {
    if (destination.length > 0 && document.activeElement === destRef.current?.querySelector('input')) {
      const filtered = availableDestinations.filter(d => 
        d.toLowerCase().includes(destination.toLowerCase()) && d !== destination
      );
      setDestSuggestions(filtered.slice(0, 10));
      setShowDestSuggestions(true);
    } else {
      setDestSuggestions([]);
      setShowDestSuggestions(false);
    }
  }, [destination, availableDestinations]);

  useEffect(() => {
    if (selectedOperator.length > 0 && document.activeElement === operatorRef.current?.querySelector('input')) {
      const filtered = availableOperators.filter(op => 
        op.toLowerCase().includes(selectedOperator.toLowerCase()) && op !== selectedOperator
      );
      setOperatorSuggestions(filtered.slice(0, 10));
      setShowOperatorSuggestions(true);
    } else {
      setOperatorSuggestions([]);
      setShowOperatorSuggestions(false);
    }
  }, [selectedOperator, availableOperators]);

  // Load operator data when operator is selected
  useEffect(() => {
    if (selectedOperator && activeMode === 'operator' && allData.length > 0) {
      const operatorData = allData.filter(item => 
        item.contractor_name?.toLowerCase() === selectedOperator.toLowerCase()
      );
      
      if (operatorData.length > 0) {
        const trains = {};
        operatorData.forEach(item => {
          const train = item.train_no;
          if (!trains[train]) {
            trains[train] = { count: 0, details: [] };
          }
          trains[train].count++;
          trains[train].details.push(item);
        });
        
        const trainList = Object.keys(trains).map(train => ({
          train: train,
          trips: trains[train].count,
          details: trains[train].details
        }));
        setOperatorTrains(trainList);
        
        const routes = {};
        operatorData.forEach(item => {
          const route = `${item.src} → ${item.dest}`;
          if (!routes[route]) {
            routes[route] = { count: 0, details: [] };
          }
          routes[route].count++;
          routes[route].details.push(item);
        });
        
        const routeList = Object.keys(routes).map(route => ({
          route: route,
          trips: routes[route].count,
          details: routes[route].details
        }));
        setOperatorRoutes(routeList);
        
        setOperatorTrips(operatorData);
        setOperatorSelected(true);
      }
    } else {
      setOperatorSelected(false);
      setOperatorTrains([]);
      setOperatorRoutes([]);
      setOperatorTrips([]);
    }
  }, [selectedOperator, activeMode, allData]);

  const handleSearch = () => {
    if (!source || !destination) return;
    if (source === destination) return;
    
    setLoading(true);
    setSearched(true);
    
    setTimeout(() => {
      let filtered = allData.filter(item => 
        item.src?.toLowerCase() === source.toLowerCase() &&
        item.dest?.toLowerCase() === destination.toLowerCase()
      );
      
      setResults(filtered);
      setLoading(false);
    }, 300);
  };

  const handleClear = () => {
    setSource('');
    setDestination('');
    setSelectedOperator('');
    setResults([]);
    setSearched(false);
    setOperatorSelected(false);
    setOperatorTrains([]);
    setOperatorRoutes([]);
    setOperatorTrips([]);
    setSourceSuggestions([]);
    setDestSuggestions([]);
    setOperatorSuggestions([]);
    setShowSourceSuggestions(false);
    setShowDestSuggestions(false);
    setShowOperatorSuggestions(false);
  };

  const selectSource = (station) => {
    setSource(station);
    setShowSourceSuggestions(false);
    setSourceSuggestions([]);
    if (sourceRef.current) {
      sourceRef.current.querySelector('input').blur();
    }
  };

  const selectDestination = (station) => {
    setDestination(station);
    setShowDestSuggestions(false);
    setDestSuggestions([]);
    if (destRef.current) {
      destRef.current.querySelector('input').blur();
    }
  };

  const selectOperator = (operator) => {
    setSelectedOperator(operator);
    setShowOperatorSuggestions(false);
    setOperatorSuggestions([]);
    if (operatorRef.current) {
      operatorRef.current.querySelector('input').blur();
    }
  };

  const swapStations = () => {
    const temp = source;
    setSource(destination);
    setDestination(temp);
  };

  const handleSourceFocus = () => {
    if (source.length > 0) {
      const filtered = availableSources.filter(s => 
        s.toLowerCase().includes(source.toLowerCase()) && s !== source
      );
      setSourceSuggestions(filtered.slice(0, 10));
      setShowSourceSuggestions(true);
    } else {
      setSourceSuggestions(availableSources.slice(0, 10));
      setShowSourceSuggestions(true);
    }
  };

  const handleDestFocus = () => {
    if (destination.length > 0) {
      const filtered = availableDestinations.filter(d => 
        d.toLowerCase().includes(destination.toLowerCase()) && d !== destination
      );
      setDestSuggestions(filtered.slice(0, 10));
      setShowDestSuggestions(true);
    } else {
      setDestSuggestions(availableDestinations.slice(0, 10));
      setShowDestSuggestions(true);
    }
  };

  const handleOperatorFocus = () => {
    if (selectedOperator.length > 0) {
      const filtered = availableOperators.filter(op => 
        op.toLowerCase().includes(selectedOperator.toLowerCase()) && op !== selectedOperator
      );
      setOperatorSuggestions(filtered.slice(0, 10));
      setShowOperatorSuggestions(true);
    } else {
      setOperatorSuggestions(availableOperators.slice(0, 10));
      setShowOperatorSuggestions(true);
    }
  };

  return (
    <div className="app">
      {/* Logo Header - Simplified */}
      <div className="simple-header">
        <div className="logo-icon">R</div>
        <div className="logo-text">
          <h1>RAILCARGO</h1>
          <p>Freight Network</p>
        </div>
      </div>

      {/* Mode Switch */}
      <div className="mode-switch-container">
        <button 
          className={`mode-switch-btn ${activeMode === 'quick' ? 'active' : ''}`}
          onClick={() => {
            setActiveMode('quick');
            setOperatorSelected(false);
            setResults([]);
            setSearched(false);
          }}
        >
          Quick Lookup
        </button>
        <button 
          className={`mode-switch-btn ${activeMode === 'operator' ? 'active' : ''}`}
          onClick={() => {
            setActiveMode('operator');
            setResults([]);
            setSearched(false);
          }}
        >
          Operator Wise
        </button>
      </div>

      {/* Search Section */}
      <div className="search-wrapper">
        <div className="search-container">
          <div className="search-form">
            {/* Quick Lookup Mode */}
            {activeMode === 'quick' && (
              <>
                <div className="stations-row">
                  <div className="station-field">
                    <label className="station-label">FROM</label>
                    <div className="input-box" ref={sourceRef}>
                      <input
                        type="text"
                        placeholder="Select source station"
                        value={source}
                        onChange={(e) => setSource(e.target.value.toUpperCase())}
                        onFocus={handleSourceFocus}
                        autoComplete="off"
                      />
                      {showSourceSuggestions && sourceSuggestions.length > 0 && (
                        <div className="suggestions">
                          {sourceSuggestions.map((station, idx) => (
                            <div key={idx} className="suggestion-item" onClick={() => selectSource(station)}>
                              {station}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="swap-icon" onClick={swapStations}>
                    ↔
                  </div>

                  <div className="station-field">
                    <label className="station-label">TO</label>
                    <div className="input-box" ref={destRef}>
                      <input
                        type="text"
                        placeholder="Select destination station"
                        value={destination}
                        onChange={(e) => setDestination(e.target.value.toUpperCase())}
                        onFocus={handleDestFocus}
                        autoComplete="off"
                      />
                      {showDestSuggestions && destSuggestions.length > 0 && (
                        <div className="suggestions">
                          {destSuggestions.map((station, idx) => (
                            <div key={idx} className="suggestion-item" onClick={() => selectDestination(station)}>
                              {station}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {sameStationError && (
                  <div className="error-message">
                    <span>⚠</span> Source and destination cannot be the same
                  </div>
                )}

                <div className="action-buttons">
                  <button 
                    className="btn-search" 
                    onClick={handleSearch} 
                    disabled={loading || !source || !destination || sameStationError}
                  >
                    FIND PROVIDERS
                  </button>
                  <button className="btn-clear" onClick={handleClear}>
                    CLEAR
                  </button>
                </div>
              </>
            )}

            {/* Operator Wise Mode */}
            {activeMode === 'operator' && (
              <>
                <div className="operator-filter">
                  <label className="operator-label">SELECT OPERATOR</label>
                  <div className="input-box" ref={operatorRef}>
                    <input
                      type="text"
                      className="operator-input"
                      placeholder="Type to search operator..."
                      value={selectedOperator}
                      onChange={(e) => setSelectedOperator(e.target.value)}
                      onFocus={handleOperatorFocus}
                      autoComplete="off"
                    />
                    {showOperatorSuggestions && operatorSuggestions.length > 0 && (
                      <div className="suggestions">
                        {operatorSuggestions.map((op, idx) => (
                          <div key={idx} className="suggestion-item" onClick={() => selectOperator(op)}>
                            {op}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="action-buttons">
                  <button className="btn-clear" onClick={handleClear}>
                    CLEAR
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Results Section - Quick Lookup */}
      {activeMode === 'quick' && (
        <div className="results-area">
          {loading && (
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <p>Finding providers for you...</p>
            </div>
          )}

          {!loading && searched && results.length > 0 && (
            <>
              <div className="results-header">
                <h3>Transport Providers</h3>
                <div className="results-count">{results.length} provider{results.length !== 1 ? 's' : ''} found</div>
              </div>
              <div className="results-list">
                {results.map((provider, idx) => (
                  <div key={idx} className="provider-card">
                    <div className="card-header">
                      <div className="provider-name">
                        {provider.contractor_name}
                        <span className="comp-badge">{provider.comp}</span>
                      </div>
                      <div className="train-badge">TRAIN: {provider.train_no}</div>
                    </div>
                    <div className="card-body">
                      <div className="detail-row">
                        <span className="detail-label">CAPACITY</span>
                        <span className="detail-value">{provider.capacity} tons</span>
                        <span className="detail-label">CONTACT</span>
                        <span className="detail-value">{provider.name}</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">PHONE</span>
                        <span className="detail-value">+91 {provider.mobile}</span>
                        <span className="detail-label">EMAIL</span>
                        <span className="detail-value email-value">{provider.emailid}</span>
                      </div>
                    </div>
                    <div className="card-footer">
                      {provider.src} → {provider.dest}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {!loading && searched && results.length === 0 && (
            <div className="empty-state">
              <div className="empty-icon">🔍</div>
              <h4>No providers found</h4>
              <p>Try different source and destination stations</p>
            </div>
          )}
        </div>
      )}

      {/* Results Section - Operator Wise */}
      {activeMode === 'operator' && operatorSelected && (
        <div className="results-area">
          <div className="operator-header">
            <h3>Operator: {selectedOperator}</h3>
          </div>

          <div className="operator-two-columns">
            <div className="info-card">
              <div className="card-title">TRAINS RUN BY OPERATOR</div>
              <div className="card-content">
                {operatorTrains.map((item, idx) => (
                  <div key={idx} className="train-item">
                    <span className="train-number">{item.train}</span>
                    <span className="route-count">{item.trips} trips</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="info-card">
              <div className="card-title">ROUTES COVERED</div>
              <div className="card-content">
                {operatorRoutes.map((item, idx) => (
                  <div key={idx} className="route-item">
                    <span>{item.route}</span>
                    <span className="route-count">{item.trips} trips</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="trip-details">
            <div className="trip-header">TRIP DETAILS</div>
            <div className="trip-list">
              {operatorTrips.map((trip, idx) => (
                <div key={idx} className="trip-card">
                  <div className="trip-route">
                    Train {trip.train_no}: {trip.src} → {trip.dest}
                  </div>
                  <div className="trip-detail-row">
                    <span><span className="trip-label">CAPACITY:</span> <span className="trip-value">{trip.capacity} tons</span></span>
                    <span><span className="trip-label">CONTACT:</span> <span className="trip-value">{trip.name}</span></span>
                    <span><span className="trip-label">PHONE:</span> <span className="trip-value">+91 {trip.mobile}</span></span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeMode === 'operator' && !operatorSelected && selectedOperator === '' && (
        <div className="empty-state">
          <div className="empty-icon">🏢</div>
          <h4>Select an operator</h4>
          <p>Type and select an operator to see their trains, routes, and trip details</p>
        </div>
      )}
    </div>
  );
}

export default App;