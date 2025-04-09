export const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      error: 'Validation Error',
      details: err.errors,
    });
  }

  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({
      success: false,
      error: 'Unauthorized',
      message: 'Invalid token or token expired',
    });
  }

  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Server Error',
  });
}; 