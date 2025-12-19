import { Schema, model } from "mongoose";

const dailyChallengeSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },

    problems: [
      {
        title: String,
        url: String,
        difficulty: String,
        sheetName: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

//This line tells MongoDB: "I will allow many entries for User A, and many entries for Date X, but I will NEVER allow more than one entry where BOTH User is A AND Date is X."

dailyChallengeSchema.index(
  {
    user: 1,
    date: 1,
  },
  {
    unique: true,
  }
);

export const DailyChallenge = model("DailyChallenge", dailyChallengeSchema);
