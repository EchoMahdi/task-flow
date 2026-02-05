import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/index';
import { Icons } from '../components/ui/Icons';

// 404 Not Found Page
export const NotFound = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center p-4">
      <div className="text-center max-w-lg animate-fade-in">
        {/* Illustration */}
        <div className="relative mb-8">
          <div className="text-[180px] font-bold text-secondary-100 leading-none select-none">
            404
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-32 h-32 bg-primary-100 rounded-full flex items-center justify-center">
              <Icons.Search className="w-16 h-16 text-primary-500" />
            </div>
          </div>
        </div>

        <h1 className="text-3xl font-bold text-secondary-900 mb-4">
          Page Not Found
        </h1>
        <p className="text-secondary-600 mb-8">
          Oops! The page you're looking for doesn't exist or has been moved.
          Let's get you back on track.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link to="/">
            <Button>
              <Icons.Home className="w-4 h-4 mr-2" />
              Go Home
            </Button>
          </Link>
          <Button variant="outline" onClick={() => window.history.back()}>
            <Icons.ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
        </div>

        <p className="mt-8 text-sm text-secondary-500">
          Need help?{' '}
          <a href="#" className="text-primary-600 hover:text-primary-700 font-medium">
            Contact Support
          </a>
        </p>
      </div>
    </div>
  );
};

// 403 Unauthorized Page
export const Unauthorized = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-danger-50 via-white to-secondary-50 flex items-center justify-center p-4">
      <div className="text-center max-w-lg animate-fade-in">
        {/* Illustration */}
        <div className="relative mb-8">
          <div className="text-[180px] font-bold text-secondary-100 leading-none select-none">
            403
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-32 h-32 bg-danger-100 rounded-full flex items-center justify-center">
              <Icons.Shield className="w-16 h-16 text-danger-500" />
            </div>
          </div>
        </div>

        <h1 className="text-3xl font-bold text-secondary-900 mb-4">
          Access Denied
        </h1>
        <p className="text-secondary-600 mb-8">
          Sorry, you don't have permission to access this page.
          Please contact your administrator if you believe this is a mistake.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link to="/dashboard">
            <Button>
              <Icons.Squares className="w-4 h-4 mr-2" />
              Go to Dashboard
            </Button>
          </Link>
          <Link to="/login">
            <Button variant="outline">
              <Icons.Logout className="w-4 h-4 mr-2" />
              Sign In Again
            </Button>
          </Link>
        </div>

        <p className="mt-8 text-sm text-secondary-500">
          Need access?{' '}
          <a href="#" className="text-primary-600 hover:text-primary-700 font-medium">
            Request Permission
          </a>
        </p>
      </div>
    </div>
  );
};

// 500 Server Error Page
export const ServerError = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-warning-50 via-white to-secondary-50 flex items-center justify-center p-4">
      <div className="text-center max-w-lg animate-fade-in">
        {/* Illustration */}
        <div className="relative mb-8">
          <div className="text-[180px] font-bold text-secondary-100 leading-none select-none">
            500
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-32 h-32 bg-warning-100 rounded-full flex items-center justify-center">
              <Icons.ExclamationTriangle className="w-16 h-16 text-warning-500" />
            </div>
          </div>
        </div>

        <h1 className="text-3xl font-bold text-secondary-900 mb-4">
          Something Went Wrong
        </h1>
        <p className="text-secondary-600 mb-8">
          We're experiencing some technical difficulties. Our team has been notified
          and is working on fixing the issue.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button onClick={() => window.location.reload()}>
            <Icons.ArrowRight className="w-4 h-4 mr-2 rotate-[225deg]" />
            Try Again
          </Button>
          <Link to="/">
            <Button variant="outline">
              <Icons.Home className="w-4 h-4 mr-2" />
              Go Home
            </Button>
          </Link>
        </div>

        <p className="mt-8 text-sm text-secondary-500">
          Problem persists?{' '}
          <a href="#" className="text-primary-600 hover:text-primary-700 font-medium">
            Report Issue
          </a>
        </p>
      </div>
    </div>
  );
};

