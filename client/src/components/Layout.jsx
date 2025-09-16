import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/authContext';
import { ArrowLeftOnRectangleIcon, Cog6ToothIcon, HomeIcon } from '@heroicons/react/24/outline';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from './LanguageSwitcher';

const Layout = ({ children }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const baseLinkClass = "flex items-center space-x-2 px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-100 transition-colors duration-150";
  const activeLinkClass = "bg-slate-200 text-slate-900 font-semibold";

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-white border-b border-slate-200">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <div className="text-lg font-bold text-slate-800">{t('nav.title')}</div>
            <div className="flex items-center space-x-4">
              <NavLink 
                to="/dashboard" 
                className={({ isActive }) => `${baseLinkClass} ${isActive ? activeLinkClass : ''}`}
              >
                <HomeIcon className="h-5 w-5" />
                <span className="min-w-[80px] text-center">{t('nav.dashboard')}</span>
              </NavLink>
              <NavLink 
                to="/admin" 
                className={({ isActive }) => `${baseLinkClass} ${isActive ? activeLinkClass : ''}`}
              >
                <Cog6ToothIcon className="h-5 w-5" />
                <span className="min-w-[80px] text-center">{t('nav.adminPanel')}</span>
              </NavLink>
              <LanguageSwitcher />
              <button 
                onClick={handleLogout} 
                className="flex items-center space-x-2 px-3 py-2 rounded-lg text-slate-700 hover:bg-red-50 hover:text-red-600 transition-colors duration-150"
              >
                <ArrowLeftOnRectangleIcon className="h-5 w-5" />
                <span className="min-w-[80px] text-center">{t('nav.logout')}</span>
              </button>
            </div>
          </div>
        </div>
      </nav>
      <main>
        {children}
      </main>
    </div>
  );
};

export default Layout;
