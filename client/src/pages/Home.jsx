import React from 'react';
import { Link } from "react-router-dom";

const Home = () => {
    return (
         <div className="space-y-6">
      <div className="hero bg-base-200 rounded-box">
        <div className="hero-content text-center py-10">
          <div className="max-w-xl">
            <h1 className="text-3xl font-bold">BD Tournament</h1>
            <p className="py-4 text-base-content/80">
              Register to join the tournament. Your status and tournament details will be updated once the event setup is complete.
            </p>
            <div className="flex justify-center gap-3">
        <Link className="btn btn-outline rounded-full px-6" to="/register">
          Register
        </Link>
        <Link className="btn btn-ghost rounded-full px-6" to="/login">
          Login
        </Link>
      </div>
          </div>
        </div>
      </div>

      <div className="alert alert-info">
        <span>Coming soon......</span>
      </div>
    </div>
    );
};

export default Home;