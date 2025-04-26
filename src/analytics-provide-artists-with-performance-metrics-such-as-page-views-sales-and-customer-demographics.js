Here's a simple, well-commented JavaScript module for an "Analytics" service that provides artists with performance metrics such as page views, sales, and customer demographics. This example uses the Express server and Mongoose for MongoDB functionality.

```javascript
// analytics.js

const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// Connect to MongoDB using Mongoose
const db = 'mongodb://localhost/myArtApp';
mongoose.connect(db, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const dbConnection = mongoose.connection;
dbConnection.on('error', console.error.bind(console, 'connection error:'));
dbConnection.once('open', () => {
  console.log('Connected to MongoDB');
});

// Define necessary data models
const pageViewSchema = new mongoose.Schema({
  artistId: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});
const PageView = mongoose.model('PageView', pageViewSchema);

const saleSchema = new mongoose.Schema({
  artistId: { type: String, required: true },
  productId: { type: String, required: true },
  buyerId: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});
const Sale = mongoose.model('Sale', saleSchema);

const customerSchema = new mongoose.Schema({
  id: { type: String, required: true },
  age: { type: Number },
  location: { type: String },
});
const Customer = mongoose.model('Customer', customerSchema);

// Middleware for authenticating artists
const auth = (req, res, next) => {
  // Assume authenticated with JWT (not shown)
  next();
};

// Analytics endpoints
router.get('/page-views/:artistId', auth, async (req, res) => {
  // Get page views for a particular artist
  try {
    const pageViews = await PageView.find({
      artistId: req.params.artistId,
    }).exec();

    res.send({ pageViews });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
});

router.get('/sales/:artistId', auth, async (req, res) => {
  // Get sales for a particular artist
  try {
    const sales = await Sale.find({
      artistId: req.params.artistId,
    }).exec();

    res.send({ sales });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
});

router.get('/customer-demographics/:artistId', auth, async (req, res) => {
  // Get customer demographics for a particular artist
  try {
    const customerIds = [];
    const sales = await Sale.find({
      artistId: req.params.artistId,
    }).exec();

    for (let sale of sales) {
      if (!customerIds.includes(sale.buyerId)) {
        customerIds.push(sale.buyerId);
      }
    }

    const customers = await Customer.find({
      id: { $in: customerIds },
    }).exec();

    res.send({ customers });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
});

module.exports = router;
```