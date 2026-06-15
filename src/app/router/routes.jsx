import { lazy } from 'react';
import { createBrowserRouter } from 'react-router';
import RootLayout from '../../layouts/RootLayout.jsx';
import MarketingLayout from '../../layouts/MarketingLayout.jsx';
import LegalLayout from '../../layouts/LegalLayout.jsx';
import AdminLayout from '../../layouts/AdminLayout.jsx';
import ErrorBoundary from '../../components/error/ErrorBoundary.jsx';
import AdminProtectedRoute from '../../components/admin/AdminProtectedRoute.jsx';
import Home from '../../pages/Home.jsx';
import RouteSuspense from './RouteSuspense.jsx';

const Cars = lazy(() => import('../../pages/Cars.jsx'));
const CarDetail = lazy(() => import('../../pages/CarDetail.jsx'));
const RentalConditions = lazy(() => import('../../pages/RentalConditions.jsx'));
const HowToRent = lazy(() => import('../../pages/HowToRent.jsx'));
const Contact = lazy(() => import('../../pages/Contact.jsx'));
const FAQ = lazy(() => import('../../pages/FAQ.jsx'));
const MonthlyCarRental = lazy(() => import('../../pages/MonthlyCarRental.jsx'));
const MalaysianCustomers = lazy(() => import('../../pages/MalaysianCustomers.jsx'));
const Reviews = lazy(() => import('../../pages/Reviews.jsx'));
const Blog = lazy(() => import('../../pages/Blog.jsx'));
const BlogDetail = lazy(() => import('../../pages/BlogDetail.jsx'));
const AboutUs = lazy(() => import('../../pages/AboutUs.jsx'));
const PrivacyPolicy = lazy(() => import('../../pages/PrivacyPolicy.jsx'));
const TermsConditions = lazy(() => import('../../pages/TermsConditions.jsx'));
const NotFound = lazy(() => import('../../pages/NotFound.jsx'));
const AdminLogin = lazy(() => import('../../pages/admin/AdminLogin.jsx'));
const AdminDashboard = lazy(() => import('../../pages/admin/AdminDashboard.jsx'));
const AdminCars = lazy(() => import('../../pages/admin/AdminCars.jsx'));
const AdminSiteSettings = lazy(() => import('../../pages/admin/AdminSiteSettings.jsx'));
const AdminHomeContent = lazy(() => import('../../pages/admin/AdminHomeContent.jsx'));
const AdminFaqs = lazy(() => import('../../pages/admin/AdminFaqs.jsx'));
const AdminRentalConditions = lazy(() => import('../../pages/admin/AdminRentalConditions.jsx'));
const AdminAboutContent = lazy(() => import('../../pages/admin/AdminAboutContent.jsx'));
const AdminPages = lazy(() => import('../../pages/admin/AdminPages.jsx'));
const AdminUploads = lazy(() => import('../../pages/admin/AdminUploads.jsx'));

function lazyRoute(element) {
  return <RouteSuspense>{element}</RouteSuspense>;
}

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    errorElement: <ErrorBoundary />,
    children: [
      {
        element: <MarketingLayout />,
        children: [
          { path: '/', element: <Home /> },
          { path: '/cars', element: lazyRoute(<Cars />) },
          { path: '/cars/:slug', element: lazyRoute(<CarDetail />) },
          { path: '/rental-conditions', element: lazyRoute(<RentalConditions />) },
          { path: '/how-to-rent', element: lazyRoute(<HowToRent />) },
          { path: '/contact', element: lazyRoute(<Contact />) },
          { path: '/faq', element: lazyRoute(<FAQ />) },
          { path: '/monthly-car-rental', element: lazyRoute(<MonthlyCarRental />) },
          { path: '/car-rental-for-malaysian', element: lazyRoute(<MalaysianCustomers />) },
          { path: '/reviews', element: lazyRoute(<Reviews />) },
          { path: '/blog', element: lazyRoute(<Blog />) },
          { path: '/blog/:slug', element: lazyRoute(<BlogDetail />) },
          { path: '/about-us', element: lazyRoute(<AboutUs />) }
        ]
      },
      {
        element: <LegalLayout />,
        children: [
          { path: '/privacy-policy', element: lazyRoute(<PrivacyPolicy />) },
          { path: '/terms-and-conditions', element: lazyRoute(<TermsConditions />) }
        ]
      },
      {
        path: '/admin/login',
        element: lazyRoute(<AdminLogin />)
      },
      {
        element: <AdminProtectedRoute />,
        children: [
          {
            path: '/admin',
            element: <AdminLayout />,
            children: [
              { index: true, element: lazyRoute(<AdminDashboard />) },
              { path: 'cars', element: lazyRoute(<AdminCars />) },
              { path: 'site-settings', element: lazyRoute(<AdminSiteSettings />) },
              { path: 'home', element: lazyRoute(<AdminHomeContent />) },
              { path: 'faqs', element: lazyRoute(<AdminFaqs />) },
              { path: 'rental-conditions', element: lazyRoute(<AdminRentalConditions />) },
              { path: 'about', element: lazyRoute(<AdminAboutContent />) },
              { path: 'pages', element: lazyRoute(<AdminPages />) },
              { path: 'uploads', element: lazyRoute(<AdminUploads />) }
            ]
          }
        ]
      },
      {
        path: '*',
        element: lazyRoute(<NotFound />)
      }
    ]
  }
]);
