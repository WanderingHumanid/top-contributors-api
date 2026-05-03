const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { createCanvas, loadImage } = require('canvas');

module.exports = async (req, res) => {
  const { limit = 5, size = 80 } = req.query;

  const limitInt = parseInt(limit, 10) || 5;
  const sizeInt = parseInt(size, 10) || 80;
  const gap = 16;

  try {
    const dataPath = path.join(__dirname, '..', 'data', 'contributors.json');
    
    if (!fs.existsSync(dataPath)) {
      return res.status(404).send('Data not found for username');
    }

    const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
    const topContributors = data.slice(0, limitInt);

    if (topContributors.length === 0) {
      // Return empty 1x1 png if no contributors
      const emptyCanvas = createCanvas(1, 1);
      res.setHeader('Content-Type', 'image/png');
      res.setHeader('Cache-Control', 's-maxage=86400');
      return emptyCanvas.createPNGStream().pipe(res);
    }

    // Canvas dimensions
    const width = (topContributors.length * sizeInt) + ((topContributors.length - 1) * gap);
    const height = sizeInt;

    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    // Load and draw all avatars
    for (let i = 0; i < topContributors.length; i++) {
      const contributor = topContributors[i];
      try {
        const response = await axios.get(contributor.avatar, { responseType: 'arraybuffer' });
        const img = await loadImage(Buffer.from(response.data, 'binary'));
        
        const x = i * (sizeInt + gap);
        const y = 0;
        
        ctx.save();
        ctx.beginPath();
        ctx.arc(x + sizeInt / 2, y + sizeInt / 2, sizeInt / 2, 0, Math.PI * 2, true);
        ctx.closePath();
        ctx.clip();
        
        ctx.drawImage(img, x, y, sizeInt, sizeInt);
        
        ctx.restore();
      } catch (err) {
        console.error(`Failed to load avatar for ${contributor.username}:`, err.message);
        // Draw a gray circle placeholder
        const x = i * (sizeInt + gap);
        const y = 0;
        ctx.save();
        ctx.beginPath();
        ctx.arc(x + sizeInt / 2, y + sizeInt / 2, sizeInt / 2, 0, Math.PI * 2, true);
        ctx.fillStyle = '#cccccc';
        ctx.fill();
        ctx.restore();
      }
    }

    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate');

    canvas.createPNGStream().pipe(res);
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).send('Internal Server Error');
  }
};
