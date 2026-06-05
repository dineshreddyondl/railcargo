// frontend/src/services/api.js
import partyData from '../../data/party_data.json';

export const searchProviders = async ({ source, destination }) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const data = partyData.party_det || partyData;
  
  const filtered = data.filter(item => 
    item.src?.toLowerCase().includes(source.toLowerCase()) &&
    item.dest?.toLowerCase().includes(destination.toLowerCase())
  );
  
  return filtered;
};

// Future API integration (commented out for now)
// export const searchProvidersAPI = async ({ source, destination }) => {
//   const response = await fetch(`${import.meta.env.VITE_API_URL}/api/search`, {
//     method: 'POST',
//     headers: {
//       'Content-Type': 'application/json',
//     },
//     body: JSON.stringify({ source, destination }),
//   });
//   
//   if (!response.ok) throw new Error('Search failed');
//   return response.json();
// };