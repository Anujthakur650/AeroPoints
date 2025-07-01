#!/usr/bin/env node

import { spawn, exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import QRCode from 'qrcode-terminal';
import chalk from 'chalk';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Mobile-optimized configuration
const MOBILE_CONFIG = {
  frontend: {
    port: 5173,
    host: '0.0.0.0',
    subdomain: 'aeropoints-mobile',
    cors: true,
    headers: {
      'X-Frame-Options': 'SAMEORIGIN',
      'X-Content-Type-Options': 'nosniff',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type,Authorization'
    }
  },
  backend: {
    port: 8000,
    host: '0.0.0.0',
    subdomain: 'aeropoints-api-mobile',
    cors: true
  },
  ngrok: {
    region: 'us',
    authtoken: process.env.NGROK_AUTH_TOKEN || null,
    config: {
      version: '2',
      tunnels: {
        frontend: {
          proto: 'http',
          addr: '5173',
          subdomain: 'aeropoints-mobile',
          host_header: 'rewrite',
          inspect: false,
          bind_tls: true
        },
        backend: {
          proto: 'http', 
          addr: '8000',
          subdomain: 'aeropoints-api-mobile',
          host_header: 'rewrite',
          inspect: false,
          bind_tls: true
        }
      }
    }
  }
};

class MobileShareManager {
  constructor() {
    this.processes = [];
    this.tunnels = {};
    this.isShutdown = false;
    this.setupSignalHandlers();
  }

  setupSignalHandlers() {
    process.on('SIGINT', () => this.cleanup());
    process.on('SIGTERM', () => this.cleanup());
    process.on('exit', () => this.cleanup());
  }

  async cleanup() {
    if (this.isShutdown) return;
    this.isShutdown = true;
    
    console.log(chalk.yellow('\n🛑 Shutting down mobile sharing...'));
    
    // Kill all spawned processes
    this.processes.forEach(proc => {
      try {
        proc.kill('SIGTERM');
      } catch (err) {
        // Process may already be dead
      }
    });
    
    // Kill ngrok processes
    exec('pkill -f ngrok', () => {});
    
    console.log(chalk.green('✅ Mobile sharing stopped'));
    process.exit(0);
  }

  async checkDependencies() {
    console.log(chalk.blue('🔍 Checking dependencies...'));
    
    const deps = ['node', 'npm', 'ngrok'];
    for (const dep of deps) {
      try {
        await this.execPromise(`which ${dep}`);
        console.log(chalk.green(`✅ ${dep} found`));
      } catch {
        console.log(chalk.red(`❌ ${dep} not found`));
        if (dep === 'ngrok') {
          console.log(chalk.yellow('Installing ngrok...'));
          await this.execPromise('npm install -g ngrok');
        }
      }
    }
  }

  async checkPorts() {
    console.log(chalk.blue('🔍 Checking ports...'));
    
    const ports = [5173, 8000];
    const busyPorts = [];
    
    for (const port of ports) {
      try {
        await this.execPromise(`lsof -ti:${port}`);
        busyPorts.push(port);
      } catch {
        // Port is free
      }
    }
    
    if (busyPorts.length > 0) {
      console.log(chalk.yellow(`Ports ${busyPorts.join(', ')} are in use. Stopping existing processes...`));
      for (const port of busyPorts) {
        try {
          await this.execPromise(`lsof -ti:${port} | xargs kill -9`);
        } catch {
          // Process may not exist
        }
      }
      await this.sleep(2000);
    }
  }

  async startFrontend() {
    console.log(chalk.blue('🚀 Starting mobile-optimized frontend...'));
    
    // Create mobile-optimized vite config
    const viteConfig = `
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    cors: true,
    headers: {
      'X-Frame-Options': 'SAMEORIGIN',
      'X-Content-Type-Options': 'nosniff',
      'Access-Control-Allow-Origin': '*'
    }
  },
  preview: {
    host: '0.0.0.0',
    port: 5173
  }
})
`;
    
    fs.writeFileSync('vite.config.mobile.js', viteConfig);
    
    const frontend = spawn('npm', ['run', 'dev', '--', '--config', 'vite.config.mobile.js'], {
      stdio: ['pipe', 'pipe', 'pipe'],
      env: { ...process.env, HOST: '0.0.0.0' }
    });
    
    this.processes.push(frontend);
    
    frontend.stdout.on('data', (data) => {
      const output = data.toString();
      if (output.includes('Local:')) {
        console.log(chalk.green('✅ Frontend server started on 0.0.0.0:5173'));
      }
    });
    
    frontend.stderr.on('data', (data) => {
      console.log(chalk.yellow('Frontend:', data.toString()));
    });
    
    await this.sleep(3000);
  }

  async startBackend() {
    console.log(chalk.blue('🚀 Starting mobile-optimized backend...'));
    
    const backend = spawn('uvicorn', [
      'api_server:app',
      '--host', '0.0.0.0',
      '--port', '8000',
      '--reload'
    ], {
      cwd: 'backend',
      stdio: ['pipe', 'pipe', 'pipe'],
      env: { 
        ...process.env,
        CORS_ORIGINS: '*',
        MOBILE_OPTIMIZED: 'true'
      }
    });
    
    this.processes.push(backend);
    
    backend.stdout.on('data', (data) => {
      const output = data.toString();
      if (output.includes('Uvicorn running')) {
        console.log(chalk.green('✅ Backend server started on 0.0.0.0:8000'));
      }
    });
    
    backend.stderr.on('data', (data) => {
      console.log(chalk.yellow('Backend:', data.toString()));
    });
    
    await this.sleep(3000);
  }

  async startNgrokTunnels() {
    console.log(chalk.blue('🌐 Starting ngrok tunnels...'));
    
    // Start frontend tunnel
    const frontendTunnel = spawn('ngrok', [
      'http', 
      '5173',
      '--subdomain', MOBILE_CONFIG.frontend.subdomain,
      '--host-header', 'rewrite',
      '--region', 'us'
    ], {
      stdio: ['pipe', 'pipe', 'pipe']
    });
    
    this.processes.push(frontendTunnel);
    
    // Start backend tunnel  
    const backendTunnel = spawn('ngrok', [
      'http',
      '8000', 
      '--subdomain', MOBILE_CONFIG.backend.subdomain,
      '--host-header', 'rewrite',
      '--region', 'us'
    ], {
      stdio: ['pipe', 'pipe', 'pipe']
    });
    
    this.processes.push(backendTunnel);
    
    await this.sleep(5000);
    
    // Get tunnel URLs
    try {
      const tunnelInfo = await this.execPromise('curl -s http://localhost:4040/api/tunnels');
      const tunnels = JSON.parse(tunnelInfo);
      
      tunnels.tunnels.forEach(tunnel => {
        if (tunnel.config.addr.includes('5173')) {
          this.tunnels.frontend = tunnel.public_url;
        } else if (tunnel.config.addr.includes('8000')) {
          this.tunnels.backend = tunnel.public_url;
        }
      });
      
      console.log(chalk.green('✅ Ngrok tunnels established'));
    } catch (error) {
      console.log(chalk.yellow('⚠️ Using fallback tunnel detection'));
      this.tunnels.frontend = `https://${MOBILE_CONFIG.frontend.subdomain}.ngrok.io`;
      this.tunnels.backend = `https://${MOBILE_CONFIG.backend.subdomain}.ngrok.io`;
    }
  }

  generateQRCodes() {
    console.log(chalk.blue.bold('\n📱 MOBILE ACCESS QR CODES\n'));
    
    console.log(chalk.cyan.bold('🌐 FRONTEND (Website):'));
    QRCode.generate(this.tunnels.frontend, { small: true });
    
    console.log(chalk.cyan.bold('\n⚙️ BACKEND (API):'));
    QRCode.generate(this.tunnels.backend, { small: true });
    
    console.log(chalk.cyan.bold('\n📚 API DOCUMENTATION:'));
    QRCode.generate(`${this.tunnels.backend}/docs`, { small: true });
  }

  displayMobileInfo() {
    console.log(chalk.green.bold('\n🎉 MOBILE SHARING ACTIVE!\n'));
    
    console.log(chalk.blue.bold('📱 MOBILE ACCESS URLS:'));
    console.log(chalk.white(`Frontend: ${this.tunnels.frontend}`));
    console.log(chalk.white(`Backend:  ${this.tunnels.backend}`));
    console.log(chalk.white(`API Docs: ${this.tunnels.backend}/docs`));
    
    console.log(chalk.blue.bold('\n🔐 DEMO ACCOUNT:'));
    console.log(chalk.white('Email:    demo@aeropoints.com'));
    console.log(chalk.white('Password: Demo123!'));
    
    console.log(chalk.blue.bold('\n📱 MOBILE TESTING TIPS:'));
    console.log(chalk.white('• Scan QR codes above for instant access'));
    console.log(chalk.white('• Test touch interactions and gestures'));
    console.log(chalk.white('• Verify responsive design on different screen sizes'));
    console.log(chalk.white('• Test both portrait and landscape orientations'));
    console.log(chalk.white('• Check mobile browser compatibility (iOS Safari, Android Chrome)'));
    
    console.log(chalk.blue.bold('\n🛠️ MOBILE FEATURES:'));
    console.log(chalk.white('• Touch-optimized interface'));
    console.log(chalk.white('• Mobile-responsive design'));
    console.log(chalk.white('• Optimized for mobile browsers'));
    console.log(chalk.white('• CORS enabled for mobile access'));
    console.log(chalk.white('• Mobile viewport configuration'));
    
    console.log(chalk.yellow.bold('\n⌨️ CONTROLS:'));
    console.log(chalk.white('• Press Ctrl+C to stop sharing'));
    console.log(chalk.white('• Visit http://localhost:4040 for ngrok dashboard'));
  }

  async copyToClipboard() {
    const urls = `Frontend: ${this.tunnels.frontend}\nBackend: ${this.tunnels.backend}\nAPI Docs: ${this.tunnels.backend}/docs\nDemo: demo@aeropoints.com / Demo123!`;
    
    try {
      await this.execPromise(`echo "${urls}" | pbcopy`);
      console.log(chalk.green('\n✅ URLs copied to clipboard!'));
    } catch {
      console.log(chalk.yellow('\n⚠️ Could not copy to clipboard'));
    }
  }

  async monitorHealth() {
    console.log(chalk.blue('\n🔍 Starting health monitoring...'));
    
    setInterval(async () => {
      try {
        await this.execPromise(`curl -s ${this.tunnels.frontend} > /dev/null`);
        await this.execPromise(`curl -s ${this.tunnels.backend}/health > /dev/null`);
      } catch {
        console.log(chalk.red('⚠️ Health check failed - tunnels may be down'));
      }
    }, 30000);
  }

  async execPromise(command) {
    return new Promise((resolve, reject) => {
      exec(command, (error, stdout, stderr) => {
        if (error) reject(error);
        else resolve(stdout.trim());
      });
    });
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async start() {
    try {
      console.log(chalk.blue.bold('🚀 STARTING MOBILE-OPTIMIZED AEROPOINTS SHARING\n'));
      
      await this.checkDependencies();
      await this.checkPorts();
      await this.startFrontend();
      await this.startBackend();
      await this.startNgrokTunnels();
      
      this.generateQRCodes();
      this.displayMobileInfo();
      await this.copyToClipboard();
      await this.monitorHealth();
      
      // Keep process alive
      process.stdin.resume();
      
    } catch (error) {
      console.error(chalk.red('❌ Error starting mobile sharing:'), error);
      this.cleanup();
    }
  }
}

// Start mobile sharing
const manager = new MobileShareManager();
manager.start(); 