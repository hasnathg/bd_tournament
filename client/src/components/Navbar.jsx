import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from "../context/AuthContext";


const Navbar = () => {
     const navLinkClass = ({ isActive }) =>
    `btn btn-ghost btn-sm ${isActive ? "btn-active" : ""}`;
     const { user } = useAuth();

    return (
        <div className="navbar bg-base-100 border-b">
      <div className="max-w-5xl mx-auto w-full px-4">
        <div className="flex w-full items-center">
          {/* Left*/}
          <div className="flex-1">
            <NavLink to="/" className="btn btn-ghost text-xl">
              BD Tournament
            </NavLink>
          </div>

          {/* Right */}
          <div className="hidden md:flex gap-2">
            <NavLink to="/" className={navLinkClass}>
              Home
            </NavLink>
            <NavLink to="/login" className={navLinkClass}>
              Login
            </NavLink>
            <NavLink
            to="/register"
            className="btn btn-outline btn-sm"
          >
            Register
          </NavLink>
          <NavLink to="/dashboard" className="btn btn-ghost btn-sm">
  Dashboard
</NavLink>
{user?.role === "admin" || user?.role === "superadmin" ? (
  <NavLink to="/admin/pending" className="btn btn-ghost btn-sm">
    Admin
  </NavLink>
) : null}

<NavLink to="/admin/tournament" className="btn btn-ghost btn-sm">
  Admin
</NavLink>


          </div>

          {/* Right: Mobile dropdown */}
          <div className="md:hidden">
            <div className="dropdown dropdown-end">
              <label tabIndex={0} className="btn btn-ghost">
                ☰
              </label>
              <ul
                tabIndex={0}
                className="menu dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52"
              >
                <li>
                  <NavLink to="/">Home</NavLink>
                </li>
                <li>
                  <NavLink to="/login">Login</NavLink>
                </li>
                <li>
                  <NavLink to="/register">Register</NavLink>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
    );
};

export default Navbar;