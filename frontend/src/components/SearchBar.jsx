import React, { useState, useEffect, useRef } from 'react';
import './App.css';

function App() {
  const [source, setSource] = useState('');
  const [destination, setDestination] = useState('');
  const [sourceSuggestions, setSourceSuggestions] = useState([]);
  const [destSuggestions, setDestSuggestions] = useState([]);
  const [showSourceSuggestions, setShowSourceSuggestions] = useState(false);
  const [showDestSuggestions, setShowDestSuggestions] = useState(false);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [allStations, setAllStations] = useState({ sources: [], destinations: [] });
  
  const sourceRef = useRef(null);
  const destRef = useRef(null);

  // Load stations data - UPDATED PATH
  useEffect(() => {
    import('./data/party_data.json').then(data => {
      const partyData = data.default.party_det || data.default;
      const uniqueSources = [...new Set(partyData.map(item => item.src))].filter(Boolean).sort();
      const uniqueDestinations = [...new Set(partyData.map(item => item.dest))].filter(Boolean).sort();
      setAllStations({ sources: uniqueSources, destinations: uniqueDestinations });
    }).catch(err => console.error('Error loading stations:', err));
  }, []);

  // Filter suggestions
  useEffect(() => {
    if (source.length > 0) {
      const filtered = allStations.sources.filter(s => 
        s.toLowerCase().includes(source.toLowerCase())
      );
      setSourceSuggestions(filtered.slice(0, 8));
      setShowSourceSuggestions(true);
    } else {
      setSourceSuggestions([]);
      setShowSourceSuggestions(false);
    }
  }, [source, allStations.sources]);

  useEffect(() => {
    if (destination.length > 0) {
      const filtered = allStations.destinations.filter(d => 
        d.toLowerCase().includes(destination.toLowerCase())
      );
      setDestSuggestions(filtered.slice(0, 8));
      setShowDestSuggestions(true);
    } else {
      setDestSuggestions([]);
      setShowDestSuggestions(false);
    }
  }, [destination, allStations.destinations]);

  // Click outside
  useEffect(() => {
    const handleClick = (e) => {
      if (sourceRef.current && !sourceRef.current.contains(e.target)) {
        setShowSourceSuggestions(false);
      }
      if (destRef.current && !destRef.current.contains(e.target)) {
        setShowDestSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleSearch = async () => {
    if (!source || !destination) return;
    
    setLoading(true);
    setSearched(true);
    
    try {
      // UPDATED PATH here too
      const data = await import('./data/party_data.json');
      const partyData = data.default.party_det || data.default;
      const filtered = partyData.filter(item => 
        item.src?.toLowerCase().includes(source.toLowerCase()) &&
        item.dest?.toLowerCase().includes(destination.toLowerCase())
      );
      setResults(filtered);
    } catch (err) {
      console.error('Error loading data:', err);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setSource('');
    setDestination('');
    setResults([]);
    setSearched(false);
    setShowSourceSuggestions(false);
    setShowDestSuggestions(false);
  };

  const swapStations = () => {
    const temp = source;
    setSource(destination);
    setDestination(temp);
  };

  const selectSource = (station) => {
    setSource(station);
    setShowSourceSuggestions(false);
  };

  const selectDestination = (station) => {
    setDestination(station);
    setShowDestSuggestions(false);
  };

  return (
    <div className="app">
      {/* Top Bar */}
      <div className="top-bar">
        <div className="logo">
          <div className="logo-icon">🚂</div>
          <div className="logo-text">
            <h1>RailCargo</h1>
            <p>Freight Network</p>
          </div>
        </div>
        <div className="nav-links">
          <a href="#">Find Cargo</a>
          <a href="#">Providers</a>
          <a href="#">Track</a>
          <a href="#">Support</a>
        </div>
      </div>

      {/* Hero */}
      <div className="hero">
        <div className="hero-content">
          <div className="hero-badge">
            <span>⚡</span> India's Largest Rail Freight Network
          </div>
          <h2>Move your cargo<br />across India by rail</h2>
          <p>Connect with verified transport providers on India's railway network</p>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="stats-bar">
        <div className="stat-item">
          <div className="stat-number">1,200+</div>
          <div className="stat-label">Routes Covered</div>
        </div>
        <div className="stat-item">
          <div className="stat-number">450+</div>
          <div className="stat-label">Verified Providers</div>
        </div>
        <div className="stat-item">
          <div className="stat-number">50K+</div>
          <div className="stat-label">Tons Moved</div>
        </div>
        <div className="stat-item">
          <div className="stat-number">24/7</div>
          <div className="stat-label">Support</div>
        </div>
      </div>

      {/* Search Section */}
      <div className="search-wrapper">
        <div className="search-container">
          <div className="search-header">
            <div className="search-tab active">Find Transport</div>
            <div className="search-tab">Track Shipment</div>
          </div>
          
          <div className="search-form">
            <div className="station-inputs">
              <div className="station-field">
                <div className="station-label">
                  <span>📍</span> FROM
                </div>
                <div className="input-box" ref={sourceRef}>
                  <input
                    type="text"
                    placeholder="Select source station"
                    value={source}
                    onChange={(e) => setSource(e.target.value.toUpperCase())}
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
                ↔️
              </div>

              <div className="station-field">
                <div className="station-label">
                  <span>🏁</span> TO
                </div>
                <div className="input-box" ref={destRef}>
                  <input
                    type="text"
                    placeholder="Select destination station"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value.toUpperCase())}
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

            <div className="search-actions">
              <button className="btn-search" onClick={handleSearch} disabled={loading || !source || !destination}>
                <span>🔍</span> Find Transport Providers
              </button>
              <button className="btn-clear" onClick={handleClear}>
                Clear
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="results-area">
        {loading && (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Finding the best providers for you...</p>
          </div>
        )}

        {searched && !loading && results.length > 0 && (
          <>
            <div className="results-header">
              <h3>Available Transport Providers</h3>
              <div className="results-count">{results.length} provider{results.length !== 1 ? 's' : ''} found</div>
            </div>
            
            {results.map((provider, idx) => (
              <div key={idx} className="provider-card">
                <div className="card-main">
                  <div className="provider-left">
                    <div className="provider-name">
                      {provider.contractor_name}
                      <span className="comp-badge">{provider.comp}</span>
                    </div>
                    <div className="route">
                      <span>🚆 Train {provider.train_no}</span>
                      <span>•</span>
                      <span>📦 {provider.capacity} tons capacity</span>
                    </div>
                  </div>
                  <div className="provider-right">
                    <div className="info-chip">
                      <div>
                        <div className="label">From</div>
                        <div className="value">{provider.src?.split('(')[0].trim()}</div>
                      </div>
                    </div>
                    <div className="info-chip">
                      <div>
                        <div className="label">To</div>
                        <div className="value">{provider.dest?.split('(')[0].trim()}</div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="card-details">
                  <div className="contact-info">
                    <div className="contact-item">
                      <span className="icon">👤</span>
                      <span>{provider.name}</span>
                    </div>
                    <div className="contact-item">
                      <span className="icon">📞</span>
                      <a href={`tel:+91${provider.mobile}`}>+91 {provider.mobile}</a>
                    </div>
                    <div className="contact-item">
                      <span className="icon">✉️</span>
                      <a href={`mailto:${provider.emailid}`}>{provider.emailid}</a>
                    </div>
                  </div>
                  <div className="view-details">
                    View Details →
                  </div>
                </div>
              </div>
            ))}
          </>
        )}

        {searched && !loading && results.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">🔍</div>
            <h4>No providers found</h4>
            <p>Try different source and destination stations</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;