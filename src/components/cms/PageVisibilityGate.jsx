import { useLocation } from 'react-router';
import PageLoader from '../loading/PageLoader.jsx';
import NotFound from '../../pages/NotFound.jsx';
import { useCmsResource } from '../../hooks/useCmsResource.js';
import { cmsService } from '../../services/cmsService.js';

const managedRoutes = {
  '/': 'home',
  '/about-us': 'about-us',
  '/faq': 'faq',
  '/rental-conditions': 'rental-conditions',
  '/contact': 'contact',
  '/reviews': 'reviews',
  '/privacy-policy': 'privacy-policy',
  '/terms-and-conditions': 'terms-and-conditions',
  '/blog': 'blog'
};

export default function PageVisibilityGate({ children }) {
  const location = useLocation();
  const slug = managedRoutes[location.pathname];
  const { isLoading, error } = useCmsResource(
    () => (slug ? cmsService.getPage(slug) : Promise.resolve(null)),
    null,
    [slug]
  );

  if (!slug) return children;
  if (isLoading) return <PageLoader />;
  if (error) return <NotFound />;
  return children;
}
