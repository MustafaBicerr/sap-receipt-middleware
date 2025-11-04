export function errorHandler(err, _req, res, _next) {
  console.error('ERROR:', err.message);
  res.status(500).json({ status: 'ERROR', message: err.message });
}
