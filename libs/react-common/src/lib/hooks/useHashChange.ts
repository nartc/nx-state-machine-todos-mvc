import { useEffect } from 'react';

export const useHashChange = (onHashChange: (ev: HashChangeEvent) => void) => {
  useEffect(() => {
    window.addEventListener('hashchange', onHashChange);

    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);
};
