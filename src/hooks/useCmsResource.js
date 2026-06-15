import { useEffect, useState } from 'react';

export function useCmsResource(fetcher, fallbackData, deps = []) {
  const [data, setData] = useState(fallbackData);
  const [isLoading, setIsLoading] = useState(fallbackData == null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    if (fallbackData == null) {
      setIsLoading(true);
    }

    const load = () => fetcher()
      .then((result) => {
        if (isMounted && result) {
          setData(result);
        }
      })
      .catch((fetchError) => {
        if (isMounted) setError(fetchError);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    load();
    window.addEventListener('wwj:mock-cms-updated', load);

    return () => {
      isMounted = false;
      window.removeEventListener('wwj:mock-cms-updated', load);
    };
  }, deps);

  return { data, isLoading, error };
}
