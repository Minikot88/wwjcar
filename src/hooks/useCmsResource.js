import { useEffect, useState } from 'react';

export function useCmsResource(fetcher, fallbackData, deps = []) {
  const [data, setData] = useState(fallbackData);
  const [isLoading, setIsLoading] = useState(fallbackData == null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const load = () => {
      if (isMounted) {
        setIsLoading(true);
        setError(null);
      }

      return fetcher()
        .then((result) => {
          if (isMounted && result) setData(result);
        })
        .catch((fetchError) => {
          if (isMounted) setError(fetchError);
        })
        .finally(() => {
          if (isMounted) setIsLoading(false);
        });
    };

    load();

    window.addEventListener('wwj:cms-updated', load);

    return () => {
      isMounted = false;
      window.removeEventListener('wwj:cms-updated', load);
    };
  }, deps);

  return { data, isLoading, error };
}
