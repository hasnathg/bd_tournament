import React, { Children } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import Home from '../pages/Home';
import Login from '../pages/Login';
import Register from '../pages/Register';
import MainLayout from '../layouts/MainLayout';
import PlayerDashboard from '../pages/PlayerDashboard';
import AdminPending from '../pages/AdminPending';
import AdminRoute from './AdminRoute';
import AdminTournament from '../pages/AdminTournament';
import PrivateRoute from './PrivateRoute';
import DashboardGate from '../pages/DashboardGate';
import AdminDashboard from '../pages/AdminDashboard';

const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
      { index: true, element: <Home /> },
      { path: "login", element: <Login /> },
      { path: "register", element: <Register /> },
      {
        element: <PrivateRoute />,
       children: [
          { path: "dashboard", element: <DashboardGate /> }, 
          { path: "dashboard/player", element: <PlayerDashboard /> }, 
        ],
      },


      
       {
        path: "admin",
        element: <AdminRoute />,
        children: [
          { index: true, element: <AdminDashboard /> }, 
          { path: "pending", element: <AdminPending /> },
          { path: "tournament", element: <AdminTournament /> },
        ],
      },
      
    ],
  },
]);
export default router;