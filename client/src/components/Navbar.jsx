import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const { user, logout } = useAuth();

  const navLinkClass = ({ isActive }) =>
    `btn btn-ghost btn-sm ${isActive ? "btn-active" : ""}`;

  const isAdmin = user?.role === "admin" || user?.role === "superadmin";

  return (
    <div className="navbar bg-base-100 border-b">
      <div className="max-w-5xl mx-auto w-full px-4">
        <div className="flex w-full items-center">
          {/* Left */}
          <div className="flex-1">
            <NavLink to="/" className="btn btn-ghost text-xl">
              BD Tournament
            </NavLink>
          </div>

          {/* Desktop menu */}
          <div className="hidden md:flex gap-2 items-center">
            <NavLink to="/" className={navLinkClass}>
              Home
            </NavLink>

            {/* Not logged in */}
            {!user && (
              <>
                <NavLink to="/login" className={navLinkClass}>
                  Login
                </NavLink>
                <NavLink to="/register" className="btn btn-outline btn-sm">
                  Register
                </NavLink>
              </>
            )}

            {/* Logged in */}
            {user && (
              <>
                {/* Player */}
                {!isAdmin && (
                  <NavLink to="/dashboard" className={navLinkClass}>
                    Dashboard
                  </NavLink>
                )}

                {/* Admin */}
                {isAdmin && (
                  <NavLink to="/admin" className={navLinkClass}>
                    Admin
                  </NavLink>
                )}

                <button className="btn btn-outline btn-sm" onClick={logout}>
                  Logout
                </button>
              </>
            )}
          </div>

          {/* Mobile menu */}
          <div className="md:hidden">
            <div className="dropdown dropdown-end">
              <label tabIndex={0} className="btn btn-ghost">
                ☰
              </label>

              <ul
                tabIndex={0}
                className="menu dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-56"
              >
                <li>
                  <NavLink to="/">Home</NavLink>
                </li>

                {!user ? (
                  <>
                    <li>
                      <NavLink to="/login">Login</NavLink>
                    </li>
                    <li>
                      <NavLink to="/register">Register</NavLink>
                    </li>
                  </>
                ) : (
                  <>
                    {!isAdmin && (
                      <li>
                        <NavLink to="/dashboard">Dashboard</NavLink>
                      </li>
                    )}

                    {isAdmin && (
                      <li>
                        <NavLink to="/admin">Admin</NavLink>
                      </li>
                    )}

                    <li>
                      <button onClick={logout}>Logout</button>
                    </li>
                  </>
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
