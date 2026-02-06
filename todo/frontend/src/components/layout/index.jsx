import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Icons } from '../ui/Icons';
import { Avatar, Menu , MenuItem  } from '@mui/material';

// Header Component for authenticated pages
export const Header = ({ onMenuClick, sidebarOpen }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [notificationCount] = React.useState(3);

  return (
    <header className="sticky top-0 z-40 glass border-b border-secondary-200">
      <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
        {/* Left side - Menu button (mobile) */}
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 text-secondary-500 hover:text-secondary-700 hover:bg-secondary-100 rounded-lg transition-colors"
            aria-label="Toggle sidebar"
          >
            <Icons.Menu className="w-6 h-6" />
          </button>
          
          {/* Search bar */}
          <div className="hidden sm:flex items-center">
            <div className="relative">
              <Icons.Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary-400" />
              <input
                type="text"
                placeholder="Search tasks..."
                className="w-64 lg:w-80 pl-10 pr-4 py-2 text-sm bg-secondary-100 border-0 rounded-lg focus:bg-white focus:ring-2 focus:ring-primary-500 transition-all"
              />
            </div>
          </div>
        </div>

        {/* Right side - Actions */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Mobile search button */}
          <button className="sm:hidden p-2 text-secondary-500 hover:text-secondary-700 hover:bg-secondary-100 rounded-lg transition-colors">
            <Icons.Search className="w-5 h-5" />
          </button>

          {/* Notifications */}
          <Menu 
            trigger={
              <button className="relative p-2 text-secondary-500 hover:text-secondary-700 hover:bg-secondary-100 rounded-lg transition-colors">
                <Icons.Bell className="w-5 h-5" />
                {notificationCount > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-danger-500 rounded-full" />
                )}
              </button>
            }
          >
            <div className="px-4 py-3 border-b border-secondary-100">
              <p className="text-sm font-semibold text-secondary-900">Notifications</p>
              <p className="text-xs text-secondary-500">{notificationCount} unread</p>
            </div>
            <div className="max-h-64 overflow-y-auto">
              <MenuItem >
                <div className="flex-1">
                  <p className="text-sm text-secondary-900">Task "Design Review" is due soon</p>
                  <p className="text-xs text-secondary-500">2 hours ago</p>
                </div>
              </MenuItem >
              <MenuItem >
                <div className="flex-1">
                  <p className="text-sm text-secondary-900">You completed 5 tasks today!</p>
                  <p className="text-xs text-secondary-500">5 hours ago</p>
                </div>
              </MenuItem >
            </div>
            <div className="px-4 py-3 border-t border-secondary-100">
              <Link to="/notifications" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                View all notifications
              </Link>
            </div>
          </Menu >

          {/* User menu */}
          <Menu 
            trigger={
              <button className="flex items-center gap-3 p-1.5 hover:bg-secondary-100 rounded-lg transition-colors">
                <Avatar name={user?.name || 'User'} size="sm" />
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-medium text-secondary-900">{user?.name || 'User'}</p>
                  <p className="text-xs text-secondary-500">{user?.email || 'user@example.com'}</p>
                </div>
                <Icons.ChevronDown className="hidden sm:block w-4 h-4 text-secondary-400" />
              </button>
            }
          >
            <div className="px-4 py-3 border-b border-secondary-100 sm:hidden">
              <p className="text-sm font-semibold text-secondary-900">{user?.name || 'User'}</p>
              <p className="text-xs text-secondary-500">{user?.email || 'user@example.com'}</p>
            </div>
            <MenuItem  onClick={() => navigate('/profile')}>
              <Icons.User className="w-4 h-4" />
              <span>Profile</span>
            </MenuItem >
            <MenuItem  onClick={() => navigate('/settings')}>
              <Icons.Cog className="w-4 h-4" />
              <span>Settings</span>
            </MenuItem >
            <div className="border-t border-secondary-100 my-1" />
            <MenuItem  danger onClick={() => { logout(); navigate('/login'); }}>
              <Icons.Logout className="w-4 h-4" />
              <span>Sign out</span>
            </MenuItem >
          </Menu >
        </div>
      </div>
    </header>
  );
};

// Sidebar Component
export const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();
  
  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Icons.Squares },
    { name: 'Tasks', href: '/tasks', icon: Icons.ClipboardList },
    { name: 'Notifications', href: '/notifications', icon: Icons.Bell },
    { name: 'Profile', href: '/profile', icon: Icons.User },
    { name: 'Settings', href: '/settings', icon: Icons.Cog },
  ];

  const isActive = (href) => location.pathname === href || location.pathname.startsWith(href + '/');

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-64 bg-white border-r border-secondary-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:z-auto ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-secondary-200">
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center">
              <Icons.CheckCircle className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-secondary-900">TaskFlow</span>
          </Link>
          <button
            onClick={onClose}
            className="lg:hidden p-1 text-secondary-400 hover:text-secondary-600"
          >
            <Icons.X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={isActive(item.href) ? 'nav-link-active' : 'nav-link'}
                onClick={onClose}
              >
                <Icon className="w-5 h-5" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

       
      </aside>
    </>
  );
};

