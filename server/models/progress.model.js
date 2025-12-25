import { Schema, model } from "mongoose";

const ProgressSchema = Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    problemUrl: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ["pending", "done"],
      default: "pending",
    },
    completedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

ProgressSchema.index(
  {
    user: 1,
    problemUrl: 1,
  },
  {
    unique: true,
  }
);

export const Progress = model("Progress", ProgressSchema);
