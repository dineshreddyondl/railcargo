import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import partyDataRaw from './data/party_data.json';
import LiveRoutes from './components/LiveRoutes';

function App() {
  // State for filters
  const [source, setSource] = useState('');
  const [destination, setDestination] = useState('');
  const [selectedOperator, setSelectedOperator] = useState('');
  const [routeSource, setRouteSource] = useState('');
  
  // State for filtered suggestions
  const [sourceSuggestions, setSourceSuggestions] = useState([]);
  const [destSuggestions, setDestSuggestions] = useState([]);
  const [operatorSuggestions, setOperatorSuggestions] = useState([]);
  const [routeSourceSuggestions, setRouteSourceSuggestions] = useState([]);
  
  // State for UI - show/hide dropdowns
  const [showSourceDropdown, setShowSourceDropdown] = useState(false);
  const [showDestDropdown, setShowDestDropdown] = useState(false);
  const [showOperatorDropdown, setShowOperatorDropdown] = useState(false);
  const [showRouteSourceDropdown, setShowRouteSourceDropdown] = useState(false);
  
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
  
  // Route wise data
  const [routeResults, setRouteResults] = useState([]);
  const [routeSearched, setRouteSearched] = useState(false);
  
  // Refs for dropdowns
  const sourceRef = useRef(null);
  const destRef = useRef(null);
  const operatorRef = useRef(null);
  const routeSourceRef = useRef(null);
  
  // Full lists for dropdowns
  const [allSources, setAllSources] = useState([]);
  const [allDestinations, setAllDestinations] = useState([]);
  const [allOperators, setAllOperators] = useState([]);

  // Load JSON data
  useEffect(() => {
    const partyData = partyDataRaw.party_det || partyDataRaw;
    setAllData(partyData);
    
    const sources = [...new Set(partyData.map(item => item.src))].filter(Boolean).sort();
    const destinations = [...new Set(partyData.map(item => item.dest))].filter(Boolean).sort();
    const operators = [...new Set(partyData.map(item => item.contractor_name))].filter(Boolean).sort();
    
    setAllSources(sources);
    setAllDestinations(destinations);
    setAllOperators(operators);
    
    setSourceSuggestions(sources);
    setDestSuggestions(destinations);
    setOperatorSuggestions(operators);
    setRouteSourceSuggestions(sources);
  }, []);

  // Check if source and destination are same
  useEffect(() => {
    if (source && destination && source === destination) {
      setSameStationError(true);
    } else {
      setSameStationError(false);
    }
  }, [source, destination]);

  // Filter suggestions
  useEffect(() => {
    if (source.length > 0) {
      const filtered = allSources.filter(s => s.toLowerCase().includes(source.toLowerCase()));
      setSourceSuggestions(filtered);
    } else {
      setSourceSuggestions(allSources);
    }
  }, [source, allSources]);

  useEffect(() => {
    if (destination.length > 0) {
      const filtered = allDestinations.filter(d => d.toLowerCase().includes(destination.toLowerCase()));
      setDestSuggestions(filtered);
    } else {
      setDestSuggestions(allDestinations);
    }
  }, [destination, allDestinations]);

  useEffect(() => {
    if (selectedOperator.length > 0) {
      const filtered = allOperators.filter(op => op.toLowerCase().includes(selectedOperator.toLowerCase()));
      setOperatorSuggestions(filtered);
    } else {
      setOperatorSuggestions(allOperators);
    }
  }, [selectedOperator, allOperators]);

  useEffect(() => {
    if (routeSource.length > 0) {
      const filtered = allSources.filter(s => s.toLowerCase().includes(routeSource.toLowerCase()));
      setRouteSourceSuggestions(filtered);
    } else {
      setRouteSourceSuggestions(allSources);
    }
  }, [routeSource, allSources]);

  // Load operator data
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

  const handleRouteSearch = () => {
    if (!routeSource) return;
    
    setLoading(true);
    setRouteSearched(true);
    
    setTimeout(() => {
      const routesFromSource = allData.filter(item => 
        item.src?.toLowerCase() === routeSource.toLowerCase()
      );
      
      const destinationMap = new Map();
      routesFromSource.forEach(item => {
        const dest = item.dest;
        if (!destinationMap.has(dest)) {
          destinationMap.set(dest, []);
        }
        destinationMap.get(dest).push(item);
      });
      
      const routeGroups = Array.from(destinationMap.entries()).map(([destination, providers]) => ({
        destination: destination,
        providers: providers,
        trainNumbers: [...new Set(providers.map(p => p.train_no))],
        providerCount: providers.length
      })).sort((a, b) => a.destination.localeCompare(b.destination));
      
      setRouteResults(routeGroups);
      setLoading(false);
    }, 300);
  };

  const handleClear = () => {
    setSource('');
    setDestination('');
    setSelectedOperator('');
    setRouteSource('');
    setResults([]);
    setSearched(false);
    setRouteResults([]);
    setRouteSearched(false);
    setOperatorSelected(false);
    setOperatorTrains([]);
    setOperatorRoutes([]);
    setOperatorTrips([]);
  };

  const selectSource = (station) => {
    setSource(station);
    setShowSourceDropdown(false);
  };

  const selectDestination = (station) => {
    setDestination(station);
    setShowDestDropdown(false);
  };

  const selectOperator = (operator) => {
    setSelectedOperator(operator);
    setShowOperatorDropdown(false);
  };

  const selectRouteSource = (station) => {
    setRouteSource(station);
    setShowRouteSourceDropdown(false);
  };

  const swapStations = () => {
    const temp = source;
    setSource(destination);
    setDestination(temp);
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sourceRef.current && !sourceRef.current.contains(event.target)) setShowSourceDropdown(false);
      if (destRef.current && !destRef.current.contains(event.target)) setShowDestDropdown(false);
      if (operatorRef.current && !operatorRef.current.contains(event.target)) setShowOperatorDropdown(false);
      if (routeSourceRef.current && !routeSourceRef.current.contains(event.target)) setShowRouteSourceDropdown(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="app">
      {/* Simple Header */}
      <div className="simple-header">
        <div className="logo-icon">R</div>
        <div className="logo-text">
          <h1>RAILCARGO</h1>
          <p>Freight Network</p>
        </div>
      </div>

      {/* Mode Switch - 4 options */}
      <div className="mode-switch-container">
        <button 
          className={`mode-switch-btn ${activeMode === 'quick' ? 'active' : ''}`} 
          onClick={() => { 
            setActiveMode('quick'); 
            setOperatorSelected(false); 
            setResults([]); 
            setSearched(false); 
            setRouteResults([]); 
            setRouteSearched(false); 
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
            setRouteResults([]); 
            setRouteSearched(false); 
          }}
        >
          Operator Wise
        </button>
        <button 
          className={`mode-switch-btn ${activeMode === 'route' ? 'active' : ''}`} 
          onClick={() => { 
            setActiveMode('route'); 
            setResults([]); 
            setSearched(false); 
            setRouteResults([]); 
            setRouteSearched(false); 
          }}
        >
          Route Wise
        </button>
        <button 
          className={`mode-switch-btn ${activeMode === 'live' ? 'active' : ''}`} 
          onClick={() => { 
            setActiveMode('live'); 
            setResults([]); 
            setSearched(false); 
            setRouteResults([]); 
            setRouteSearched(false); 
            setOperatorSelected(false);
          }}
        >
          Live Routes
        </button>
      </div>

      {/* Search Section */}
      <div className="search-wrapper">
        <div className="search-container">
          <div className="search-form">
            
            {/* QUICK LOOKUP MODE */}
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
                        onFocus={() => setShowSourceDropdown(true)}
                        autoComplete="off"
                      />
                      {showSourceDropdown && sourceSuggestions.length > 0 && (
                        <div className="suggestions">
                          <div className="suggestions-header">Showing {sourceSuggestions.length} stations</div>
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
                        onFocus={() => setShowDestDropdown(true)}
                        autoComplete="off"
                      />
                      {showDestDropdown && destSuggestions.length > 0 && (
                        <div className="suggestions">
                          <div className="suggestions-header">Showing {destSuggestions.length} destinations</div>
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

            {/* OPERATOR WISE MODE */}
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
                      onFocus={() => setShowOperatorDropdown(true)}
                      autoComplete="off"
                    />
                    {showOperatorDropdown && operatorSuggestions.length > 0 && (
                      <div className="suggestions">
                        <div className="suggestions-header">Showing {operatorSuggestions.length} operators</div>
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

            {/* ROUTE WISE MODE */}
            {activeMode === 'route' && (
              <>
                <div className="route-filter">
                  <label className="route-label">SELECT SOURCE STATION</label>
                  <div className="input-box" ref={routeSourceRef}>
                    <input
                      type="text"
                      className="route-input"
                      placeholder="Type to search station..."
                      value={routeSource}
                      onChange={(e) => setRouteSource(e.target.value.toUpperCase())}
                      onFocus={() => setShowRouteSourceDropdown(true)}
                      autoComplete="off"
                    />
                    {showRouteSourceDropdown && routeSourceSuggestions.length > 0 && (
                      <div className="suggestions">
                        <div className="suggestions-header">Showing {routeSourceSuggestions.length} stations</div>
                        {routeSourceSuggestions.map((station, idx) => (
                          <div key={idx} className="suggestion-item" onClick={() => selectRouteSource(station)}>
                            {station}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div className="action-buttons">
                  <button 
                    className="btn-search" 
                    onClick={handleRouteSearch} 
                    disabled={loading || !routeSource}
                  >
                    SHOW ALL ROUTES
                  </button>
                  <button className="btn-clear" onClick={handleClear}>
                    CLEAR
                  </button>
                </div>
              </>
            )}

          </div>
        </div>
      </div>

      {/* RESULTS - QUICK LOOKUP */}
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

      {/* RESULTS - OPERATOR WISE */}
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

      {/* RESULTS - ROUTE WISE */}
      {activeMode === 'route' && (
        <div className="results-area">
          {loading && (
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <p>Finding routes from {routeSource}...</p>
            </div>
          )}

          {!loading && routeSearched && routeResults.length > 0 && (
            <>
              <div className="results-header">
                <h3>Routes from {routeSource}</h3>
                <div className="results-count">
                  {routeResults.length} destinations | {routeResults.reduce((sum, r) => sum + r.providerCount, 0)} providers
                </div>
              </div>

              {routeResults.map((route, idx) => (
                <div key={idx} className="route-card">
                  <div className="route-header">
                    <div className="route-dest">→ {route.destination}</div>
                    <div className="route-stats">
                      {route.providerCount} providers | Train: {route.trainNumbers.join(', ')}
                    </div>
                  </div>
                  <div className="providers-list">
                    {route.providers.map((provider, pIdx) => (
                      <div key={pIdx} className="provider-row">
                        <div className="provider-info">
                          <div className="provider-name">
                            {provider.contractor_name}
                            <span className="comp-badge">{provider.comp}</span>
                          </div>
                          <div className="provider-details">
                            <span>🚆 Train: <strong>{provider.train_no}</strong></span>
                            <span>📦 Capacity: <strong>{provider.capacity} tons</strong></span>
                          </div>
                        </div>
                        <div className="contact-info">
                          <div>👤 {provider.name}</div>
                          <div>📞 <a href={`tel:+91${provider.mobile}`}>+91 {provider.mobile}</a></div>
                          <div>✉️ <a href={`mailto:${provider.emailid}`}>{provider.emailid}</a></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </>
          )}

          {!loading && routeSearched && routeResults.length === 0 && (
            <div className="empty-state">
              <div className="empty-icon">🗺️</div>
              <h4>No routes found</h4>
              <p>No providers operate from this station</p>
            </div>
          )}
        </div>
      )}

      {/* RESULTS - LIVE ROUTES */}
      {activeMode === 'live' && <LiveRoutes />}
    </div>
  );
}

export default App;