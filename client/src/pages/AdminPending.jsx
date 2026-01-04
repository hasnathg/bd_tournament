import { useCallback, useEffect, useState } from "react";
import { apiGet, apiPatch } from "../api/http";
import { useAuth } from "../context/AuthContext";

export default function AdminPending() {
  const { user } = useAuth();

  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actingId, setActingId] = useState(""); // disable buttons while processing

  const fetchPending = useCallback(async () => {
    try {
      setError("");
      setLoading(true);
      const data = await apiGet("/players/pending", user?.id);
      setPending(data.pending || []);
    } catch (err) {
      setError(err.message || "Failed to load pending applications");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) fetchPending();
  }, [user, fetchPending]);

  const updateStatus = async (profileId, action) => {
    try {
      setError("");
      setActingId(profileId);

      await apiPatch(`/players/${profileId}/${action}`, null, user?.id);

      // Refresh list
      await fetchPending();
    } catch (err) {
      setError(err.message || "Action failed");
    } finally {
      setActingId("");
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Pending Applications</h1>

      {error && <div className="alert alert-error">{error}</div>}

      {!error && pending.length === 0 && (
        <div className="alert">
          <span>No pending applications.</span>
        </div>
      )}

      {pending.length > 0 && (
        <div className="overflow-x-auto border rounded-box">
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>District</th>
                <th>Applied</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>

            <tbody>
              {pending.map((p) => (
                <tr key={p._id}>
                  <td>{p.userId?.name || "-"}</td>
                  <td>{p.userId?.email || "-"}</td>
                  <td>{p.phone || "-"}</td>
                  <td>{p.district || "-"}</td>
                  <td>{new Date(p.createdAt).toLocaleString()}</td>

                  <td className="text-right space-x-2">
                    <button
                      className="btn btn-outline btn-sm"
                      disabled={actingId === p._id}
                      onClick={() => updateStatus(p._id, "approve")}
                    >
                      Approve
                    </button>

                    <button
                      className="btn btn-ghost btn-sm"
                      disabled={actingId === p._id}
                      onClick={() => updateStatus(p._id, "reject")}
                    >
                      Reject
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
