const express = require("express");
const cors = require("cors");
const { MongoClient } = require("mongodb");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection URL
const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function run() {
  try {
    // Connect to MongoDB
    await client.connect();
    console.log("Connected to MongoDB");

    const db = client.db("gadget");
    const flashSalecollection = db.collection("flashSale");
    const trendingProductscollection = db.collection("trendingProducts");

    // flash
    app.post("/api/v1/flash-sale", async (req, res) => {
      const { name, image, amount, offer, flashSale } = req.body;
      const createdAt = new Date();
      const defaultFlashSale = true;
      const data = await flashSalecollection.insertOne({
        name,
        image,
        amount,
        offer,
        createdAt,
        flashSale: flashSale !== undefined ? flashSale : defaultFlashSale,
      });
      res.send(data);
    });

    app.get("/api/v1/flash-sale", async (req, res) => {
      const result = await flashSalecollection
        .find({ flashSale: true })
        .sort({ createdAt: -1 })
        .toArray();
      res.send(result);
    });

    // Trending Products

    app.post("/api/v1/trending-products", async (req, res) => {
      const { name, image, amount, offer, ratings } = req.body;
      const data = await trendingProductscollection.insertOne({
        name,
        image,
        amount,
        offer,
        ratings,
      });
      res.send(data);
    });

    app.get("/api/v1/trending-products", async (req, res) => {
      const result = await trendingProductscollection
        .find()
        .sort({ ratings: -1 })
        .toArray();
      res.send(result);
    });

    // Start the server
    app.listen(port, () => {
      console.log(`Server is running on http://localhost:${port}`);
    });
  } finally {
  }
}

run().catch(console.dir);

// Test route
app.get("/", (req, res) => {
  const serverStatus = {
    message: "Server is running smoothly",
    timestamp: new Date(),
  };
  res.json(serverStatus);
});
