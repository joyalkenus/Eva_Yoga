const express = require('express');
const { google } = require('googleapis');

const router = express.Router();

// Custom Search Engine ID
const CX_ID = 'f054ae2edb7fe4aa6';

// Ensure the API key is set in the environment variables
const API_KEY = process.env.GOOGLE_API_KEY;
if (!API_KEY) {
  console.error('GOOGLE_API_KEY environment variable not set');
  process.exit(1);
}

router.get('/', async (req, res) => {
  const { poseName } = req.query;

  if (!poseName) {
    return res.status(400).json({ error: 'Pose name is required' });
  }

  try {
    const customsearch = google.customsearch('v1');

    // Prepend "Yoga pose" to the search query to get more relevant images
    const query = `Yoga pose ${poseName}`;

    const response = await customsearch.cse.list({
      cx: CX_ID,
      q: query,
      searchType: 'image',
      num: 3,
      imgSize: 'medium',
      safe: 'active',
      key: API_KEY,  // Use the API key for authentication
    });

    if (response.data.items && response.data.items.length > 0) {
      res.json({ imageUrl: response.data.items[0].link });
    } else {
      res.json({ imageUrl: null });
    }
  } catch (error) {
    console.error('Error fetching pose image:', error.message);
    res.status(500).json({ error: 'Failed to fetch pose image' });
  }
});

module.exports = router;