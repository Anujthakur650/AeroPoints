#!/usr/bin/env node

/**
 * AeroPoints Tunnel Status Monitor
 * Real-time monitoring and status display for ngrok tunnels
 */

const fs = require('fs');
const path = require('path');
const http = require('http');
const chalk = require('chalk');

const CONFIG_FILE = path.join(__dirname, 'share-config.json');
const TUNNELS_FILE = path.join(__dirname, '.active-tunnels');
const NGROK_API = 'http://localhost:4040/api/tunnels';

class TunnelMonitor {
    constructor() {
        this.config = this.loadConfig();
        this.startTime = new Date();
        this.isRunning = false;
    }

    loadConfig() {
        try {
            return JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
        } catch (error) {
            console.error(chalk.red('❌ Could not load configuration file'));
            process.exit(1);
        }
    }

    async checkNgrokAPI() {
        return new Promise((resolve) => {
            const req = http.get(NGROK_API, (res) => {
                let data = '';
                res.on('data', chunk => data += chunk);
                res.on('end', () => {
                    try {
                        resolve(JSON.parse(data));
                    } catch (error) {
                        resolve(null);
                    }
                });
            });
            
            req.on('error', () => resolve(null));
            req.setTimeout(5000, () => {
                req.destroy();
                resolve(null);
            });
        });
    }

    async checkServerHealth(port) {
        return new Promise((resolve) => {
            const req = http.get(`http://localhost:${port}/health`, (res) => {
                resolve(res.statusCode === 200);
            });
            
            req.on('error', () => resolve(false));
            req.setTimeout(3000, () => {
                req.destroy();
                resolve(false);
            });
        });
    }

