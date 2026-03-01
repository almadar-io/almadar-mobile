import { useState, useCallback } from 'react';

export interface TraitState {
  [key: string]: unknown;
}

export interface UseTraitStateReturn<T extends TraitState> {
  state: T;
  setState: (updates: Partial<T>) => void;
  getValue: <K extends keyof T>(key: K) => T[K];
  setValue: <K extends keyof T>(key: K, value: T[K]) => void;
}

export function useTraitState<T extends TraitState>(initialState: T): UseTraitStateReturn<T> {
  const [state, setStateRaw] = useState<T>(initialState);

  const setState = useCallback((updates: Partial<T>) => {
    setStateRaw(prev => ({ ...prev, ...updates }));
  }, []);

  const getValue = useCallback(<K extends keyof T>(key: K): T[K] => {
    return state[key];
  }, [state]);

  const setValue = useCallback(<K extends keyof T>(key: K, value: T[K]) => {
    setStateRaw(prev => ({ ...prev, [key]: value }));
  }, []);

  return {
    state,
    setState,
    getValue,
    setValue,
  };
}
