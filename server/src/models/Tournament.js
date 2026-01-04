const mongoose = require("mongoose");

const tournamentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ["draft", "registration", "grouping", "scheduled", "completed"],
      default: "registration",
    },
    groupSize: { type: Number, default: 6, min: 2, max: 20 },
    registrationDeadline: { type: Date },
    startDate: { type: Date },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    waitingList: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);
module.exports = mongoose.model("Tournament", tournamentSchema);
