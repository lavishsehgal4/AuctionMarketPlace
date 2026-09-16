const metrics = {
  totalRequests: 0,
  successfulRequests: 0,
  totalErrors: 0,
  errorsByStatus: {},
  errorsByEndpoint: {},
};

function recordResponse(method, requestPath, statusCode) {
  metrics.totalRequests += 1;

  if (statusCode < 400) {
    metrics.successfulRequests += 1;
    return;
  }

  metrics.totalErrors += 1;
  const status = String(statusCode);
  const endpoint = `${method} ${requestPath}`;
  metrics.errorsByStatus[status] = (metrics.errorsByStatus[status] || 0) + 1;
  metrics.errorsByEndpoint[endpoint] = (metrics.errorsByEndpoint[endpoint] || 0) + 1;
}

function getMetrics() {
  return JSON.parse(JSON.stringify(metrics));
}

module.exports = { getMetrics, recordResponse };