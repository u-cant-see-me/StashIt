const errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode ? res.statusCode : 400;

  res.status(statusCode);
  console.error(err);
  res.json({
    message: err.message ? err.message : err,
    stack: process.env.NODE_ENV === "production" ? null : err.stack,
  });
};

export default errorHandler;
