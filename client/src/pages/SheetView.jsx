import React from "react";

const SheetView = () => {
  return <div>sheetView</div>;
};

export default SheetView;

/*
Sheet View (/sheet/:sheetId)
Backend Data: /getSheet/:sheetId

Interaction: /toggel-Status (Checkbox click)

Layout: Single Column "Document" View.

Design:

Header:

Left: Big Title (e.g., "Blind 75").

Right: Progress Bar (e.g., "15/75 Solved").

The List (ProblemTable):

A clean table with columns: Status | Problem Name | Difficulty | Link.

Row Logic: If solved, the row dims slightly and text gets a strikethrough.

Hover Effect: Rows highlight slightly (bg-[#161b22]) on hover.
*/
