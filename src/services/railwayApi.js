const API_BASE = '/api';

// Search parcel availability
export const searchParcel = async (srcstn, dstnstn, jrnydt = null) => {
  try {
    const response = await fetch(`${API_BASE}/search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ srcstn, dstnstn, jrnydt })
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Search parcel error:', error);
    throw error;
  }
};

// Extract leased operators from response
export const getLeasedOperators = (searchResponse) => {
  if (!searchResponse || !searchResponse.train_det) {
    return [];
  }
  
  const leasedOperators = [];
  
  searchResponse.train_det.forEach(train => {
    if (train.leasedet && train.leasedet.length > 0) {
      train.leasedet.forEach(lease => {
        leasedOperators.push({
          trainNo: train.trnno,
          trainName: train.trainname,
          source: train.srcstndet,
          sourceCode: train.srcstn,
          destination: train.dstnstndet,
          destinationCode: train.dstnstn,
          operatorName: lease.name,
          phone: lease.officetele,
          email: lease.address,
          leasedSpace: lease.leasespace,
          totalCapacity: train.totalcapacity,
          availableSpace: train.spaceavail,
          distance: train.distance
        });
      });
    }
  });
  
  return leasedOperators;
};

// Get all trains from response
export const getTrainsList = (searchResponse) => {
  if (!searchResponse || !searchResponse.train_det) {
    return [];
  }
  
  return searchResponse.train_det.map(train => ({
    trainNo: train.trnno,
    trainName: train.trainname,
    trainType: train.trntypedet,
    source: train.srcstndet,
    sourceCode: train.srcstn,
    destination: train.dstnstndet,
    destinationCode: train.dstnstn,
    totalCapacity: train.totalcapacity,
    availableSpace: train.spaceavail,
    leasedSpace: train.leasespace || 0,
    distance: train.distance,
    leasedOperators: train.leasedet || []
  }));
};

// Clear cache
export const clearCache = async () => {
  try {
    const response = await fetch(`${API_BASE}/clear-cache`, {
      method: 'POST'
    });
    return await response.json();
  } catch (error) {
    console.error('Clear cache error:', error);
    throw error;
  }
};

// Health check
export const healthCheck = async () => {
  try {
    const response = await fetch(`${API_BASE}/health`);
    return await response.json();
  } catch (error) {
    console.error('Health check error:', error);
    throw error;
  }
};