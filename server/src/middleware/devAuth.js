const User = require("../models/User");

/**
 
  Need JWT middleware later
 */
const devAuth = async (req, res, next) => {
  try {
    const userId = req.header("x-user-id");
    if (!userId) {
      return res.status(401).json({ ok: false, message: "Missing x-user-id header" });
    }

    const user = await User.findById(userId).select("-passwordHash");
    if (!user) {
      return res.status(401).json({ ok: false, message: "Invalid user" });
    }

    req.user = user; 
    next();
  } catch (err) {
    console.error("devAuth error:", err);
    return res.status(500).json({ ok: false, message: "Server error" });
  }
};

module.exports = devAuth;
