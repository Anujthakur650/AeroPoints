#!/usr/bin/env node

/**
 * AeroPoints Demo Account Setup
 * Creates demo accounts for sharing and testing purposes
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

class DemoAccountSetup {
    constructor() {
        this.backendUrl = 'http://localhost:8000';
        this.config = this.loadConfig();
    }

    loadConfig() {
        try {
            const configFile = path.join(__dirname, 'share-config.json');
            return JSON.parse(fs.readFileSync(configFile, 'utf8'));
        } catch (error) {
            console.error('❌ Could not load share-config.json');
            process.exit(1);
        }
    }

    async makeRequest(url, method, data = null) {
        return new Promise((resolve, reject) => {
            const urlObj = new URL(url);
            const options = {
                hostname: urlObj.hostname,
                port: urlObj.port,
                path: urlObj.pathname + urlObj.search,
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            };

            if (data) {
                const postData = JSON.stringify(data);
                options.headers['Content-Length'] = Buffer.byteLength(postData);
            }

            const req = (urlObj.protocol === 'https:' ? https : http).request(options, (res) => {
                let responseData = '';
                res.on('data', chunk => responseData += chunk);
                res.on('end', () => {
                    try {
                        const parsed = JSON.parse(responseData);
                        resolve({ status: res.statusCode, data: parsed });
                    } catch (error) {
                        resolve({ status: res.statusCode, data: responseData });
                    }
                });
            });

            req.on('error', reject);

            if (data) {
                req.write(JSON.stringify(data));
            }

            req.end();
        });
    }

    async checkBackendHealth() {
        try {
            const response = await this.makeRequest(`${this.backendUrl}/health`, 'GET');
            return response.status === 200;
        } catch (error) {
            return false;
        }
    }

    async createDemoAccount(accountData) {
        try {
            console.log(`📝 Creating demo account: ${accountData.email}`);
            
            const response = await this.makeRequest(
                `${this.backendUrl}/api/auth/register`,
                'POST',
                {
                    email: accountData.email,
                    password: accountData.password,
                    name: accountData.name || 'Demo User'
                }
            );

            if (response.status === 200 || response.status === 201) {
                console.log(`✅ Demo account created: ${accountData.email}`);
                return true;
            } else if (response.status === 400 && response.data.detail?.includes('already registered')) {
                console.log(`ℹ️  Demo account already exists: ${accountData.email}`);
                return true;
            } else {
                console.log(`❌ Failed to create demo account: ${accountData.email}`);
                console.log(`   Response: ${JSON.stringify(response.data)}`);
                return false;
            }
        } catch (error) {
            console.log(`❌ Error creating demo account: ${accountData.email}`);
            console.log(`   Error: ${error.message}`);
            return false;
        }
    }

    async verifyDemoAccount(accountData) {
        try {
            console.log(`🔍 Verifying demo account: ${accountData.email}`);
            
            const response = await this.makeRequest(
                `${this.backendUrl}/api/auth/token`,
                'POST',
                {
                    username: accountData.email,
                    password: accountData.password
                }
            );

            if (response.status === 200 && response.data.access_token) {
                console.log(`✅ Demo account verified: ${accountData.email}`);
                return true;
            } else {
                console.log(`❌ Demo account verification failed: ${accountData.email}`);
                return false;
            }
        } catch (error) {
            console.log(`❌ Error verifying demo account: ${accountData.email}`);
            return false;
        }
    }

    displayDemoAccounts() {
        console.log('\n🎮 DEMO ACCOUNTS READY FOR SHARING');
        console.log('─'.repeat(50));
        
        this.config.sharing.demo_accounts.forEach((account, index) => {
            console.log(`\n${index + 1}. ${account.email}`);
            console.log(`   Password: ${account.password}`);
            console.log(`   Note: ${account.note}`);
        });

        console.log('\n📋 USAGE INSTRUCTIONS:');
        console.log('• Share these credentials with external testers');
        console.log('• Use for AI model testing and automation');
        console.log('• Perfect for stakeholder demos');
        console.log('• Accounts are pre-configured and ready to use');
    }

    async setup() {
        console.log('🚀 Setting up AeroPoints demo accounts...\n');

        // Check backend health
        console.log('🏥 Checking backend server...');
        const isHealthy = await this.checkBackendHealth();
        
        if (!isHealthy) {
            console.log('❌ Backend server is not running on port 8000');
            console.log('💡 Please start the backend server first:');
            console.log('   cd backend && uvicorn api_server:app --port 8000');
            process.exit(1);
        }
        
        console.log('✅ Backend server is healthy\n');

        // Create demo accounts
        console.log('👥 Creating demo accounts...');
        const results = [];
        
        for (const account of this.config.sharing.demo_accounts) {
            const created = await this.createDemoAccount(account);
            if (created) {
                const verified = await this.verifyDemoAccount(account);
                results.push({ ...account, created, verified });
            } else {
                results.push({ ...account, created: false, verified: false });
            }
        }

        // Additional useful demo accounts
        const additionalAccounts = [
            {
                email: 'tester@aeropoints.com',
                password: 'Test123!',
                name: 'Test User',
                note: 'General testing account'
            },
            {
                email: 'stakeholder@aeropoints.com',
                password: 'Stake123!',
                name: 'Stakeholder Demo',
                note: 'For stakeholder presentations'
            },
            {
                email: 'ai@aeropoints.com',
                password: 'AI123!',
                name: 'AI Testing',
                note: 'For AI model interactions'
            }
        ];

        console.log('\n🤖 Creating additional demo accounts...');
        for (const account of additionalAccounts) {
            const created = await this.createDemoAccount(account);
            if (created) {
                const verified = await this.verifyDemoAccount(account);
                results.push({ ...account, created, verified });
            }
        }

        // Display results
        console.log('\n📊 SETUP RESULTS:');
        console.log('─'.repeat(50));
        
        const successful = results.filter(r => r.created && r.verified);
        const failed = results.filter(r => !r.created || !r.verified);

        console.log(`✅ Successfully set up: ${successful.length} accounts`);
        console.log(`❌ Failed: ${failed.length} accounts`);

        if (failed.length > 0) {
            console.log('\n❌ Failed accounts:');
            failed.forEach(account => {
                console.log(`   - ${account.email}: ${!account.created ? 'creation failed' : 'verification failed'}`);
            });
        }

        // Save updated demo accounts to config
        const updatedConfig = { ...this.config };
        updatedConfig.sharing.demo_accounts = results.filter(r => r.created && r.verified);
        
        try {
            fs.writeFileSync(
                path.join(__dirname, 'share-config.json'),
                JSON.stringify(updatedConfig, null, 2)
            );
            console.log('\n💾 Updated share-config.json with working demo accounts');
        } catch (error) {
            console.log('\n⚠️  Could not update share-config.json');
        }

        // Display final demo accounts
        if (successful.length > 0) {
            this.displayDemoAccounts();
        }

        console.log('\n🎉 Demo account setup complete!');
        console.log('💡 These accounts are now ready for sharing and testing');
    }
}

// CLI interface
if (require.main === module) {
    const setup = new DemoAccountSetup();
    
    if (process.argv.includes('--help') || process.argv.includes('-h')) {
        console.log('AeroPoints Demo Account Setup');
        console.log('Usage: node setup-demo-account.js');
        console.log('');
        console.log('This script creates demo accounts for testing and sharing.');
        console.log('Make sure the backend server is running on port 8000 first.');
        process.exit(0);
    }

    setup.setup().catch(error => {
        console.error('❌ Setup failed:', error.message);
        process.exit(1);
    });
}

module.exports = DemoAccountSetup; 