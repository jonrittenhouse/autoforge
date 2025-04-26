Here's a complete JavaScript module for secure payments using Stripe, utilizing modern best practices for readability and reusability:

```javascript
// Import required modules and initialize Stripe
const express = require('express');
const router = express.Router();
const stripe = require('stripe')('YOUR_STRIPE_SECRET_KEY');

// Set up Stripe payment charges
router.post('/payment', async (req, res) => {
  const { amount, currency, source, description } = req.body;

  try {
    // Create a payment charge with Stripe
    const charge = await stripe.charges.create({
      amount,
      currency,
      source,
      description,
    });

    // Send success response
    res.status(200).json({ success: true, charge });
  } catch (error) {
    // Send error response
    res.status(500).json({ success: false, error: error.message });
  }
});

// Export payment router for use in server.js
module.exports = router;
```

Replace `'YOUR_STRIPE_SECRET_KEY'` with your actual Stripe secret key. Make sure you have properly initialized Stripe and Express, and included necessary dependencies in your project.

Note: This is a basic example and can be extended further, such as adding webhooks for handling payment events or validating the `source` object for security purposes.