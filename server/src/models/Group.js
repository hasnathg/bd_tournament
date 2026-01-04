const mongoose = require("mongoose");

const groupSchema = new mongoose.Schema(
  {
    tournamentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tournament",
      required: true,
    },
    name: { type: String, required: true, trim: true }, // Group A, Group B...

    players: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    capacity: { type: Number, required: true }, // snapshot of tournament groupSize
  },
  { timestamps: true }
);

module.exports = mongoose.model("Group", groupSchema);
