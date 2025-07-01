// Mobile Debug and Diagnostic Tool for AeroPoints
// Tests API connectivity, network requests, and mobile compatibility

class MobileDiagnostics {
  constructor() {
    this.results = {
      environment: {},
      connectivity: {},
      apiTests: {},
      browserTests: {},
      networkTests: {},
      errors: []
    };
    this.frontendUrl = this.detectFrontendUrl();
    this.backendUrl = this.detectBackendUrl();
    this.isMobile = this.detectMobile();
  }

  detectFrontendUrl() {
    const hostname = window.location.hostname;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://localhost:5173';
    }
    return window.location.origin;
  }

  detectBackendUrl() {
    const hostname = window.location.hostname;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://localhost:8000';
    }
    // For tunneled environments, try to detect backend URL
    if (hostname.includes('loca.lt')) {
      return 'https://afraid-otters-start.loca.lt'; // Current backend tunnel
    }
    return `${window.location.protocol}//${hostname}:8000`;
  }

  detectMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }

  log(message, data = null) {
    const timestamp = new Date().toISOString();
    const logEntry = { timestamp, message, data };
    console.log(`[MOBILE DEBUG ${timestamp}]`, message, data || '');
    
    // Store in results
    if (!this.results.logs) this.results.logs = [];
    this.results.logs.push(logEntry);

    // Display on page for mobile debugging
    this.displayOnPage(logEntry);
  }

  displayOnPage(logEntry) {
    let debugContainer = document.getElementById('mobile-debug-container');
    if (!debugContainer) {
      debugContainer = document.createElement('div');
      debugContainer.id = 'mobile-debug-container';
      debugContainer.style.cssText = `
        position: fixed;
        top: 10px;
        right: 10px;
        width: 300px;
        max-height: 400px;
        overflow-y: auto;
        background: rgba(0,0,0,0.9);
        color: white;
        padding: 10px;
        border-radius: 5px;
        font-size: 12px;
        z-index: 10000;
        font-family: monospace;
      `;
      document.body.appendChild(debugContainer);
    }

    const logDiv = document.createElement('div');
    logDiv.style.cssText = 'border-bottom: 1px solid #444; padding: 5px 0;';
    logDiv.innerHTML = `
      <div style="color: #0ff;">${logEntry.timestamp.split('T')[1].split('.')[0]}</div>
      <div>${logEntry.message}</div>
      ${logEntry.data ? `<div style="color: #888;">${JSON.stringify(logEntry.data, null, 2)}</div>` : ''}
    `;
    debugContainer.appendChild(logDiv);
    debugContainer.scrollTop = debugContainer.scrollHeight;
  }

  async runAllTests() {
    this.log('Starting Mobile Diagnostics');
    
    await this.testEnvironment();
    await this.testConnectivity();
    await this.testAPI();
    await this.testBrowser();
    await this.testNetwork();
    
    this.generateReport();
    return this.results;
  }

  async testEnvironment() {
    this.log('Testing Environment');
    
    this.results.environment = {
      userAgent: navigator.userAgent,
      isMobile: this.isMobile,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      },
      screen: {
        width: screen.width,
        height: screen.height
      },
      urls: {
        frontend: this.frontendUrl,
        backend: this.backendUrl,
        current: window.location.href
      },
      connection: navigator.connection ? {
        effectiveType: navigator.connection.effectiveType,
        downlink: navigator.connection.downlink,
        rtt: navigator.connection.rtt
      } : 'Not available'
    };

    this.log('Environment detected', this.results.environment);
  }

  async testConnectivity() {
    this.log('Testing Connectivity');
    
    const tests = [
      { name: 'Frontend', url: this.frontendUrl },
      { name: 'Backend Health', url: `${this.backendUrl}/health` },
      { name: 'Backend Docs', url: `${this.backendUrl}/docs` }
    ];

    this.results.connectivity = {};

    for (const test of tests) {
      try {
        this.log(`Testing ${test.name}: ${test.url}`);
        const startTime = performance.now();
        const response = await fetch(test.url, {
          method: 'GET',
          mode: 'cors',
          cache: 'no-cache'
        });
        const endTime = performance.now();
        
        this.results.connectivity[test.name] = {
          success: true,
          status: response.status,
          statusText: response.statusText,
          responseTime: endTime - startTime,
          headers: Object.fromEntries(response.headers.entries())
        };
        
        this.log(`✅ ${test.name} connectivity OK (${Math.round(endTime - startTime)}ms)`);
      } catch (error) {
        this.results.connectivity[test.name] = {
          success: false,
          error: error.message,
          stack: error.stack
        };
        this.log(`❌ ${test.name} connectivity failed`, error.message);
        this.results.errors.push(`Connectivity test failed for ${test.name}: ${error.message}`);
      }
    }
  }

  async testAPI() {
    this.log('Testing API Endpoints');
    
    const apiTests = [
      {
        name: 'Airport Search',
        url: `${this.backendUrl}/api/airports/search?q=DFW&limit=5`,
        expectedFields: ['iata', 'name', 'city']
      },
      {
        name: 'Flight Search',
        url: `${this.backendUrl}/api/search-awards?origin=DFW&destination=LAX&date=2025-07-15&cabin_class=economy&passengers=1`,
        expectedFields: ['id', 'airline', 'origin', 'destination']
      },
      {
        name: 'Auth Status',
        url: `${this.backendUrl}/api/auth/google/status`,
        expectedFields: ['google_auth_configured']
      }
    ];

    this.results.apiTests = {};

    for (const test of apiTests) {
      try {
        this.log(`Testing API: ${test.name}`);
        const startTime = performance.now();
        const response = await fetch(test.url, {
          method: 'GET',
          mode: 'cors',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        });
        const endTime = performance.now();
        
        const data = await response.json();
        
        // Check if expected fields exist
        const hasExpectedFields = test.expectedFields.every(field => {
          if (Array.isArray(data)) {
            return data.length > 0 && data[0].hasOwnProperty(field);
          }
          return data.hasOwnProperty(field);
        });

        this.results.apiTests[test.name] = {
          success: response.ok,
          status: response.status,
          responseTime: endTime - startTime,
          dataReceived: !!data,
          hasExpectedFields,
          dataLength: Array.isArray(data) ? data.length : Object.keys(data).length,
          sampleData: Array.isArray(data) ? data[0] : data
        };

        if (response.ok && hasExpectedFields) {
          this.log(`✅ ${test.name} API test passed (${Math.round(endTime - startTime)}ms)`);
        } else {
          this.log(`⚠️ ${test.name} API test issues`, { status: response.status, hasExpectedFields });
        }
      } catch (error) {
        this.results.apiTests[test.name] = {
          success: false,
          error: error.message,
          stack: error.stack
        };
        this.log(`❌ ${test.name} API test failed`, error.message);
        this.results.errors.push(`API test failed for ${test.name}: ${error.message}`);
      }
    }
  }

  async testBrowser() {
    this.log('Testing Browser Compatibility');
    
    this.results.browserTests = {
      localStorage: this.testLocalStorage(),
      sessionStorage: this.testSessionStorage(),
      fetch: typeof fetch !== 'undefined',
      promises: typeof Promise !== 'undefined',
      asyncAwait: this.testAsyncAwait(),
      cors: await this.testCORS(),
      touchEvents: 'ontouchstart' in window,
      geolocation: 'geolocation' in navigator
    };

    this.log('Browser compatibility tests completed', this.results.browserTests);
  }

  testLocalStorage() {
    try {
      localStorage.setItem('test', 'test');
      localStorage.removeItem('test');
      return true;
    } catch (e) {
      return false;
    }
  }

  testSessionStorage() {
    try {
      sessionStorage.setItem('test', 'test');
      sessionStorage.removeItem('test');
      return true;
    } catch (e) {
      return false;
    }
  }

  testAsyncAwait() {
    try {
      eval('(async () => {})');
      return true;
    } catch (e) {
      return false;
    }
  }

  async testCORS() {
    try {
      const response = await fetch(`${this.backendUrl}/health`, {
        method: 'GET',
        mode: 'cors'
      });
      return response.ok;
    } catch (e) {
      return false;
    }
  }

  async testNetwork() {
    this.log('Testing Network Performance');
    
    const startTime = performance.now();
    try {
      await fetch(`${this.backendUrl}/health`);
      const endTime = performance.now();
      
      this.results.networkTests = {
        latency: endTime - startTime,
        connection: navigator.connection ? {
          effectiveType: navigator.connection.effectiveType,
          downlink: navigator.connection.downlink,
          rtt: navigator.connection.rtt
        } : 'Not available'
      };
      
      this.log('Network tests completed', this.results.networkTests);
    } catch (error) {
      this.results.networkTests = {
        error: error.message
      };
      this.log('Network test failed', error.message);
    }
  }

  generateReport() {
    this.log('Generating Diagnostic Report');
    
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        isMobile: this.isMobile,
        overallStatus: this.results.errors.length === 0 ? 'HEALTHY' : 'ISSUES_DETECTED',
        errorCount: this.results.errors.length,
        apiTestsPassed: Object.values(this.results.apiTests).filter(test => test.success).length,
        totalApiTests: Object.keys(this.results.apiTests).length
      },
      results: this.results
    };

    // Store report in localStorage for later retrieval
    try {
      localStorage.setItem('mobile-debug-report', JSON.stringify(report));
      this.log('Report saved to localStorage');
    } catch (e) {
      this.log('Failed to save report to localStorage', e.message);
    }

    // Display summary
    this.displaySummary(report);
    
    return report;
  }

  displaySummary(report) {
    const summary = `
=== MOBILE DIAGNOSTIC SUMMARY ===
Status: ${report.summary.overallStatus}
Mobile Device: ${report.summary.isMobile ? 'YES' : 'NO'}
API Tests: ${report.summary.apiTestsPassed}/${report.summary.totalApiTests} passed
Errors: ${report.summary.errorCount}

Frontend URL: ${this.frontendUrl}
Backend URL: ${this.backendUrl}

${report.summary.errorCount > 0 ? 'ERRORS:\n' + this.results.errors.join('\n') : 'All tests passed!'}
`;

    console.log(summary);
    this.log('Diagnostic Summary', summary);
  }
}

// Auto-run diagnostics when script loads
if (typeof window !== 'undefined') {
  window.MobileDiagnostics = MobileDiagnostics;
  
  // Create global function to run diagnostics
  window.runMobileDiagnostics = async () => {
    const diagnostics = new MobileDiagnostics();
    return await diagnostics.runAllTests();
  };
  
  // Auto-run on mobile devices
  if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
    console.log('Mobile device detected - running automatic diagnostics');
    setTimeout(() => {
      window.runMobileDiagnostics();
    }, 2000);
  }
}

export default MobileDiagnostics; 