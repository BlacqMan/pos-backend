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
const stockAuditRoutes = require("./routes/stockAuditRoutes");
const shiftRoutes = require("./routes/shiftRoutes");

const app = express();

/* ===============================
   SECURITY
=============================== */
if (process.env.NODE_ENV === "production") {
  app.disable("x-powered-by");
}

app.use(helmet());

/* ===============================
   CORS CONFIGURATION (FIXED)
=============================== */
const allowedOrigins = [
  "http://localhost:5173",     // Local frontend
  process.env.CLIENT_URL       // Production frontend (Vercel)
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (Postman, mobile apps, etc.)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        return callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

/* ===============================
   MIDDLEWARE
=============================== */
app.use(express.json());
app.use("/api", apiLimiter);

/* ===============================
   ENVIRONMENT CHECK
=============================== */
["MONGO_URI", "JWT_SECRET", "CLIENT_URL"].forEach((key) => {
  if (!process.env[key]) {
    console.error(`Missing environment variable: ${key}`);
    process.exit(1);
  }
});

/* ===============================
   ROUTES
=============================== */
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/sales", saleRoutes);
app.use("/api/stock-audits", stockAuditRoutes);
app.use("/api/shifts", shiftRoutes);

app.get("/", (req, res) => {
  res.send("POS Backend Running");
});

/* ===============================
   SERVER START
=============================== */
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();
  app.listen(PORT, () =>
    console.log(`Server running on port ${PORT}`)
  );
};

startServer();
