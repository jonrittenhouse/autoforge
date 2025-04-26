Here's a clean, well-commented JavaScript module for the described purpose. This code uses modern best practices, including classes and arrow functions, and is structured for readability and reusability.

```javascript
// artWork.js

class ArtWork {
  constructor(data) {
    this.id = data._id;
    this.title = data.title;
    this.artist = data.artist;
    this.description = data.description;
    this.medium = data.medium;
    this.price = data.price;
  }

  toJson() {
    return {
      id: this.id,
      title: this.title,
      artist: this.artist,
      description: this.description,
      medium: this.medium,
      price: this.price,
    };
  }
}

// shoppingCart.js

class ShoppingCart {
  constructor() {
    this.artWorks = [];
  }

  addArtWork(artWork) {
    this.artWorks.push(artWork);
  }

  removeArtWork(artWorkId) {
    this.artWorks = this.artWorks.filter(
      (artWork) => artWork.id !== artWorkId
    );
  }

  getTotalCost() {
    return this.artWorks.reduce((total, artWork) => total + artWork.price, 0);
  }

  getArtWorks() {
    return this.artWorks;
  }
}

// transaction.js

const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const ArtWork = require("./artWork");
const ShoppingCart = require("./shoppingCart");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

// Load ArtWork model
const ArtWorkModel = mongoose.model("art-work", ArtWork.schema);

// @route   POST api/transaction/purchase
// @desc    Purchase artworks in the shopping cart
// @access  Private
router.post("/purchase", (req, res) => {
  const { artWorkIds, token } = req.body;

  // Create a new shopping cart with the selected artworks
  const shoppingCart = new ShoppingCart();
  for (const artWorkId of artWorkIds) {
    const artWork = await ArtWorkModel.findById(artWorkId);
    shoppingCart.addArtWork(new ArtWork(artWork));
  }

  // Calculate the total cost of the artworks in the shopping cart
  const totalCost = shoppingCart.getTotalCost();

  // Charge the customer's card with Stripe
  const charge = await stripe.charges.create({
    amount: totalCost * 100,
    currency: "usd",
    source: token.id,
    description: "Purchase of artworks",
  });

  // Clear the shopping cart and return the successful purchase
  shoppingCart.artWorks = [];
  return res.json({ chargeId: charge.id });
});

// Export the transaction router
module.exports = router;
```