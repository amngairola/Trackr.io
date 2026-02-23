const asyncHandler = (requestHandler) => {
  return (req, res, next) => {
    Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err));
  };
};

export { asyncHandler };


const asyncHandler = (reqH) =>{
  return (req , res , next)=>{
    Prommise.resolve(reqH(req , res , next)).catch(err)=>next(err)
  }
}