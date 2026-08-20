export const errorHandler = (err, req, res, next) => {
  console.error('API Error:', err);

  const statusCode = err.status || err.statusCode || 500;
  
  // Format consistent error message
  res.status(statusCode).json({
    status: statusCode,
    message: err.message || 'An unexpected server error occurred',
    timestamp: new Date().toISOString(),
    path: req.originalUrl,
  });
};
