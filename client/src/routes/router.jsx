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

const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
      { index: true, element: <Home /> },
      { path: "login", element: <Login /> },
      { path: "register", element: <Register /> },
      { path: "dashboard", element: <PlayerDashboard /> },
      
       {
        path: "admin",
        element: <AdminRoute />,
        children: [
          { path: "pending", element: <AdminPending /> },
          { path: "tournament", element: <AdminTournament /> },
        ],
      },
    ],
  },
]);
export default router;