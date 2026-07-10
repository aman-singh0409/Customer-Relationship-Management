const sanitizeHtml = require("sanitize-html");

// Clean request body, query, and params
module.exports = (req, res, next) => {
  const clean = (obj) => {
    for (const key in obj) {
      if (typeof obj[key] === "string") {
        obj[key] = sanitizeHtml(obj[key], {
          allowedTags: [], 
          allowedAttributes: {}, 
        });
      } else if (typeof obj[key] === "object" && obj[key] !== null) {
        clean(obj[key]); 
      }
    }
  };

  clean(req.body);
  clean(req.query);
  clean(req.params);

  next();
};
