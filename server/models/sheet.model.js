import { Schema, model } from "mongoose";

const problemSchema = Schema({
  title: {
    type: String,
    required: [true, "Problem title is required"],
    trim: true,
  },
  url: {
    type: String,
    required: [true, "Problem URL is required"],
    trim: true,
    match: [/^https?:\/\//, "Please provide a valid URL"],
  },
  difficulty: {
    type: String,
    enum: ["Easy", "Medium", "Hard"],
    default: "Medium",
  },
});

const SheetSchema = Schema(
  {
    title: {
      type: String,
      required: [true, "Sheet title is required"],
      trim: true,
      unique: true,
    },

    isSystemSheet: {
      type: Boolean,
      default: false,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: function () {
        return !this.isSystemSheet;
      },
    },
    problems: [problemSchema],
  },
  {
    timestamps: true,
  }
);

export const Sheet = model("Sheet", SheetSchema);
