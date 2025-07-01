#!/usr/bin/env node

import QRCode from 'qrcode';
import QRTerminal from 'qrcode-terminal';
import chalk from 'chalk';
import fs from 'fs';
import path from 'path';

class QRCodeGenerator {
  constructor() {
    this.outputDir = './mobile-qr-codes';
    this.ensureOutputDir();
  }

  ensureOutputDir() {
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
  }

  async generateQRCode(url, filename, title) {
    try {
      // Generate QR code image
      const qrCodePath = path.join(this.outputDir, `${filename}.png`);
      await QRCode.toFile(qrCodePath, url, {
        type: 'png',
        quality: 0.92,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        },
        width: 512
      });

      // Generate terminal QR code
      console.log(chalk.cyan.bold(`\n${title}:`));
      console.log(chalk.white(url));
      QRTerminal.generate(url, { small: true });
      console.log(chalk.green(`✅ QR code saved: ${qrCodePath}`));

      return qrCodePath;
    } catch (error) {
      console.error(chalk.red(`❌ Error generating QR code for ${title}:`, error));
      return null;
    }
  }

  async generateMobileQRCodes(urls) {
    console.log(chalk.blue.bold('📱 GENERATING MOBILE QR CODES\n'));

    const qrCodes = {};

    // Generate QR codes for all URLs
    if (urls.frontend) {
      qrCodes.frontend = await this.generateQRCode(
        urls.frontend,
        'frontend-mobile',
        '🌐 FRONTEND (Website)'
      );
    }

    if (urls.backend) {
      qrCodes.backend = await this.generateQRCode(
        urls.backend,
        'backend-mobile',
        '⚙️ BACKEND (API)'
      );
    }

    if (urls.docs) {
      qrCodes.docs = await this.generateQRCode(
        urls.docs,
        'docs-mobile',
        '📚 API DOCUMENTATION'
      );
    }

    // Generate combined info QR code
    const combinedInfo = `AeroPoints Mobile Access\nWebsite: ${urls.frontend}\nAPI: ${urls.backend}\nDocs: ${urls.docs}\nDemo: demo@aeropoints.com / Demo123!`;
    qrCodes.combined = await this.generateQRCode(
      urls.frontend,
      'aeropoints-mobile-access',
      '📋 COMPLETE ACCESS INFO'
    );

    this.generateInstructions(urls);
    this.generateHTMLPage(urls, qrCodes);

    return qrCodes;
  }

  generateInstructions(urls) {
    const instructions = `
# AeroPoints Mobile Access Instructions

## 📱 Quick Mobile Access

### Method 1: QR Code Scanning
1. Open your mobile camera app
2. Point at any QR code above
3. Tap the notification to open in browser
4. Use demo account: demo@aeropoints.com / Demo123!

### Method 2: Direct URLs
- **Website**: ${urls.frontend}
- **API**: ${urls.backend}
- **Documentation**: ${urls.docs}

## 🧪 Mobile Testing Checklist

### Touch Interactions
- [ ] Tap buttons and links
- [ ] Swipe gestures work
- [ ] Pinch to zoom (if enabled)
- [ ] Long press actions
- [ ] Touch feedback is responsive

### Responsive Design
- [ ] Layout adapts to screen size
- [ ] Text is readable without zooming
- [ ] Buttons are touch-friendly (min 44px)
- [ ] Navigation is accessible
- [ ] Forms work on mobile keyboards

### Browser Compatibility
- [ ] iOS Safari
- [ ] Android Chrome
- [ ] Mobile Firefox
- [ ] Samsung Internet
- [ ] Edge Mobile

### Performance
- [ ] Fast loading times
- [ ] Smooth scrolling
- [ ] No layout shifts
- [ ] Optimized images
- [ ] Efficient animations

### Features Testing
- [ ] User registration works
- [ ] Login/logout functions
- [ ] Flight search operates correctly
- [ ] Settings page accessible
- [ ] All forms submit properly

## 🛠️ Troubleshooting

### Connection Issues
- Ensure mobile device is connected to internet
- Try refreshing the page
- Clear browser cache if needed
- Switch between WiFi and mobile data

### Display Issues
- Rotate device to test both orientations
- Try different zoom levels
- Check if JavaScript is enabled
- Ensure cookies are allowed

### Touch Issues
- Clean screen for better touch response
- Try different touch gestures
- Check if device supports required features
- Test with different finger positions

## 📊 Mobile Analytics

Monitor these metrics during testing:
- Page load times
- Touch response times
- Error rates
- User flow completion
- Device-specific issues
- Network performance

## 🔒 Security Notes

- All connections use HTTPS
- Demo account is safe for testing
- No real payment processing
- Data is not stored permanently
- Session management works on mobile

## 📞 Support

If you encounter issues:
1. Check the troubleshooting section above
2. Try a different mobile browser
3. Test on a different device
4. Check network connectivity
5. Clear browser data and retry

---
Generated: ${new Date().toISOString()}
AeroPoints Mobile Testing Suite
`;

    const instructionsPath = path.join(this.outputDir, 'mobile-instructions.md');
    fs.writeFileSync(instructionsPath, instructions);
    console.log(chalk.green(`✅ Instructions saved: ${instructionsPath}`));
  }

  generateHTMLPage(urls, qrCodes) {
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AeroPoints Mobile Access</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
            color: white;
            min-height: 100vh;
            padding: 20px;
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(20px);
            border-radius: 20px;
            padding: 30px;
            border: 1px solid rgba(255, 255, 255, 0.2);
        }
        h1 {
            text-align: center;
            margin-bottom: 30px;
            font-size: 2.5em;
            background: linear-gradient(45deg, #ffd700, #ffed4e);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }
        .qr-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        .qr-card {
            background: rgba(255, 255, 255, 0.1);
            border-radius: 15px;
            padding: 20px;
            text-align: center;
            border: 1px solid rgba(255, 255, 255, 0.2);
        }
        .qr-card h3 {
            margin-bottom: 15px;
            color: #ffd700;
        }
        .qr-card img {
            width: 150px;
            height: 150px;
            border-radius: 10px;
            background: white;
            padding: 10px;
            margin-bottom: 15px;
        }
        .url {
            word-break: break-all;
            background: rgba(0, 0, 0, 0.3);
            padding: 10px;
            border-radius: 8px;
            font-family: monospace;
            font-size: 0.9em;
        }
        .demo-info {
            background: rgba(255, 215, 0, 0.2);
            border: 2px solid #ffd700;
            border-radius: 15px;
            padding: 20px;
            margin: 20px 0;
            text-align: center;
        }
        .instructions {
            background: rgba(255, 255, 255, 0.1);
            border-radius: 15px;
            padding: 20px;
            margin-top: 20px;
        }
        .instructions h3 {
            color: #ffd700;
            margin-bottom: 10px;
        }
        .instructions ul {
            list-style-position: inside;
            line-height: 1.6;
        }
        @media (max-width: 768px) {
            .container { padding: 15px; }
            h1 { font-size: 2em; }
            .qr-grid { grid-template-columns: 1fr; }
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>📱 AeroPoints Mobile Access</h1>
        
        <div class="demo-info">
            <h3>🔐 Demo Account</h3>
            <p><strong>Email:</strong> demo@aeropoints.com</p>
            <p><strong>Password:</strong> Demo123!</p>
        </div>

        <div class="qr-grid">
            <div class="qr-card">
                <h3>🌐 Website</h3>
                <img src="frontend-mobile.png" alt="Frontend QR Code">
                <div class="url">${urls.frontend}</div>
            </div>
            
            <div class="qr-card">
                <h3>⚙️ API</h3>
                <img src="backend-mobile.png" alt="Backend QR Code">
                <div class="url">${urls.backend}</div>
            </div>
            
            <div class="qr-card">
                <h3>📚 Documentation</h3>
                <img src="docs-mobile.png" alt="Docs QR Code">
                <div class="url">${urls.docs}</div>
            </div>
        </div>

        <div class="instructions">
            <h3>📱 How to Use</h3>
            <ul>
                <li>Scan any QR code with your mobile camera</li>
                <li>Tap the notification to open in browser</li>
                <li>Use the demo account to log in</li>
                <li>Test all features on your mobile device</li>
                <li>Try both portrait and landscape modes</li>
            </ul>
        </div>

        <div class="instructions">
            <h3>🧪 Testing Checklist</h3>
            <ul>
                <li>Touch interactions and gestures</li>
                <li>Responsive design on different screen sizes</li>
                <li>Browser compatibility (Safari, Chrome, etc.)</li>
                <li>Form submissions and user flows</li>
                <li>Performance and loading times</li>
            </ul>
        </div>
    </div>
</body>
</html>
`;

    const htmlPath = path.join(this.outputDir, 'mobile-access.html');
    fs.writeFileSync(htmlPath, html);
    console.log(chalk.green(`✅ Mobile access page: ${htmlPath}`));
    console.log(chalk.blue(`🌐 Open in browser: file://${path.resolve(htmlPath)}`));
  }
}

// CLI usage
if (process.argv.length > 2) {
  const urls = {
    frontend: process.argv[2],
    backend: process.argv[3],
    docs: process.argv[4] || `${process.argv[3]}/docs`
  };

  const generator = new QRCodeGenerator();
  generator.generateMobileQRCodes(urls);
} else {
  console.log(chalk.yellow('Usage: node generate-qr.js <frontend-url> <backend-url> [docs-url]'));
  console.log(chalk.white('Example: node generate-qr.js https://app.ngrok.io https://api.ngrok.io'));
}

export default QRCodeGenerator; 