const https = require('https');
const fs = require('fs');
const path = require('path');

const downloadFile = (url, outputPath) => {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(outputPath);
    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        return reject(new Error(`Failed to get '${url}' (${response.statusCode})`));
      }
      response.pipe(file);
      file.on('finish', () => file.close(resolve));
    }).on('error', (err) => {
      fs.unlink(outputPath, () => reject(err));
    });
  });
};

(async () => {
  const chromiumUrl = 'https://omniclonebucket.s3.amazonaws.com/chromium-v130.0.0-pack.tar';
  const outputPath = path.join(__dirname, 'chromium-v130.0.0-pack.tar');

  try {
    console.log('Downloading Chromium...');
    await downloadFile(chromiumUrl, outputPath);
    console.log('Chromium downloaded successfully!');
  } catch (error) {
    console.error('Error downloading Chromium:', error);
    process.exit(1);
  }
})();