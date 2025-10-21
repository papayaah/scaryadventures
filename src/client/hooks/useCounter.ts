import { useCallback, useEffect, useState } from 'react';
import type { InitResponse, IncrementResponse, DecrementResponse } from '../../shared/types/api';

interface CounterState {
  count: number;
  username: string | null;
  loading: boolean;
}

export const useCounter = () => {
  const [state, setState] = useState<CounterState>({
    count: 0,
    username: null,
    loading: true,
  });
  const [postId, setPostId] = useState<string | null>(null);

  // fetch initial data
  useEffect(() => {
    const init = async () => {
      try {
        // Check if we're in local development mode
        if (window.location.port === '7474' || window.location.hostname === 'localhost') {
          // Mock data for local development
          setState({ count: 0, username: 'LocalUser', loading: false });
          setPostId('local-post-id');
          return;
        }
        
        const res = await fetch('/api/init');
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: InitResponse = await res.json();
        if (data.type !== 'init') throw new Error('Unexpected response');
        setState({ count: data.count, username: data.username, loading: false });
        setPostId(data.postId);
      } catch (err) {
        console.error('Failed to init counter', err);
        setState((prev) => ({ ...prev, loading: false }));
      }
    };
    void init();
  }, []);

  const update = useCallback(
    async (action: 'increment' | 'decrement') => {
      if (!postId) {
        console.error('No postId – cannot update counter');
        return;
      }
      try {
        // Check if we're in local development mode
        if (window.location.port === '7474' || window.location.hostname === 'localhost') {
          // Mock local counter updates
          setState((prev) => ({ 
            ...prev, 
            count: action === 'increment' ? prev.count + 1 : prev.count - 1 
          }));
          return;
        }
        
        const res = await fetch(`/api/${action}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({}),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: IncrementResponse | DecrementResponse = await res.json();
        setState((prev) => ({ ...prev, count: data.count }));
      } catch (err) {
        console.error(`Failed to ${action}`, err);
      }
    },
    [postId]
  );

  const increment = useCallback(() => update('increment'), [update]);
  const decrement = useCallback(() => update('decrement'), [update]);

  return {
    ...state,
    increment,
    decrement,
  } as const;
};
