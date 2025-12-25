import { Sheet } from "../models/sheet.model";
import ApiError from "../utils/apiErr.utils";
import ApiRes from "../utils/ApiRes.utils";
import { asyncHandler } from "../utils/asyncHandler.utils";

// sheetController

//get sheet info
//varify
//create sheet obj
//save obj to db
//if error  -> send res
//if suss -> send response

export const createSheet = asyncHandler(async (req, res) => {
  const { title, isSystemSheet, owner, problems } = req.body;

  if (!title || !isSystemSheet || !owner || !problems)
    throw new ApiError(400, " all feilds are required");

  const newSheet = await Sheet.create({
    title,
    isSystemSheet,
    owner,
    problems,
  });

  const createdSheet = await Sheet.findById(newSheet._id);

  if (!createSheet) {
    throw new ApiError(500, "Something went wrong while creating new sheet");
  }

  return res
    .status(201)
    .json(new ApiRes(200, createdSheet, "sheet created successfully"));
});
