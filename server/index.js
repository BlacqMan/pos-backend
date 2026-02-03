require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const connectDB = require("./config/db");
const { apiLimiter } = require("./middleware/rateLimiter");

const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");
const userRoutes = require("./routes/userRoutes");
const productRoutes = require("./routes/productRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const saleRoutes = require("./routes/saleRoutes");

const app = express();

if (process.env.NODE_ENV === "production") {
  app.disable("x-powered-by");
}

app.use(helmet());

app.use(
  cors({
    origin:
      process.env.NODE_ENV === "production"
        ? process.env.CLIENT_URL
        : "*",
    credentials: true,
  })
);

app.use("/api", apiLimiter);
app.use(express.json());

["MONGO_URI", "JWT_SECRET", "CLIENT_URL"].forEach((key) => {
  if (!process.env[key]) {
    console.error(`Missing environment variable: ${key}`);
    process.exit(1);
  }
});

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/sales", saleRoutes);

app.get("/", (req, res) => {
  res.send("POS Backend Running");
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();
  app.listen(PORT, () =>
    console.log(`Server running on port ${PORT}`)
  );
};

startServer();
