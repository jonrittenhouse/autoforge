```javascript
// Import required modules and set up the express router
const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

const Artwork = require('../models/artwork');
const User = require('../models/user');

// Set up the Nodemailer transport with your email provider
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'your-email@gmail.com',
    pass: 'your-email-password'
  }
});

/* GET automated-delivery page. */
router.post('/', async (req, res) => {

  // Get the user and the artworks from the request payload
  const { userId, artworks } = req.body;

  // Verify the user and artworks exist
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).send('Invalid user ID');
  }

  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).send('User not found');
  }

  const artworkIds = artworks.map(artwork => artwork.id);
  const artworksInDb = await Artwork.find({ _id: { $in: artworkIds } });

  if (artworks.length !== artworksInDb.length) {
    return res.status(404).send('Some artworks not found');
  }

  // Prepare the order details and send email to user
  const orderDetails = artworks.map(artwork => ({
    id: artwork.id,
    title: artwork.title,
    thumbnail: artwork.thumbnail,
    quantity: artwork.quantity
  }));

  const orderedArtworksEmail = `
    <h2>Order Summary</h2>
    <ul>
      ${orderDetails.map(artwork => `
        <li>
          <img src="${artwork.thumbnail}" width="100" height="100" alt="${artwork.title}" />
          <h3>${artwork.title}</h3>
          <p>Quantity: ${artwork.quantity}</p>
        </li>
      `).join('')}
    </ul>
  `;

  await transporter.sendMail({
    from: 'your-email@gmail.com',
    to: user.email,
    subject: 'Your Artwork Order',
    html: orderedArtworksEmail
  });

  // Prepare the direct download link for each artwork
  const artworksDirectory = './artworks';
  const timestamp = Date.now();
  const downloadLinks = orderDetails.map(artwork => ({
    ...artwork,
    downloadLink: `http://localhost:3000/download/${artwork.id}/${timestamp}`
  }));

  // Create a zip file containing the artwork files and send the zip download link
  const zipFilename = `artwork-order_${timestamp}.zip`;
  const zipFilePath = path.join(__dirname, '..', 'public', zipFilename);
  const zipFolder = path.join(__dirname, '..', 'public', 'artwork-order_zip');

  // Create the artwork order folder
  if (!fs.existsSync(zipFolder)) {
    fs.mkdirSync(zipFolder);
  }

  // Download the artworks and add them to the zip folder
  for (const artwork of downloadLinks) {
    const artworkInDb = artworksInDb.find(a => a._id.toString() === artwork.id);
    const artworkPath = path.join(artworksDirectory, artworkInDb.file);

    const artworkDownloadStream = fs.createReadStream(artworkPath);
    const artworkUploadStream = fs.createWriteStream(path.join(zipFolder, artworkInDb.file));

    artworkDownloadStream.pipe(artworkUploadStream);
  }

  // Zip the folder
  const zip = new (require('adm-zip'))();
  zip.addLocalFolder(zipFolder);
  zip.writeZip(zipFilePath)
    .then(() => {
      // Clean up the folder
      fs.rmdirSync(zipFolder, { recursive: true });

      // Send the zip download link
      res.status(200).json({
        orderDetails: downloadLinks,
        zipDownloadLink: `http://localhost:3000/download/${zipFilename}`
      });
    })
    .catch(err => {
      console.error(err);
      res.status(500).send('Failed to generate the download link');
    });
});

module.exports = router;
```