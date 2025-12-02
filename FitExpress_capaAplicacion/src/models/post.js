const mongoose = require("mongoose");

const CommentSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    text: { type: String, required: true },
    created_at: { type: Date, default: Date.now }
  },
  { _id: false }
);

const PostSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    content: { type: String },
    image: { type: String },

    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      }
    ],

    comments: [CommentSchema]
  },
  { timestamps: true }
);

module.exports = mongoose.model("Post", PostSchema);
