import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { apiGet, apiPost } from "../api/http";

const STAGES = [
  { value: "group", label: "Group Stage" },
  { value: "round2", label: "2nd Round" },
  { value: "quarter", label: "Quarter Final" },
  { value: "semi", label: "Semi Final" },
  { value: "final", label: "Final" },
];

export default function AdminFixtures() {
  const { user } = useAuth();

  const [tournaments, setTournaments] = useState([]);
  const [selectedId, setSelectedId] = useState("");

  const [groups, setGroups] = useState([]);
  const [matches, setMatches] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    stage: "group",
    round: 1,
    groupA: "",
    groupB: "",
    scheduledAt: "", 
    note: "",
  });

  const selectedTournament = useMemo(
    () => tournaments.find((t) => t._id === selectedId),
    [tournaments, selectedId]
  );

  const fetchTournaments = useCallback(async () => {
    const data = await apiGet("/tournaments");
    const list = data.tournaments || [];
    setTournaments(list);
    if (!selectedId && list.length) setSelectedId(list[0]._id);
  }, [selectedId]);

  const fetchGroups = useCallback(async (tournamentId) => {
    const data = await apiGet(`/tournaments/${tournamentId}/groups`);
    setGroups(data.groups || []);
  }, []);

  const fetchMatches = useCallback(async (tournamentId) => {
    
    const data = await apiGet(`/matches?tournamentId=${tournamentId}`);
    setMatches(data.matches || []);
  }, []);

  useEffect(() => {
    (async () => {
      try {
        setError("");
        setLoading(true);
        await fetchTournaments();
      } catch (e) {
        setError(e.message || "Failed to load tournaments");
      } finally {
        setLoading(false);
      }
    })();
  }, [fetchTournaments]);

  useEffect(() => {
    if (!selectedId) return;

    (async () => {
      try {
        setError("");
        await fetchGroups(selectedId);
        await fetchMatches(selectedId);
      } catch (e) {
        setError(e.message || "Failed to load fixtures data");
      }
    })();
  }, [selectedId, fetchGroups, fetchMatches]);

  // dropdown 
  useEffect(() => {
    if (!groups.length) return;
    setForm((f) => ({
      ...f,
      groupA: f.groupA || groups[0]._id,
      groupB: f.groupB || (groups[1]?._id || ""),
    }));
  }, [groups]);

  const stageLabel = (value) => STAGES.find((s) => s.value === value)?.label || value;

  const createMatch = async (e) => {
    e.preventDefault();
    setError("");

    if (!selectedId) return;
    if (!form.groupA || !form.groupB) {
      setError("Please select both Team A and Team B");
      return;
    }
    if (form.groupA === form.groupB) {
      setError("Team A and Team B must be different");
      return;
    }

    try {
      setSaving(true);

      
      const scheduledAtISO = form.scheduledAt ? new Date(form.scheduledAt).toISOString() : null;

      await apiPost(
        "/matches",
        {
          tournamentId: selectedId,
          groupA: form.groupA,
          groupB: form.groupB,
          stage: form.stage,
          round: Number(form.round) || 1,
          scheduledAt: scheduledAtISO,
          note: form.note,
        },
        user?.id
      );

      await fetchMatches(selectedId);

      // stage/round, reset teams/date/note
      setForm((f) => ({
        ...f,
        groupA: groups[0]?._id || "",
        groupB: groups[1]?._id || "",
        scheduledAt: "",
        note: "",
      }));
    } catch (e2) {
      setError(e2.message || "Failed to create match");
    } finally {
      setSaving(false);
    }
  };

  const deleteMatch = async (matchId) => {
    try {
      setError("");
      
      const res = await fetch(`${import.meta.env.VITE_API_BASE || "http://localhost:5000/api"}/matches/${matchId}`, {
        method: "DELETE",
        headers: { "x-user-id": user?.id },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Delete failed");

      await fetchMatches(selectedId);
    } catch (e) {
      setError(e.message || "Failed to delete match");
    }
  };

  const groupedMatches = useMemo(() => {
    const map = {};
    for (const m of matches) {
      const key = `${m.stage}__${m.round}`;
      if (!map[key]) map[key] = [];
      map[key].push(m);
    }
    return map;
  }, [matches]);

  if (loading) return <p>Loading...</p>;

  return (
    <div className="space-y-5">
      <div className="flex flex-col md:flex-row md:items-center gap-3 md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Fixtures</h1>
          <p className="text-base-content/70">
            Create and manage matches manually (team vs team).
          </p>
        </div>

        <div className="flex gap-2 items-center">
          <select
            className="select select-bordered"
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
          >
            {tournaments.map((t) => (
              <option key={t._id} value={t._id}>
                {t.name}
              </option>
            ))}
          </select>

          {selectedTournament && (
            <div className="badge badge-ghost">
              Teams: {groups.length}
            </div>
          )}
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="grid md:grid-cols-2 gap-4">
        {/* Create match card */}
        <div className="card border">
          <div className="card-body">
            <h2 className="text-lg font-semibold">Create Fixture</h2>

            {groups.length < 2 ? (
              <div className="alert">
                <span>
                  You need at least 2 teams (groups). Generate groups first.
                </span>
              </div>
            ) : (
              <form onSubmit={createMatch} className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="label">
                      <span className="label-text">Stage</span>
                    </label>
                    <select
                      className="select select-bordered w-full"
                      value={form.stage}
                      onChange={(e) => setForm((f) => ({ ...f, stage: e.target.value }))}
                    >
                      {STAGES.map((s) => (
                        <option key={s.value} value={s.value}>
                          {s.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="label">
                      <span className="label-text">Round</span>
                    </label>
                    <input
                      type="number"
                      min="1"
                      className="input input-bordered w-full"
                      value={form.round}
                      onChange={(e) => setForm((f) => ({ ...f, round: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="label">
                      <span className="label-text">Team A</span>
                    </label>
                    <select
                      className="select select-bordered w-full"
                      value={form.groupA}
                      onChange={(e) => setForm((f) => ({ ...f, groupA: e.target.value }))}
                    >
                      {groups.map((g) => (
                        <option key={g._id} value={g._id}>
                          {g.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="label">
                      <span className="label-text">Team B</span>
                    </label>
                    <select
                      className="select select-bordered w-full"
                      value={form.groupB}
                      onChange={(e) => setForm((f) => ({ ...f, groupB: e.target.value }))}
                    >
                      {groups.map((g) => (
                        <option key={g._id} value={g._id}>
                          {g.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="label">
                    <span className="label-text">Date & time</span>
                  </label>
                  <input
                    type="datetime-local"
                    className="input input-bordered w-full"
                    value={form.scheduledAt}
                    onChange={(e) => setForm((f) => ({ ...f, scheduledAt: e.target.value }))}
                  />
                </div>

                <div>
                  <label className="label">
                    <span className="label-text">Note (optional)</span>
                  </label>
                  <input
                    className="input input-bordered w-full"
                    placeholder="e.g., Ground 1 / Umpire / special note"
                    value={form.note}
                    onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
                  />
                </div>

                <button className="btn btn-outline w-full" disabled={saving}>
                  {saving ? "Saving..." : "Create Fixture"}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* List card */}
        <div className="card border">
          <div className="card-body">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">All Fixtures</h2>
              <div className="badge badge-ghost">{matches.length} matches</div>
            </div>

            {matches.length === 0 ? (
              <div className="alert mt-3">
                <span>No fixtures yet. Create one on the left.</span>
              </div>
            ) : (
              <div className="space-y-4 mt-3">
                {Object.entries(groupedMatches).map(([key, list]) => {
                  const [stage, round] = key.split("__");
                  return (
                    <div key={key} className="border rounded-box p-3">
                      <div className="flex items-center justify-between">
                        <div className="font-semibold">
                          {stageLabel(stage)} — Round {round}
                        </div>
                        <div className="badge badge-ghost">{list.length}</div>
                      </div>

                      <div className="divider my-2" />

                      <div className="space-y-2">
                        {list.map((m) => (
                          <div
                            key={m._id}
                            className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between"
                          >
                            <div className="font-medium">
                              {m.groupA?.name} vs {m.groupB?.name}
                            </div>

                            <div className="flex items-center gap-2">
                              <div className="badge badge-ghost">{m.status}</div>
                              <div className="text-sm text-base-content/70">
                                {m.scheduledAt ? new Date(m.scheduledAt).toLocaleString() : "Not scheduled"}
                              </div>
                              <button
                                className="btn btn-ghost btn-xs"
                                onClick={() => deleteMatch(m._id)}
                              >
                                Delete
                              </button>
                            </div>

                            {m.note ? (
                              <div className="text-sm text-base-content/70">
                                Note: {m.note}
                              </div>
                            ) : null}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