    formatUptime() {
        const uptime = Date.now() - this.startTime.getTime();
        const hours = Math.floor(uptime / (1000 * 60 * 60));
        const minutes = Math.floor((uptime % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((uptime % (1000 * 60)) / 1000);
        
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    displayHeader() {
        console.clear();
        console.log(chalk.blue.bold('━'.repeat(80)));
        console.log(chalk.blue.bold('                    🌐 AEROPOINTS TUNNEL STATUS MONITOR'));
        console.log(chalk.blue.bold('━'.repeat(80)));
        console.log(chalk.gray(`📊 Monitoring started: ${this.startTime.toLocaleString()}`));
        console.log(chalk.gray(`⏱️  Uptime: ${this.formatUptime()}`));
        console.log();
    }

    displayTunnelStatus(tunnelData) {
        console.log(chalk.cyan.bold('🚇 TUNNEL STATUS'));
        console.log(chalk.cyan('─'.repeat(40)));

        if (!tunnelData || !tunnelData.tunnels || tunnelData.tunnels.length === 0) {
            console.log(chalk.red('❌ No active tunnels found'));
            console.log(chalk.yellow('💡 Run ./share-website.sh to start tunnels'));
            return;
        }

        tunnelData.tunnels.forEach(tunnel => {
            const config = tunnel.config || {};
            const port = config.addr ? config.addr.split(':').pop() : 'unknown';
            const serviceName = port === '5174' ? 'Frontend (React)' : 
                              port === '8000' ? 'Backend (FastAPI)' : 
                              'Unknown Service';

            console.log(chalk.green(`✅ ${serviceName}`));
            console.log(chalk.white(`   📍 Local:  ${config.addr || 'unknown'}`));
            console.log(chalk.white(`   🌐 Public: ${tunnel.public_url || 'unknown'}`));
            console.log(chalk.gray(`   🔗 Protocol: ${tunnel.proto || 'unknown'}`));
            console.log();
        });
    }

    async displayServerHealth() {
        console.log(chalk.magenta.bold('🏥 SERVER HEALTH'));
        console.log(chalk.magenta('─'.repeat(40)));

        // Check frontend health
        const frontendHealthy = await this.checkServerHealth(5174);
        console.log(frontendHealthy ? 
            chalk.green('✅ Frontend (port 5174): Healthy') : 
            chalk.red('❌ Frontend (port 5174): Down')
        );

        // Check backend health
        const backendHealthy = await this.checkServerHealth(8000);
        console.log(backendHealthy ? 
            chalk.green('✅ Backend (port 8000): Healthy') : 
            chalk.red('❌ Backend (port 8000): Down')
        );

        console.log();
    }

    displayQuickAccess(tunnelData) {
        console.log(chalk.yellow.bold('🔗 QUICK ACCESS LINKS'));
        console.log(chalk.yellow('─'.repeat(40)));

        if (!tunnelData || !tunnelData.tunnels || tunnelData.tunnels.length === 0) {
            console.log(chalk.gray('No links available (tunnels not running)'));
            return;
        }

        tunnelData.tunnels.forEach(tunnel => {
            const config = tunnel.config || {};
            const port = config.addr ? config.addr.split(':').pop() : '';
            
            if (port === '5174') {
                console.log(chalk.cyan(`🎯 Website:     ${tunnel.public_url}`));
                console.log(chalk.cyan(`📱 Mobile:      ${tunnel.public_url} (scan QR below)`));
            } else if (port === '8000') {
                console.log(chalk.cyan(`⚙️  API:         ${tunnel.public_url}`));
                console.log(chalk.cyan(`📚 Docs:        ${tunnel.public_url}/docs`));
            }
        });

        console.log();
    }

    displayCommands() {
        console.log(chalk.green.bold('🎮 AVAILABLE COMMANDS'));
        console.log(chalk.green('─'.repeat(40)));
        console.log(chalk.white('📋 Copy frontend URL:  echo "[URL]" | pbcopy'));
        console.log(chalk.white('🛑 Stop sharing:       ./stop-sharing.sh'));
        console.log(chalk.white('🔄 Restart tunnels:    ./share-website.sh'));
        console.log(chalk.white('📊 ngrok dashboard:    http://localhost:4040'));
        console.log(chalk.white('❌ Exit monitor:       Ctrl+C'));
        console.log();
    }

    displayFooter() {
        console.log(chalk.gray('─'.repeat(80)));
        console.log(chalk.gray('🔄 Auto-refresh every 10 seconds | Press Ctrl+C to exit'));
        console.log(chalk.gray(`📅 Last updated: ${new Date().toLocaleTimeString()}`));
    }

    generateQRCode(url) {
        try {
            const qr = require('qrcode-terminal');
            console.log(chalk.yellow.bold('📱 QR CODE FOR MOBILE ACCESS'));
            console.log(chalk.yellow('─'.repeat(40)));
            qr.generate(url, { small: true });
            console.log();
        } catch (error) {
            console.log(chalk.gray('QR code generation not available'));
        }
    }

    async displayStatus() {
        try {
            const tunnelData = await this.checkNgrokAPI();
            
            this.displayHeader();
            this.displayTunnelStatus(tunnelData);
            await this.displayServerHealth();
            this.displayQuickAccess(tunnelData);

            // Generate QR code for frontend URL
            if (tunnelData && tunnelData.tunnels) {
                const frontendTunnel = tunnelData.tunnels.find(t => 
                    t.config && t.config.addr && t.config.addr.includes('5174')
                );
                if (frontendTunnel && frontendTunnel.public_url) {
                    this.generateQRCode(frontendTunnel.public_url);
                }
            }

            this.displayCommands();
            this.displayFooter();

        } catch (error) {
            console.error(chalk.red(`Error displaying status: ${error.message}`));
        }
    }

    async start() {
        console.log(chalk.blue('🚀 Starting AeroPoints Tunnel Monitor...'));
        
        this.isRunning = true;
        
        // Display initial status
        await this.displayStatus();

        // Set up periodic refresh
        const refreshInterval = setInterval(async () => {
            if (this.isRunning) {
                await this.displayStatus();
            } else {
                clearInterval(refreshInterval);
            }
        }, 10000);

        // Handle graceful shutdown
        process.on('SIGINT', () => {
            console.log(chalk.yellow('\n\n🛑 Stopping tunnel monitor...'));
            this.isRunning = false;
            clearInterval(refreshInterval);
            process.exit(0);
        });

        // Keep the process alive
        process.stdin.setRawMode(true);
        process.stdin.resume();
        process.stdin.on('data', (key) => {
            // Exit on Ctrl+C
            if (key.toString() === '\u0003') {
                process.emit('SIGINT');
            }
        });
    }
}

// CLI interface
if (require.main === module) {
    const monitor = new TunnelMonitor();
    
    if (process.argv.includes('--help') || process.argv.includes('-h')) {
        console.log(chalk.blue.bold('AeroPoints Tunnel Status Monitor'));
        console.log(chalk.gray('Usage: node tunnel-status.js [options]'));
        console.log(chalk.gray('Options:'));
        console.log(chalk.gray('  --help, -h    Show this help message'));
        console.log(chalk.gray('  --once        Run once and exit'));
        process.exit(0);
    }

    if (process.argv.includes('--once')) {
        monitor.displayStatus().then(() => process.exit(0));
    } else {
        monitor.start();
    }
}

module.exports = TunnelMonitor; 