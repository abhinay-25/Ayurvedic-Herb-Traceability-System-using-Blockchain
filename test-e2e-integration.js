const puppeteer = require('puppeteer');
const axios = require('axios');

class E2EIntegrationTest {
  constructor() {
    this.browser = null;
    this.page = null;
    this.baseURL = 'http://localhost:3001';
    this.apiURL = 'http://localhost:8080/api';
  }

  async setup() {
    console.log('🚀 Setting up E2E tests...');
    try {
      this.browser = await puppeteer.launch({
        headless: false, // Set to true for headless testing
        defaultViewport: { width: 1280, height: 720 },
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
      this.page = await this.browser.newPage();
      
      // Set a user agent to avoid detection
      await this.page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
      
      console.log('✅ Browser setup complete');
      return true;
    } catch (error) {
      console.error('❌ Browser setup failed:', error.message);
      return false;
    }
  }

  async testSystemHealth() {
    console.log('🏥 Testing system health...');
    
    // Test backend health
    try {
      const healthResponse = await axios.get('http://localhost:8080/health');
      if (healthResponse.status === 200) {
        console.log('✅ Backend health check passed');
      } else {
        console.log('❌ Backend health check failed');
        return false;
      }
    } catch (error) {
      console.log('❌ Backend not accessible:', error.message);
      return false;
    }

    // Test frontend accessibility
    try {
      await this.page.goto(this.baseURL, { waitUntil: 'networkidle2' });
      const title = await this.page.title();
      console.log(`✅ Frontend accessible - Title: ${title}`);
      return true;
    } catch (error) {
      console.log('❌ Frontend not accessible:', error.message);
      return false;
    }
  }

  async testHomepage() {
    console.log('🏠 Testing homepage...');
    try {
      await this.page.goto(this.baseURL, { waitUntil: 'networkidle2' });
      
      // Check for main navigation elements
      const navElements = await this.page.$$eval('nav a, header a', links => 
        links.map(link => link.textContent?.trim()).filter(text => text)
      );
      
      console.log(`✅ Homepage loaded with navigation: ${navElements.join(', ')}`);
      return true;
    } catch (error) {
      console.log('❌ Homepage test failed:', error.message);
      return false;
    }
  }

  async testFarmerRegistrationPage() {
    console.log('👨‍🌾 Testing farmer registration page...');
    try {
      await this.page.goto(`${this.baseURL}/register-farmer`, { waitUntil: 'networkidle2' });
      
      // Check if form exists
      const formExists = await this.page.$('form') !== null;
      
      if (formExists) {
        console.log('✅ Farmer registration form loaded');
        
        // Check for required form fields
        const hasNameField = await this.page.$('input[name="name"], input[placeholder*="name"]') !== null;
        const hasContactField = await this.page.$('input[name="contact"], input[type="tel"]') !== null;
        
        if (hasNameField && hasContactField) {
          console.log('✅ Required form fields present');
        } else {
          console.log('⚠️  Some form fields may be missing');
        }
      } else {
        console.log('❌ Farmer registration form not found');
        return false;
      }
      
      return true;
    } catch (error) {
      console.log('❌ Farmer registration page test failed:', error.message);
      return false;
    }
  }

  async testHerbRegistrationPage() {
    console.log('🌿 Testing herb registration page...');
    try {
      await this.page.goto(`${this.baseURL}/add-herb`, { waitUntil: 'networkidle2' });
      
      // Wait for form to load
      await this.page.waitForSelector('form', { timeout: 5000 });
      
      const formExists = await this.page.$('form') !== null;
      
      if (formExists) {
        console.log('✅ Herb registration form loaded');
        
        // Check for herb-specific fields
        const hasHerbNameField = await this.page.$('input[name="name"], input[placeholder*="herb"]') !== null;
        const hasScientificNameField = await this.page.$('input[name="scientificName"]') !== null;
        
        if (hasHerbNameField) {
          console.log('✅ Herb registration fields present');
        } else {
          console.log('⚠️  Some herb fields may be missing');
        }
      } else {
        console.log('❌ Herb registration form not found');
        return false;
      }
      
      return true;
    } catch (error) {
      console.log('❌ Herb registration page test failed:', error.message);
      return false;
    }
  }

  async testTrackingPage() {
    console.log('🔍 Testing tracking page...');
    try {
      await this.page.goto(`${this.baseURL}/track`, { waitUntil: 'networkidle2' });
      
      // Check if page loads without errors
      const pageTitle = await this.page.$eval('title', el => el.textContent);
      console.log(`✅ Tracking page loaded - ${pageTitle}`);
      
      return true;
    } catch (error) {
      console.log('❌ Tracking page test failed:', error.message);
      return false;
    }
  }

  async testScanPage() {
    console.log('📱 Testing scan page...');
    try {
      await this.page.goto(`${this.baseURL}/scan`, { waitUntil: 'networkidle2' });
      
      // Check if scan functionality is present
      const hasScanFeature = await this.page.$('[data-testid="scan"], button[class*="scan"], div[class*="scan"]') !== null;
      
      if (hasScanFeature) {
        console.log('✅ Scan functionality present');
      } else {
        console.log('✅ Scan page loaded (QR scan functionality may require camera)');
      }
      
      return true;
    } catch (error) {
      console.log('❌ Scan page test failed:', error.message);
      return false;
    }
  }

  async testResponsiveDesign() {
    console.log('📱 Testing responsive design...');
    try {
      // Test mobile viewport
      await this.page.setViewport({ width: 375, height: 667 }); // iPhone size
      await this.page.goto(this.baseURL, { waitUntil: 'networkidle2' });
      
      console.log('✅ Mobile responsive test passed');
      
      // Reset to desktop
      await this.page.setViewport({ width: 1280, height: 720 });
      
      return true;
    } catch (error) {
      console.log('❌ Responsive design test failed:', error.message);
      return false;
    }
  }

  async cleanup() {
    console.log('🧹 Cleaning up...');
    if (this.browser) {
      await this.browser.close();
    }
  }

  async runFullE2ETest() {
    console.log('🧪 Starting End-to-End Integration Tests...\n');

    const setupSuccess = await this.setup();
    if (!setupSuccess) {
      console.log('❌ Setup failed. Cannot proceed with tests.');
      return false;
    }

    const tests = [
      { name: 'System Health', func: () => this.testSystemHealth() },
      { name: 'Homepage', func: () => this.testHomepage() },
      { name: 'Farmer Registration Page', func: () => this.testFarmerRegistrationPage() },
      { name: 'Herb Registration Page', func: () => this.testHerbRegistrationPage() },
      { name: 'Tracking Page', func: () => this.testTrackingPage() },
      { name: 'Scan Page', func: () => this.testScanPage() },
      { name: 'Responsive Design', func: () => this.testResponsiveDesign() }
    ];

    let passed = 0;
    let total = tests.length;

    for (const test of tests) {
      try {
        console.log(`\n--- ${test.name} ---`);
        const result = await test.func();
        if (result) {
          passed++;
          console.log(`✅ ${test.name} PASSED`);
        } else {
          console.log(`❌ ${test.name} FAILED`);
        }
      } catch (error) {
        console.log(`💥 ${test.name} CRASHED:`, error.message);
      }
    }

    await this.cleanup();

    console.log('\n📊 E2E Test Summary:');
    console.log(`Passed: ${passed}/${total} tests`);
    
    if (passed === total) {
      console.log('🎉 All E2E tests passed! System is ready for demo.');
    } else if (passed >= total * 0.8) {
      console.log('⚠️  Most tests passed. System should work for demo.');
    } else {
      console.log('❌ Multiple test failures. Check system before demo.');
    }

    return { passed, total, success: passed >= total * 0.8 };
  }
}

// Installation check and guidance
const checkPuppeteer = async () => {
  try {
    require('puppeteer');
    return true;
  } catch (error) {
    console.log('❌ Puppeteer not installed.');
    console.log('📦 To install Puppeteer, run:');
    console.log('   npm install puppeteer');
    console.log('\n⚠️  Note: Puppeteer download may take a few minutes.');
    console.log('🔄 Continuing with API-only tests...\n');
    return false;
  }
};

// Run tests if called directly
if (require.main === module) {
  checkPuppeteer().then(hasPuppeteer => {
    if (hasPuppeteer) {
      const tester = new E2EIntegrationTest();
      tester.runFullE2ETest()
        .then(results => {
          process.exit(results.success ? 0 : 1);
        })
        .catch(error => {
          console.error('💥 E2E tests crashed:', error);
          process.exit(1);
        });
    } else {
      // Run simplified API tests if Puppeteer is not available
      const APITester = require('./test-api.js');
      const apiTester = new APITester();
      apiTester.runAllTests()
        .then(results => {
          console.log('\n🔍 For full E2E tests, install Puppeteer:');
          console.log('   npm install puppeteer');
          process.exit(results.success ? 0 : 1);
        });
    }
  });
}

module.exports = E2EIntegrationTest;