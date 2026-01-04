const router = require("express").Router();
const devAuth = require("../middleware/devAuth");
const PlayerProfile = require("../models/PlayerProfile");
const requireRole = require("../middleware/requireRole");

// POST /api/players/apply
router.post("/apply", devAuth, async (req, res) => {
  try {
    const { phone = "", district = "" } = req.body || {};

    const existing = await PlayerProfile.findOne({ userId: req.user._id });
    if (existing) {
      return res.status(409).json({
        ok: false,
        message: "You already applied",
        profile: existing,
      });
    }

    const profile = await PlayerProfile.create({
      userId: req.user._id,
      phone: phone?.trim(),
      district: district?.trim(),
      status: "pending",
    });

    return res.status(201).json({
      ok: true,
      message: "Application submitted",
      profile,
    });
  } catch (err) {
    console.error("apply error:", err);
    return res.status(500).json({ ok: false, message: "Server error" });
  }
});

// GET /api/players/pending (admin/superadmin)
router.get(
  "/pending",
  devAuth,
  requireRole(["admin", "superadmin"]),
  async (req, res) => {
    try {
      const pending = await PlayerProfile.find({ status: "pending" })
        .populate("userId", "name email role")
        .sort({ createdAt: -1 });

      return res.json({ ok: true, pending });
    } catch (err) {
      console.error("pending list error:", err);
      return res.status(500).json({ ok: false, message: "Server error" });
    }
  }
);


// GET /api/players/me
router.get("/me", devAuth, async (req, res) => {
  try {
    const profile = await PlayerProfile.findOne({ userId: req.user._id }).populate(
      "userId",
      "name email role"
    );

    if (!profile) {
      return res.json({
        ok: true,
        profile: null,
        message: "No application found",
      });
    }

    return res.json({ ok: true, profile });
  } catch (err) {
    console.error("me error:", err);
    return res.status(500).json({ ok: false, message: "Server error" });
  }
});


// PATCH /api/players/:id/approve (admin/superadmin)
router.patch(
  "/:id/approve",
  devAuth,
  requireRole(["admin", "superadmin"]),
  async (req, res) => {
    try {
      const { id } = req.params;

      const profile = await PlayerProfile.findById(id);
      if (!profile) {
        return res.status(404).json({ ok: false, message: "Profile not found" });
      }

      profile.status = "accepted";
      await profile.save();

      return res.json({ ok: true, message: "Approved", profile });
    } catch (err) {
      console.error("approve error:", err);
      return res.status(500).json({ ok: false, message: "Server error" });
    }
  }
);

// PATCH /api/players/:id/reject (admin/superadmin)
router.patch(
  "/:id/reject",
  devAuth,
  requireRole(["admin", "superadmin"]),
  async (req, res) => {
    try {
      const { id } = req.params;

      const profile = await PlayerProfile.findById(id);
      if (!profile) {
        return res.status(404).json({ ok: false, message: "Profile not found" });
      }

      profile.status = "rejected";
      await profile.save();

      return res.json({ ok: true, message: "Rejected", profile });
    } catch (err) {
      console.error("reject error:", err);
      return res.status(500).json({ ok: false, message: "Server error" });
    }
  }
);


module.exports = router;
