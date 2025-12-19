export const asyncHandler = (req, res, next) => {
  return (req, res, next) => {
    Promise.resolve(req, res, next).catch((err) => next(err));
  };
};