// Loading Page
export const LoadingPage = ({ message = 'Loading...' }) => {
  return (
    <div className="min-h-screen bg-secondary-50 flex items-center justify-center p-4">
      <div className="text-center animate-fade-in">
        <div className="relative mb-6">
          {/* Animated logo */}
          <div className="w-16 h-16 mx-auto bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl flex items-center justify-center animate-pulse">
            <Icons.CheckCircle className="w-8 h-8 text-white" />
          </div>
          {/* Spinner ring */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-20 h-20 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin" />
          </div>
        </div>
        <p className="text-secondary-600 font-medium">{message}</p>
      </div>
    </div>
  );
};

// Empty State Component
export const EmptyStatePage = ({
  icon: Icon = Icons.Document,
  title = 'No Data',
  description = 'There is nothing to display here yet.',
  actionLabel,
  actionHref,
  onAction,
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-24 h-24 bg-secondary-100 rounded-full flex items-center justify-center mb-6">
        <Icon className="w-12 h-12 text-secondary-400" />
      </div>
      <h2 className="text-xl font-semibold text-secondary-900 mb-2">{title}</h2>
      <p className="text-secondary-500 max-w-md mb-6">{description}</p>
      {(actionLabel && (actionHref || onAction)) && (
        actionHref ? (
          <Link to={actionHref}>
            <Button>
              <Icons.Plus className="w-4 h-4 mr-2" />
              {actionLabel}
            </Button>
          </Link>
        ) : (
          <Button onClick={onAction}>
            <Icons.Plus className="w-4 h-4 mr-2" />
            {actionLabel}
          </Button>
        )
      )}
    </div>
  );
};

// Maintenance Page
export const Maintenance = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center p-4">
      <div className="text-center max-w-lg animate-fade-in">
        <div className="w-24 h-24 mx-auto bg-primary-100 rounded-full flex items-center justify-center mb-8">
          <Icons.Cog className="w-12 h-12 text-primary-600 animate-spin-slow" />
        </div>

        <h1 className="text-3xl font-bold text-secondary-900 mb-4">
          Under Maintenance
        </h1>
        <p className="text-secondary-600 mb-8">
          We're currently performing scheduled maintenance to improve your experience.
          We'll be back shortly!
        </p>

        <div className="bg-white rounded-xl p-6 shadow-card mb-8">
          <p className="text-sm text-secondary-500 mb-2">Estimated downtime</p>
          <p className="text-2xl font-bold text-secondary-900">~30 minutes</p>
        </div>

        <p className="text-sm text-secondary-500">
          Follow us on{' '}
          <a href="#" className="text-primary-600 hover:text-primary-700 font-medium">
            Twitter
          </a>{' '}
          for updates
        </p>
      </div>
    </div>
  );
};

// Offline Page
export const Offline = () => {
  return (
    <div className="min-h-screen bg-secondary-50 flex items-center justify-center p-4">
      <div className="text-center max-w-lg animate-fade-in">
        <div className="w-24 h-24 mx-auto bg-secondary-200 rounded-full flex items-center justify-center mb-8">
          <Icons.Globe className="w-12 h-12 text-secondary-500" />
        </div>

        <h1 className="text-3xl font-bold text-secondary-900 mb-4">
          You're Offline
        </h1>
        <p className="text-secondary-600 mb-8">
          It looks like you've lost your internet connection.
          Please check your network and try again.
        </p>

        <Button onClick={() => window.location.reload()}>
          <Icons.ArrowRight className="w-4 h-4 mr-2 rotate-[225deg]" />
          Try Again
        </Button>
      </div>
    </div>
  );
};

export default {
  NotFound,
  Unauthorized,
  ServerError,
  LoadingPage,
  EmptyStatePage,
  Maintenance,
  Offline,
};
