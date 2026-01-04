import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { apiGet, apiPost } from "../api/http";

// TEMP: need to fetch
const TOURNAMENT_ID = "695a72061868cc63bfd0fa14";

export default function PlayerDashboard() {
  const { user } = useAuth();

  const [profile, setProfile] = useState(null);
  const [myGroup, setMyGroup] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    phone: "",
    district: "",
  });

  
  const fetchProfile = useCallback(async () => {
    try {
      setError("");
      const data = await apiGet("/players/me", user?.id);
      setProfile(data.profile);
    } catch (err) {
      setError(err.message || "Failed to load profile");
    } finally {
      setLoading(false);
    }
  }, [user]);

  
  const fetchMyGroup = useCallback(async () => {
    try {
      const data = await apiGet(
        `/tournaments/${TOURNAMENT_ID}/my-group`,
        user?.id
      );
      setMyGroup(data.group);
    } catch {
      setMyGroup(null);
    }
  }, [user]);

 
  useEffect(() => {
    if (user) fetchProfile();
  }, [user, fetchProfile]);

  
  useEffect(() => {
    if (profile?.status === "accepted") {
      fetchMyGroup();
    } else {
      setMyGroup(null);
    }
  }, [profile, fetchMyGroup]);

  
  const apply = async (e) => {
    e.preventDefault();
    setError("");

    try {
      await apiPost(
        "/players/apply",
        {
          phone: form.phone,
          district: form.district,
        },
        user?.id
      );
      await fetchProfile();
    } catch (err) {
      setError(err.message || "Failed to apply");
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Player Dashboard</h1>

      {error && <div className="alert alert-error">{error}</div>}

      
      {!profile && (
        <div className="card border">
          <div className="card-body space-y-4">
            <h2 className="font-medium">Apply to tournament</h2>

            <form onSubmit={apply} className="space-y-3">
              <input
                className="input input-bordered w-full"
                placeholder="Phone"
                value={form.phone}
                onChange={(e) =>
                  setForm({ ...form, phone: e.target.value })
                }
                required
              />

              <input
                className="input input-bordered w-full"
                placeholder="District"
                value={form.district}
                onChange={(e) =>
                  setForm({ ...form, district: e.target.value })
                }
                required
              />

              <button className="btn btn-outline">Apply</button>
            </form>
          </div>
        </div>
      )}

   
      {profile?.status === "pending" && (
        <div className="alert alert-warning">
          <span>Your application is pending for approval.</span>
        </div>
      )}

      
      {profile?.status === "rejected" && (
        <div className="alert alert-error">
          <span>Your application was rejected.</span>
        </div>
      )}

     
      {profile?.status === "accepted" && (
        <>
          <div className="alert alert-success">
            <span>You are accepted into the tournament.</span>
          </div>

          {myGroup ? (
            <div className="card border">
              <div className="card-body">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold">{myGroup.name}</h2>
                  <div className="badge badge-ghost">
                    {myGroup.players.length}/{myGroup.capacity}
                  </div>
                </div>

                {myGroup.capacity - myGroup.players.length > 0 ? (
                  <div className="badge badge-warning mt-2">
                    Needs {myGroup.capacity - myGroup.players.length} more
                  </div>
                ) : (
                  <div className="badge badge-success mt-2">Full</div>
                )}

                <div className="divider" />

                <ul className="space-y-2">
                  {myGroup.players.map((p) => (
                    <li
                      key={p._id}
                      className="flex justify-between items-center"
                    >
                      <span className="font-medium">{p.name}</span>
                      <span className="text-sm text-base-content/70">
                        {p.email}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <div className="alert">
              <span>Accepted, but not assigned to a group yet.</span>
            </div>
          )}
        </>
      )}
    </div>
  );
}
