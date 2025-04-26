Here's a well-commented JavaScript module for artwork hosting and showcasing using a Mongoose schema:

```javascript
// Import required modules
const mongoose = require('mongoose');
const { DateTime } = require('luxon');

// Define the artwork schema
const artworkSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: ['Paintings', 'Illustrations', 'Digital Art', 'Sketches'],
      required: true,
    },
    collection: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Collection',
    },
    price: Number,
    sold: {
      type: Boolean,
      default: false,
    },
    createdAt: {
      type: DateTime,
      default: DateTime.local(),
    },
  },
  {
    versionKey: false,
    timestamps: {
      createdAt: 'createdAt',
    },
  }
);

// Pre-save hook to validate price presence if artwork is not free
artworkSchema.pre('save', function (next) {
  if (this.price && this.price <= 0) {
    this.price = null;
  }
  next();
});

// Define the Artwork model
const Artwork = mongoose.model('Artwork', artworkSchema);

// Export the Artwork model
module.exports = Artwork;
```

And here's the Collection model that was referenced but not included in the original request:

```javascript
// Import required modules
const mongoose = require('mongoose');

// Define the collection schema
const collectionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    picture: {
      type: String,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    private: {
      type: Boolean,
      default: false,
    },
  },
  {
    versionKey: false,
    timestamps: {
      createdAt: 'createdAt',
    },
  }
);

// Define the Collection model
const Collection = mongoose.model('Collection', collectionSchema);

// Export the Collection model
module.exports = Collection;
```

These are two separate modules, each exporting a Mongoose model: Artwork and Collection.