#!/usr/bin/env node

import https from 'https';
import chalk from 'chalk';

console.log(chalk.blue.bold('\n🚀 AEROPOINTS TUNNEL STATUS\n'));

const urls = [
  { name: 'Frontend', url: 'https://kind-lizards-serve.loca.lt', icon: '🌐' },
  { name: 'Backend', url: 'https://cruel-months-burn.loca.lt/health', icon: '⚙️' },
  { name: 'API Docs', url: 'https://cruel-months-burn.loca.lt/docs', icon: '📚' }
];

async function checkUrl(urlObj) {
  return new Promise((resolve) => {
    const req = https.get(urlObj.url, { timeout: 5000 }, (res) => {
      resolve({
        ...urlObj,
        status: res.statusCode === 200 ? 'online' : 'error',
        code: res.statusCode
      });
    });
    
    req.on('error', () => {
      resolve({ ...urlObj, status: 'offline', code: 0 });
    });
    
    req.on('timeout', () => {
      req.destroy();
      resolve({ ...urlObj, status: 'timeout', code: 0 });
    });
  });
}

async function checkAllUrls() {
  const results = await Promise.all(urls.map(checkUrl));
  
  results.forEach(result => {
    const statusColor = result.status === 'online' ? chalk.green : chalk.red;
    const statusText = result.status === 'online' ? '✅ ONLINE' : '❌ OFFLINE';
    
    console.log(`${result.icon} ${chalk.bold(result.name)}: ${statusColor(statusText)}`);
    console.log(`   ${chalk.gray(result.url)}`);
    console.log('');
  });
  
  console.log(chalk.yellow('🔥 NO PASSWORD REQUIRED - Direct access!'));
  console.log(chalk.blue('🔄 Run: npm run share:status to check again\n'));
}

checkAllUrls().catch(console.error); 