// Footer Component
export const Footer = () => {
  return (
    <footer className="bg-white border-t border-secondary-200 py-6">
      <div className="container-app">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-secondary-500">
            © {new Date().getFullYear()} TaskFlow. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <a href="#" className="text-sm text-secondary-500 hover:text-secondary-700 transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="text-sm text-secondary-500 hover:text-secondary-700 transition-colors">
              Terms of Service
            </a>
            <a href="#" className="text-sm text-secondary-500 hover:text-secondary-700 transition-colors">
              Help Center
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

// Public Header (for landing, login, register pages)
export const PublicHeader = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  return (
    <header className="sticky top-0 z-50 glass border-b border-secondary-200">
      <div className="container-app">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center">
              <Icons.CheckCircle className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-secondary-900">TaskFlow</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-medium text-secondary-600 hover:text-secondary-900 transition-colors">
              Features
            </a>
            <a href="#pricing" className="text-sm font-medium text-secondary-600 hover:text-secondary-900 transition-colors">
              Pricing
            </a>
            <a href="#about" className="text-sm font-medium text-secondary-600 hover:text-secondary-900 transition-colors">
              About
            </a>
          </nav>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <Link to="/login" className="btn-ghost">
              Sign in
            </Link>
            <Link to="/register" className="btn-primary">
              Get Started
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-secondary-500 hover:text-secondary-700"
          >
            {mobileMenuOpen ? (
              <Icons.X className="w-6 h-6" />
            ) : (
              <Icons.Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-secondary-200 animate-slide-down">
            <nav className="flex flex-col gap-2">
              <a href="#features" className="px-4 py-2 text-sm font-medium text-secondary-600 hover:bg-secondary-100 rounded-lg">
                Features
              </a>
              <a href="#pricing" className="px-4 py-2 text-sm font-medium text-secondary-600 hover:bg-secondary-100 rounded-lg">
                Pricing
              </a>
              <a href="#about" className="px-4 py-2 text-sm font-medium text-secondary-600 hover:bg-secondary-100 rounded-lg">
                About
              </a>
              <div className="border-t border-secondary-200 my-2" />
              <Link to="/login" className="px-4 py-2 text-sm font-medium text-secondary-600 hover:bg-secondary-100 rounded-lg">
                Sign in
              </Link>
              <Link to="/register" className="mx-4 btn-primary text-center">
                Get Started
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

// Public Footer
export const PublicFooter = () => {
  const footerLinks = {
    product: [
      { name: 'Features', href: '#features' },
      { name: 'Pricing', href: '#pricing' },
      { name: 'Integrations', href: '#' },
      { name: 'Changelog', href: '#' },
    ],
    company: [
      { name: 'About', href: '#about' },
      { name: 'Blog', href: '#' },
      { name: 'Careers', href: '#' },
      { name: 'Contact', href: '#' },
    ],
    resources: [
      { name: 'Documentation', href: '#' },
      { name: 'Help Center', href: '#' },
      { name: 'API Reference', href: '#' },
      { name: 'Status', href: '#' },
    ],
    legal: [
      { name: 'Privacy', href: '#' },
      { name: 'Terms', href: '#' },
      { name: 'Cookie Policy', href: '#' },
    ],
  };

  return (
    <footer className="bg-secondary-900 text-white">
      <div className="container-app py-12 lg:py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-4 lg:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-primary-400 to-primary-600 rounded-lg flex items-center justify-center">
                <Icons.CheckCircle className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold">TaskFlow</span>
            </Link>
            <p className="text-secondary-400 text-sm mb-4">
              The modern task management platform for teams and individuals.
            </p>
            <div className="flex items-center gap-4">
              <a href="#" className="text-secondary-400 hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                </svg>
              </a>
              <a href="#" className="text-secondary-400 hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
              </a>
              <a href="#" className="text-secondary-400 hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-sm font-semibold mb-4">Product</h3>
            <ul className="space-y-3">
              {footerLinks.product.map((link) => (
                <li key={link.name}>
                  <a href={link.href} className="text-sm text-secondary-400 hover:text-white transition-colors">
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold mb-4">Company</h3>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <a href={link.href} className="text-sm text-secondary-400 hover:text-white transition-colors">
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold mb-4">Resources</h3>
            <ul className="space-y-3">
              {footerLinks.resources.map((link) => (
                <li key={link.name}>
                  <a href={link.href} className="text-sm text-secondary-400 hover:text-white transition-colors">
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold mb-4">Legal</h3>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.name}>
                  <a href={link.href} className="text-sm text-secondary-400 hover:text-white transition-colors">
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-secondary-800 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-secondary-400">
            © {new Date().getFullYear()} TaskFlow. All rights reserved.
          </p>
          <div className="flex items-center gap-2">
            <span className="text-sm text-secondary-400">Made with</span>
            <Icons.Heart className="w-4 h-4 text-danger-500" />
            <span className="text-sm text-secondary-400">by TaskFlow Team</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

// Main Layout for authenticated pages
export const MainLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  return (
    <div className="min-h-screen bg-secondary-50">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="lg:pl-64">
        <Header onMenuClick={() => setSidebarOpen(true)} sidebarOpen={sidebarOpen} />
        <main className="p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

// Public Layout for landing, auth pages
export const PublicLayout = ({ children, showFooter = true }) => {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <PublicHeader />
      <main className="flex-1">
        {children}
      </main>
      {showFooter && <PublicFooter />}
    </div>
  );
};

// Auth Layout (minimal layout for login/register)
export const AuthLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex flex-col">
      <div className="container-app py-6">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center">
            <Icons.CheckCircle className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-secondary-900">TaskFlow</span>
        </Link>
      </div>
      <main className="flex-1 flex items-center justify-center p-4">
        {children}
      </main>
      <footer className="py-6 text-center">
        <p className="text-sm text-secondary-500">
          © {new Date().getFullYear()} TaskFlow. All rights reserved.
        </p>
      </footer>
    </div>
  );
};
