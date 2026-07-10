module.exports = (req, res, next) => {
  const secret = req.headers["x-developer-key"];
  if (!secret || secret !== process.env.DEVELOPER_SECRET) {
    return res.status(403).json({ message: "Access denied" });
  }
  next();
};
