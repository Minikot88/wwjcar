import { Suspense } from 'react';
import PageLoader from '../../components/loading/PageLoader.jsx';

export default function RouteSuspense({ children }) {
  return <Suspense fallback={<PageLoader />}>{children}</Suspense>;
}
