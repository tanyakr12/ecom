const ErrorHandler = require("../utils/errorHandler");

module.exports = (err, req, res, next) => {
  // make sure you provide req then after res
  err.statusCode = err.statusCode || 500;
  err.message = err.message || "Internal server error";

  // wrong mongodb id
  if(err.name === "CastError") {
    err.message = `Resource not found. Invalid ${err.path}`;
    err.statusCode = 400;
  }

  // mongoose duplicate key error
  if(err.code === 11000) {
    const message = `Duplicate ${Object.keys(err.keyValue)} entered`;
    err = new ErrorHandler (message, 400);
  }

  // wrong JWT error
  if(err.name === "JsonWebTokenError") {
    err.message = `Json web token is invalid, try again`;
    err = new ErrorHandler (message, 400);
  }

  // JWT expire error
  if(err.name === "TokenExpiredError") {
    err.message = `Json web token is expired, try again`;
    err = new ErrorHandler (message, 400);
  }

  res.status(err.statusCode).json({
    success: false,
    message: err.message,
    // error: err.stack, // can do this to get complete deatails of the error
  });
};
