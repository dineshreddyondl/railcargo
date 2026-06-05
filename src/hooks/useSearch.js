import { useState } from 'react';
import { searchProviders } from '../services/api';

export const useSearch = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async ({ source, destination }) => {
    if (!source.trim() || !destination.trim()) {
      return;
    }

    setLoading(true);
    setSearched(true);

    try {
      const data = await searchProviders({ source, destination });
      setResults(data);
    } catch (err) {
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setResults([]);
    setSearched(false);
  };

  return {
    results,
    loading,
    searched,
    handleSearch,
    handleClear,
  };
};