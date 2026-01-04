import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Outlet } from 'react-router-dom';

const MainLayout = () => {
    return (
        <div className="min-h-screen flex flex-col bg-base-100">
      <Navbar />

      <main className="flex-1">
        <div className="max-w-5xl mx-auto w-full px-4 py-8">
          <Outlet />
        </div>
      </main>

      <Footer />
    </div>
    );
};

export default MainLayout;