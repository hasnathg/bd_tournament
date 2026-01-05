const router = require("express").Router();
const devAuth = require("../middleware/devAuth");
const requireRole = require("../middleware/requireRole");
const Match = require("../models/Match");


const Group = require("../models/Group");
const PlayerProfile = require("../models/PlayerProfile");
const Tournament = require("../models/Tournament");

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// POST /api/tournaments (admin)
router.post("/", devAuth, requireRole(["admin", "superadmin"]), async (req, res) => {
  try {
    const { name, groupSize = 6, startDate, registrationDeadline } = req.body || {};

    if (!name) {
      return res.status(400).json({ ok: false, message: "Tournament name is required" });
    }

    const tournament = await Tournament.create({
      name: name.trim(),
      groupSize: Number(groupSize),
      startDate: startDate ? new Date(startDate) : undefined,
      registrationDeadline: registrationDeadline
        ? new Date(registrationDeadline)
        : undefined,
      createdBy: req.user._id,
      status: "registration",
    });

    return res.status(201).json({ ok: true, tournament });
  } catch (err) {
    console.error("create tournament error:", err);
    return res.status(500).json({ ok: false, message: "Server error" });
  }
});

// GET /api/tournaments
router.get("/", async (req, res) => {
  try {
    const tournaments = await Tournament.find().sort({ createdAt: -1 });
    return res.json({ ok: true, tournaments });
  } catch (err) {
    console.error("list tournaments error:", err);
    return res.status(500).json({ ok: false, message: "Server error" });
  }
});

// POST /api/tournaments/:id/generate-groups (admin)
router.post(
  "/:id/generate-groups",
  devAuth,
  requireRole(["admin", "superadmin"]),
  async (req, res) => {
    try {
      const { id } = req.params;

      const tournament = await Tournament.findById(id);
      if (!tournament) {
        return res.status(404).json({ ok: false, message: "Tournament not found" });
      }

      const groupSize = tournament.groupSize;

      // 1) Get accepted players
      const acceptedProfiles = await PlayerProfile.find({ status: "accepted" })
        .sort({ createdAt: 1 })
        .select("userId");

      const acceptedUserIds = acceptedProfiles.map((p) => p.userId);

      if (acceptedUserIds.length === 0) {
        return res.status(400).json({ ok: false, message: "No accepted players to group" });
      }

      // 2) Clear existing groups
      await Group.deleteMany({ tournamentId: tournament._id });

      // 3) Build groups
      const groups = [];
      const remainder = acceptedUserIds.length % groupSize;
      const totalGroups =
        Math.floor(acceptedUserIds.length / groupSize) +
        (remainder > 0 ? 1 : 0);

      const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

      let index = 0;
      for (let i = 0; i < totalGroups; i++) {
        const players = acceptedUserIds.slice(index, index + groupSize);
        index += players.length;

        const group = await Group.create({
          tournamentId: tournament._id,
          name: `Group ${letters[i] || i + 1}`,
          players,
          capacity: groupSize,
        });

        groups.push(group);
      }

      // 4) Waiting list (not used yet)
      tournament.waitingList = [];
      await tournament.save();

      return res.json({
        ok: true,
        message: "Groups generated",
        stats: {
          acceptedPlayers: acceptedUserIds.length,
          groupSize,
          groupsCreated: groups.length,
          lastGroupNeeds: remainder === 0 ? 0 : groupSize - remainder,
        },
        groups,
      });
    } catch (err) {
      console.error("generate groups error:", err);
      return res.status(500).json({ ok: false, message: "Server error" });
    }
  }
);

// GET /api/tournaments/:id/groups
router.get("/:id/groups", async (req, res) => {
  try {
    const { id } = req.params;

    const groups = await Group.find({ tournamentId: id })
      .populate("players", "name email role")
      .sort({ name: 1 });

    return res.json({ ok: true, groups });
  } catch (err) {
    console.error("list groups error:", err);
    return res.status(500).json({ ok: false, message: "Server error" });
  }
});

// GET /api/tournaments/:id/my-group  (dev auth)
router.get("/:id/my-group", devAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const group = await Group.findOne({
      tournamentId: id,
      players: req.user._id,
    }).populate("players", "name email role");

    if (!group) {
      return res.json({ ok: true, group: null });
    }

    return res.json({ ok: true, group });
  } catch (err) {
    console.error("my-group error:", err);
    return res.status(500).json({ ok: false, message: "Server error" });
  }
});

// POST /api/tournaments/:id/generate-team-fixtures (admin)
// Creates random team-vs-team fixtures from existing groups. Clears previous matches.
router.post(
  "/:id/generate-team-fixtures",
  devAuth,
  requireRole(["admin", "superadmin"]),
  async (req, res) => {
    try {
      const { id } = req.params;

      const tournament = await Tournament.findById(id);
      if (!tournament) {
        return res.status(404).json({ ok: false, message: "Tournament not found" });
      }

      // Pull groups (teams)
      const groups = await Group.find({ tournamentId: id }).select("_id name players capacity");
      if (groups.length < 2) {
        return res
          .status(400)
          .json({ ok: false, message: "Need at least 2 groups to generate fixtures." });
      }

      
      const eligible = groups.filter((g) => (g.players?.length || 0) > 0);

      if (eligible.length < 2) {
        return res.status(400).json({
          ok: false,
          message: "Not enough eligible groups (teams) with players to generate fixtures.",
        });
      }

      // Clear existing matches for this tournament
      await Match.deleteMany({ tournamentId: id });

      const shuffled = shuffle(eligible);
      let created = 0;
      let byeTeam = null;

      // If odd number of teams, one team gets a BYE 
      if (shuffled.length % 2 === 1) {
        byeTeam = shuffled.pop();
      }

      // Pair sequentially: 0v1, 2v3, ...
      for (let i = 0; i < shuffled.length; i += 2) {
        const A = shuffled[i];
        const B = shuffled[i + 1];

        await Match.create({
          tournamentId: id,
          groupA: A._id,
          groupB: B._id,
          round: 1,
          scheduledAt: null,
          status: "pending",
        });

        created += 1;
      }

      return res.json({
        ok: true,
        message: "Team fixtures generated (Round 1)",
        stats: {
          teams: eligible.length,
          matchesCreated: created,
          byeTeam: byeTeam ? { id: byeTeam._id, name: byeTeam.name } : null,
        },
      });
    } catch (err) {
      console.error("generate team fixtures error:", err);
      return res.status(500).json({ ok: false, message: "Server error" });
    }
  }
);

// GET /api/tournaments/:id/team-fixtures
router.get("/:id/team-fixtures", async (req, res) => {
  try {
    const { id } = req.params;

    const matches = await Match.find({ tournamentId: id })
      .populate("groupA", "name players capacity")
      .populate("groupB", "name players capacity")
      .sort({ round: 1, createdAt: 1 });

    return res.json({ ok: true, matches });
  } catch (err) {
    console.error("list team fixtures error:", err);
    return res.status(500).json({ ok: false, message: "Server error" });
  }
});



module.exports = router;
