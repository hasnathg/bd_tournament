const mongoose = require("mongoose");

const matchSchema = new mongoose.Schema(
  {
    tournamentId: { type: mongoose.Schema.Types.ObjectId, ref: "Tournament", required: true },

    groupA: { type: mongoose.Schema.Types.ObjectId, ref: "Group", required: true },
    groupB: { type: mongoose.Schema.Types.ObjectId, ref: "Group", required: true },
     
    stage: {
      type: String,
      enum: ["group", "round2", "quarter", "semi", "final"],
      default: "group",
    },
    
    round: { type: Number, default: 1 },

    scheduledAt: { type: Date, default: null },
    status: { type: String, enum: ["pending", "scheduled"], default: "pending" },

    note: { type: String, default: "" }, 
  },
  { timestamps: true }
);

module.exports = mongoose.model("Match", matchSchema);
