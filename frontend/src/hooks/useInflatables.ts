/**
 * useInflatables Hook
 * Fetches and caches inflatables data from the API
 */

import { useState, useEffect, useCallback } from 'react';
import { fetchInflatables, fetchInflatablesByCategory, type Inflatable } from '../services/inventoryService';

interface UseInflatablesReturn {
  inflatables: Inflatable[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Hook to fetch all active inflatables
 */
export const useInflatables = (): UseInflatablesReturn => {
  const [inflatables, setInflatables] = useState<Inflatable[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadInflatables = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchInflatables(true); // active only
      setInflatables(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load inflatables');
      console.error('Error loading inflatables:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadInflatables();
  }, [loadInflatables]);

  return {
    inflatables,
    loading,
    error,
    refetch: loadInflatables,
  };
};

/**
 * Hook to fetch inflatables by category
 */
export const useInflatablesByCategory = (categoryId: string): UseInflatablesReturn => {
  const [inflatables, setInflatables] = useState<Inflatable[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadInflatables = useCallback(async () => {
    if (!categoryId) {
      setInflatables([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await fetchInflatablesByCategory(categoryId);
      setInflatables(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load inflatables');
      console.error('Error loading inflatables by category:', err);
    } finally {
      setLoading(false);
    }
  }, [categoryId]);

  useEffect(() => {
    loadInflatables();
  }, [loadInflatables]);

  return {
    inflatables,
    loading,
    error,
    refetch: loadInflatables,
  };
};

