const mongoose = require("mongoose");

const playerProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true, 
    },

    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
    },

    phone: {
      type: String,
      trim: true,
    },

    district: {
      type: String,
      trim: true,
    },

    notes: {
      type: String, // admin notes 
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("PlayerProfile", playerProfileSchema);
