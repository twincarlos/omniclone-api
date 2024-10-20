const https = require('https');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

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

const extractTarFile = (filePath, outputDir) => {
  return new Promise((resolve, reject) => {
    exec(`tar -xvf ${filePath} -C ${outputDir}`, (error, stdout, stderr) => {
      if (error) {
        return reject(new Error(`Error extracting file: ${stderr}`));
      }
      resolve(stdout);
    });
  });
};

(async () => {
  const chromiumUrl = 'https://omniclonebucket.s3.amazonaws.com/chromium-v130.0.0-pack.tar';
  const tarPath = path.join(__dirname, 'chromium-v130.0.0-pack.tar');
  const extractPath = path.join(__dirname, 'chromium');

  try {
    console.log('Downloading Chromium...');
    await downloadFile(chromiumUrl, tarPath);
    console.log('Download complete! Extracting...');
    await extractTarFile(tarPath, extractPath);
    console.log('Extraction complete!');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
})();
