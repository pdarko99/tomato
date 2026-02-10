const BACKEND = "https://ecommerce-backend-production-bab1.up.railway.app";

module.exports = {
  "/api": {
    target: BACKEND,
    secure: true,
    changeOrigin: true,
  },
  "/auth": {
    target: BACKEND,
    secure: true,
    changeOrigin: true,
    bypass(req) {
      // Skip proxy for browser navigation (page refresh / direct URL visit)
      // Only proxy XHR/fetch calls from Angular (which don't accept text/html)
      if (req.headers.accept && req.headers.accept.includes("text/html")) {
        return "/index.html";
      }
    },
  },
};
