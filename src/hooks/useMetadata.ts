import { useState, useEffect } from 'react';
import MetadataService from '../services/metadata';
import toast from 'react-hot-toast';

export function useMetadata() {
  const [metadata, setMetadata] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const data = await MetadataService.getMetadata();
        setMetadata(data);
      } catch (error) {
        console.error('Error fetching metadata:', error);
        setError(error instanceof Error ? error : new Error('Failed to load metadata'));
        toast.error('Failed to load category data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMetadata();
  }, []);

  return {
    metadata,
    isLoading,
    error
  };
}