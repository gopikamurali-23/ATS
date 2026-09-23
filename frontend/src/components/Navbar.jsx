import React from 'react';
import { TopBar } from './home/TopBar';
import { MainNavbar } from './home/MainNavbar';

export const Navbar = ({ currentNav, onNavigate, onOpenAuthModal }) => {
  return (
    <div className="sticky top-0 z-50">
      <TopBar 
        onNavigate={onNavigate}
      />
      <MainNavbar 
        currentNav={currentNav}
        onNavigate={onNavigate}
        onOpenAuthModal={onOpenAuthModal}
      />
    </div>
  );
};
