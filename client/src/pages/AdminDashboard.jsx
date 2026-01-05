import { useCallback, useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { apiGet } from "../api/http";
import { useAuth } from "../context/AuthContext";

export default function AdminDashboard() {
  const { user } = useAuth();

  const [pendingCount, setPendingCount] = useState(0);

  const [fixtureCount, setFixtureCount] = useState(0);

  const [loading, setLoading] = useState(true);

  const fetchCounts = useCallback(async () => {
    try {
      
      const pendingData = await apiGet("/players/pending", user?.id);
      setPendingCount((pendingData.pending || []).length);

      const tData = await apiGet("/tournaments");
      const latest = (tData.tournaments || [])[0];

      if (latest?._id) {
        const mData = await apiGet(`/matches?tournamentId=${latest._id}`);
        setFixtureCount((mData.matches || []).length);
      } else {
        setFixtureCount(0);
      }
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) fetchCounts();
  }, [user, fetchCounts]);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
        <p className="text-base-content/70">
          Manage approvals, tournaments, teams, and fixtures.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {/* Pending Applications */}
        <div className="card border">
          <div className="card-body">
            <h2 className="font-semibold">Pending Applications</h2>
            <p className="text-base-content/70">
              Approve or reject players before grouping into teams.
            </p>

            <div className="flex items-center justify-between mt-2">
              <div className="badge badge-ghost">
                {loading ? "Loading..." : `${pendingCount} pending`}
              </div>

              <NavLink to="/admin/pending" className="btn btn-outline btn-sm">
                Open
              </NavLink>
            </div>
          </div>
        </div>

        {/* Tournament Control */}
        <div className="card border">
          <div className="card-body">
            <h2 className="font-semibold">Tournament Control</h2>
            <p className="text-base-content/70">
              Create tournament, generate teams.
            </p>

            <div className="flex items-center justify-end mt-2">
              <NavLink to="/admin/tournament" className="btn btn-outline btn-sm">
                Open
              </NavLink>
            </div>
          </div>
        </div>

        {/* Fixtures */}
        <div className="card border">
          <div className="card-body">
            <h2 className="font-semibold">Fixtures</h2>
            <p className="text-base-content/70">
              Create match schedules manually (team vs team) by stage and round.
            </p>

            <div className="flex items-center justify-between mt-2">
              <div className="badge badge-ghost">
                {loading ? "Loading..." : `${fixtureCount} fixtures`}
              </div>

              {/* link to fixtures page */}
              <NavLink to="/admin/fixtures" className="btn btn-outline btn-sm">
                Open
              </NavLink>
            </div>
          </div>
        </div>
      </div>

      <div className="alert">
        <span>
          Approve players → Generate teams → Create fixtures (stages/rounds).
        </span>
      </div>
    </div>
  );
}
