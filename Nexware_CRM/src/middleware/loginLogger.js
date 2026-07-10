module.exports = async (req, user, status = "success") => {
  try {
    if (!user) return;

    const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress || req.ip;
    const userAgent = req.headers["user-agent"] || "Unknown";

    user.lastLogin = {
      ip,
      userAgent,
      loginTime: new Date(),
      status
    };

    await user.save();
  } catch (error) {
    console.error("Login log saving failed:", error);
  }
};
