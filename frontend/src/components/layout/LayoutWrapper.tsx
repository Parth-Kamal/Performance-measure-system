import React from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

const LayoutWrapper = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const pageTitle = location.pathname === '/' ? 'Dashboard' : location.pathname.substring(1);

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <Header title={pageTitle} />
      <main className="pl-60 pt-16 min-h-screen">
        <div className="p-8 animate-in fade-in duration-500">
          {children}
        </div>
      </main>
    </div>
  );
};

export default LayoutWrapper;
