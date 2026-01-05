const router = require("express").Router();
const devAuth = require("../middleware/devAuth");
const requireRole = require("../middleware/requireRole");
const Match = require("../models/Match");

router.post("/", devAuth, requireRole(["admin", "superadmin"]), async (req, res) => {
  try {
    const {
      tournamentId,
      groupA,
      groupB,
      stage = "group",
      round = 1,
      scheduledAt,
      note = "",
    } = req.body || {};

    if (!tournamentId || !groupA || !groupB) {
      return res
        .status(400)
        .json({ ok: false, message: "tournamentId, groupA, groupB are required" });
    }

    if (groupA === groupB) {
      return res.status(400).json({ ok: false, message: "Team A and Team B must be different" });
    }

    const match = await Match.create({
      tournamentId,
      groupA,
      groupB,
      stage,
      round: Number(round) || 1,
      scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
      status: scheduledAt ? "scheduled" : "pending",
      note: String(note || ""),
    });

    return res.status(201).json({ ok: true, match });
  } catch (err) {
    console.error("create match error:", err);
    return res.status(500).json({ ok: false, message: "Server error" });
  }
});


router.get("/", async (req, res) => {
  try {
    const { tournamentId } = req.query;

    if (!tournamentId) {
      return res.status(400).json({ ok: false, message: "tournamentId query param is required" });
    }

    const matches = await Match.find({ tournamentId })
      .populate("groupA", "name")
      .populate("groupB", "name")
      .sort({ stage: 1, round: 1, scheduledAt: 1, createdAt: 1 });

    return res.json({ ok: true, matches });
  } catch (err) {
    console.error("list matches error:", err);
    return res.status(500).json({ ok: false, message: "Server error" });
  }
});


router.delete("/:id", devAuth, requireRole(["admin", "superadmin"]), async (req, res) => {
  try {
    const { id } = req.params;

    const match = await Match.findByIdAndDelete(id);
    if (!match) return res.status(404).json({ ok: false, message: "Match not found" });

    return res.json({ ok: true, message: "Deleted" });
  } catch (err) {
    console.error("delete match error:", err);
    return res.status(500).json({ ok: false, message: "Server error" });
  }
});


router.patch("/:id", devAuth, requireRole(["admin", "superadmin"]), async (req, res) => {
  try {
    const { id } = req.params;
    const { scheduledAt, note } = req.body || {};

    const match = await Match.findById(id);
    if (!match) return res.status(404).json({ ok: false, message: "Match not found" });

    //  allow schedule updates 
    if (scheduledAt !== undefined) {
      match.scheduledAt = scheduledAt ? new Date(scheduledAt) : null;
      match.status = match.scheduledAt ? "scheduled" : "pending";
    }

    // allow note updates
    if (note !== undefined) {
      match.note = String(note || "");
    }

    await match.save();
    return res.json({ ok: true, match });
  } catch (err) {
    console.error("match update error:", err);
    return res.status(500).json({ ok: false, message: "Server error" });
  }
});


module.exports = router;
