export function notFound(req, res, next) {
  res.status(404).json({
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
}

export function errorHandler(err, req, res, next) {
  console.error(err);

  // Invalid JSON in request body
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      message: 'Invalid JSON request body.',
    });
  }

  // Mongoose validation errors
  if (err?.name === 'ValidationError') {
    return res.status(400).json({
      message: err.message,
    });
  }

  // Invalid MongoDB resource ID
  if (err?.name === 'CastError') {
    return res.status(400).json({
      message: 'Invalid resource ID.',
    });
  }

  // Duplicate MongoDB record
  if (err?.code === 11000) {
    return res.status(409).json({
      message: 'A record with this information already exists.',
    });
  }

  // CORS rejection
  if (err?.message === 'Origin not allowed by CORS') {
    return res.status(403).json({
      message: 'This origin is not allowed.',
    });
  }

  // Handle explicitly defined client errors
  const status = Number(err?.status || err?.statusCode);

  if (Number.isInteger(status) && status >= 400 && status < 500) {
    return res.status(status).json({
      message: err.message || 'Request failed.',
    });
  }

  // Do not expose internal server details to clients.
  return res.status(500).json({
    message: 'Internal server error.',
  });
}