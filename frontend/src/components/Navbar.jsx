import React from 'react';
import { TopBar } from './home/TopBar';
import { MainNavbar } from './home/MainNavbar';

export const Navbar = ({ onOpenAuthModal }) => {
  return (
    <div className="sticky top-0 z-50">
      <TopBar />
      <MainNavbar 
        onOpenAuthModal={onOpenAuthModal}
      />
    </div>
  );
};
