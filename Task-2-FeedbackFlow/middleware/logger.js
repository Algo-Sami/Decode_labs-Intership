const stats = {
  totalRequests: 0,
  methods: {
    GET: 0,
    POST: 0,
    PUT: 0,
    DELETE: 0
  },
  lastRequest: null,
  bootTime: new Date()
};

function logger(req, res, next) {
  stats.totalRequests++;
  const method = req.method;
  stats.methods[method] = (stats.methods[method] || 0) + 1;

  const startHrTime = process.hrtime();

  res.on('finish', () => {
    const elapsedHrTime = process.hrtime(startHrTime);
    const durationMs = (elapsedHrTime[0] * 1000 + elapsedHrTime[1] / 1e6).toFixed(2);
    const resSize = res.get('Content-Length') || '0';

    stats.lastRequest = {
      method: req.method,
      path: req.originalUrl || req.url,
      timestamp: new Date().toISOString(),
      statusCode: res.statusCode,
      durationMs: parseFloat(durationMs),
      responseSize: resSize,
      body: req.method === 'POST' ? req.body : null
    };
  });

  next();
}

module.exports = {
  logger,
  stats
};
