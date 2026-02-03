const User = require("../models/User");

// ===============================
// GET ALL USERS (ADMIN)
// ===============================
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password -pinCode");
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ===============================
// DELETE USER (ADMIN)
// ===============================
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    await user.deleteOne();
    res.json({ message: "User deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
