const router = require("express").Router();
const devAuth = require("../middleware/devAuth");
const requireRole = require("../middleware/requireRole");
const Match = require("../models/Match");

// PATCH /api/matches/:id  (admin)
router.patch("/:id", devAuth, requireRole(["admin", "superadmin"]), async (req, res) => {
  try {
    const { id } = req.params;
    const { scheduledAt, note } = req.body || {};

    const match = await Match.findById(id);
    if (!match) return res.status(404).json({ ok: false, message: "Match not found" });

    if (scheduledAt !== undefined) {
      match.scheduledAt = scheduledAt ? new Date(scheduledAt) : null;
      match.status = match.scheduledAt ? "scheduled" : "pending";
    }
    if (note !== undefined) match.note = String(note || "");

    await match.save();
    return res.json({ ok: true, match });
  } catch (err) {
    console.error("match update error:", err);
    return res.status(500).json({ ok: false, message: "Server error" });
  }
});

module.exports = router;
