const mongoose = require("mongoose");

const ChatSchema = new mongoose.Schema(
  {
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
      }
    ],

    last_message: {
      sender_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      content: { type: String },
      created_at: { type: Date }
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Chat", ChatSchema);
