require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./models/User");

const seedSuperAdmin = async () => {
  await mongoose.connect(process.env.MONGO_URI);

  const exists = await User.findOne({ role: "super_admin" });
  if (exists) {
    console.log("Super Admin already exists");
    process.exit();
  }

  await User.create({
    name: "Company Owner",
    email: "owner@company.com",
    password: "ChangeMe123!",
    role: "super_admin",
  });

  console.log("Super Admin created successfully");
  process.exit();
};

seedSuperAdmin();
