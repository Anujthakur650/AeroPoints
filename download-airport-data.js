// This script downloads the airport data from datahub.io and saves it locally
import fs from 'fs';
import https from 'https';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the current file's directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const url = 'https://r2.datahub.io/clt98lrmc000fl708ilem2s44/main/raw/data/airport-codes.csv';
const outputDir = path.join(__dirname, 'public', 'data');
const outputFile = path.join(outputDir, 'airport-codes.csv');

// Create directory if it doesn't exist
if (!fs.existsSync(outputDir)) {
  console.log(`Creating directory: ${outputDir}`);
  fs.mkdirSync(outputDir, { recursive: true });
}

console.log(`Downloading airport data from ${url}...`);

const file = fs.createWriteStream(outputFile);
https.get(url, (response) => {
  if (response.statusCode !== 200) {
    console.error(`Failed to download: ${response.statusCode} ${response.statusMessage}`);
    file.close();
    fs.unlinkSync(outputFile); // Delete the file
    return;
  }

  response.pipe(file);

  file.on('finish', () => {
    file.close();
    console.log(`Download complete! File saved to: ${outputFile}`);
    
    // Read the first few lines to verify
    const fileContent = fs.readFileSync(outputFile, 'utf-8');
    const lines = fileContent.split('\n');
    
    console.log(`File contains ${lines.length} lines`);
    console.log('First line (headers):', lines[0]);
    if (lines.length > 1) {
      console.log('Second line (first entry):', lines[1]);
    }
  });
}).on('error', (err) => {
  console.error('Error during download:', err);
  file.close();
  fs.unlinkSync(outputFile); // Delete the file
}); 