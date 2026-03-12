import { useEffect, useState } from 'react';

import { BackendHealth, fetchBackendHealth } from '../services/health';

type BackendHealthState = {
  data: BackendHealth | null;
  error: string | null;
  isLoading: boolean;
};

const initialState: BackendHealthState = {
  data: null,
  error: null,
  isLoading: true,
};

export function useBackendHealth() {
  const [state, setState] = useState<BackendHealthState>(initialState);

  async function load(signal?: AbortSignal) {
    setState((currentState) => ({
      ...currentState,
      error: null,
      isLoading: true,
    }));

    try {
      const data = await fetchBackendHealth(signal);
      setState({
        data,
        error: null,
        isLoading: false,
      });
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        return;
      }

      setState({
        data: null,
        error: error instanceof Error ? error.message : 'Unknown health check error.',
        isLoading: false,
      });
    }
  }

  async function refresh() {
    await load();
  }

  useEffect(() => {
    const controller = new AbortController();

    void load(controller.signal);

    return () => controller.abort();
  }, []);

  return {
    ...state,
    refresh,
  };
}
