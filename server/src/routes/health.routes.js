const router = require("express").Router();

router.get("/", (req, res) => {
  res.json({ ok: true, message: "BD Tournament API is running" });
});

module.exports = router;
