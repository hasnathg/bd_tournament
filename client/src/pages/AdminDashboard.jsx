import { useCallback, useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { apiGet } from "../api/http";
import { useAuth } from "../context/AuthContext";

export default function AdminDashboard() {
  const { user } = useAuth();
  const [pendingCount, setPendingCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchCounts = useCallback(async () => {
    try {
      
      const data = await apiGet("/players/pending", user?.id);
      setPendingCount((data.pending || []).length);
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
          Manage approvals, tournaments, and groups.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="card border">
          <div className="card-body">
            <h2 className="font-semibold">Pending Applications</h2>
            <p className="text-base-content/70">
              Review player applications and approve/reject.
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

        <div className="card border">
          <div className="card-body">
            <h2 className="font-semibold">Tournament Control</h2>
            <p className="text-base-content/70">
              Generate groups and monitor group capacity.
            </p>

            <div className="flex items-center justify-end mt-2">
              <NavLink to="/admin/tournament" className="btn btn-outline btn-sm">
                Open
              </NavLink>
            </div>
          </div>
        </div>
      </div>

      <div className="alert">
        <span>
          Approve players first, then generate groups from Tournament Control.
        </span>
      </div>
    </div>
  );
}
