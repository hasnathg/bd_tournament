import { useCallback, useEffect, useMemo, useState } from "react";
import { apiGet, apiPost } from "../api/http";
import { useAuth } from "../context/AuthContext";

export default function AdminTournament() {
  const { user } = useAuth();

  const [tournaments, setTournaments] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [groups, setGroups] = useState([]);

  const [loadingT, setLoadingT] = useState(true);
  const [loadingG, setLoadingG] = useState(false);
  const [error, setError] = useState("");

  const selectedTournament = useMemo(
    () => tournaments.find((t) => t._id === selectedId),
    [tournaments, selectedId]
  );

  const fetchTournaments = useCallback(async () => {
    try {
      setError("");
      setLoadingT(true);
      const data = await apiGet("/tournaments");
      setTournaments(data.tournaments || []);
      if (!selectedId && data.tournaments?.length) {
        setSelectedId(data.tournaments[0]._id);
      }
    } catch (err) {
      setError(err.message || "Failed to load tournaments");
    } finally {
      setLoadingT(false);
    }
  }, [selectedId]);

  const fetchGroups = useCallback(async (tournamentId) => {
    try {
      setError("");
      setLoadingG(true);
      const data = await apiGet(`/tournaments/${tournamentId}/groups`);
      setGroups(data.groups || []);
    } catch (err) {
      setError(err.message || "Failed to load groups");
    } finally {
      setLoadingG(false);
    }
  }, []);

  useEffect(() => {
    fetchTournaments();
  }, [fetchTournaments]);

  useEffect(() => {
    if (selectedId) fetchGroups(selectedId);
  }, [selectedId, fetchGroups]);

  const generateGroups = async () => {
    if (!selectedId) return;
    try {
      setError("");
      setLoadingG(true);
      await apiPost(`/tournaments/${selectedId}/generate-groups`, {}, user?.id);
      await fetchGroups(selectedId);
    } catch (err) {
      setError(err.message || "Failed to generate groups");
    } finally {
      setLoadingG(false);
    }
  };

  if (loadingT) return <p>Loading...</p>;

  return (
    <div className="space-y-5">
      <div className="flex flex-col md:flex-row md:items-center gap-3 md:justify-between">
        <h1 className="text-2xl font-semibold">Tournament Admin</h1>

        <div className="flex gap-2 items-center">
          <select
            className="select select-bordered"
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
          >
            {tournaments.map((t) => (
              <option key={t._id} value={t._id}>
                {t.name} (groupSize: {t.groupSize})
              </option>
            ))}
          </select>

          <button className="btn btn-outline" onClick={generateGroups} disabled={loadingG}>
            {loadingG ? "Working..." : "Generate Groups"}
          </button>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {selectedTournament && (
        <div className="card border">
          <div className="card-body">
            <div className="flex flex-wrap gap-2 items-center justify-between">
              <h2 className="text-lg font-medium">{selectedTournament.name}</h2>
              <div className="badge badge-ghost">
                Group size: {selectedTournament.groupSize}
              </div>
            </div>

            {groups.length === 0 && !loadingG && (
              <div className="alert">
                <span>No groups yet. Click “Generate Groups”.</span>
              </div>
            )}

            {groups.length > 0 && (
              <div className="grid md:grid-cols-2 gap-4">
                {groups.map((g) => {
                  const missing = Math.max(0, g.capacity - (g.players?.length || 0));

                  return (
                    <div key={g._id} className="card border bg-base-100">
                      <div className="card-body">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold">{g.name}</h3>
                          {missing > 0 ? (
                            <div className="badge badge-warning">
                              Needs {missing} more
                            </div>
                          ) : (
                            <div className="badge badge-success">Full</div>
                          )}
                        </div>

                        <div className="divider my-2" />

                        <ul className="space-y-2">
                          {(g.players || []).map((p) => (
                            <li key={p._id} className="flex items-center justify-between">
                              <span className="font-medium">{p.name}</span>
                              <span className="text-sm text-base-content/70">{p.email}</span>
                            </li>
                          ))}
                        </ul>

                        {(g.players || []).length === 0 && (
                          <p className="text-sm text-base-content/70">No players assigned.</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
