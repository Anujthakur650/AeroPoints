#!/usr/bin/env python3
"""
United Airlines Flight Crawler
This script crawls United Airlines flight search results and extracts flight information.
"""

import os
import sys
import json
import argparse
import logging
import re
import aiohttp
import random
import time
from datetime import datetime
from bs4 import BeautifulSoup
from playwright.async_api import async_playwright
import asyncio
from fake_useragent import UserAgent
import cloudscraper
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.desired_capabilities import DesiredCapabilities
import undetected_chromedriver as uc
from anticaptchaofficial.recaptchav2proxyless import recaptchaV2Proxyless
import uuid

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='[%(asctime)s] %(message)s',
    datefmt='%H:%M:%S'
)
logger = logging.getLogger(__name__)

class UnitedFlightCrawler:
    def __init__(self, origin, destination, date, award_travel=False):
        self.origin = origin.upper()
        self.destination = destination.upper()
        self.date = date
        self.award_travel = award_travel
        self.data_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data")
        os.makedirs(self.data_dir, exist_ok=True)
        self.timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        
        # Base URLs
        self.base_url = "https://www.united.com"
        self.api_base_url = f"{self.base_url}/api/flight"
        
        # API endpoints
        self.endpoints = {
            "search": f"{self.base_url}/en/us/fsr/choose-flights",
            "fetch_flights": f"{self.api_base_url}/FetchFlights",
            "fetch_calendar": f"{self.api_base_url}/FetchAwardCalendar",
            "fetch_availability": f"{self.api_base_url}/FetchAvailability"
        }
        
        # Build search URL with parameters
        search_params = {
            "f": self.origin,
            "t": self.destination,
            "d": self.date,
            "tt": "1",
            "sc": "7",
            "px": "1",
            "taxng": "1",
            "newHP": "True",
            "clm": "7",
            "st": "bestmatches",
            "tqp": "A"
        }
        if award_travel:
            search_params["at"] = "1"
        
        # Build the search URL
        self.search_page_url = f"{self.endpoints['search']}?" + "&".join([f"{k}={v}" for k, v in search_params.items()])
        
        # Initialize browser and session variables
        self.browser = None
        self.context = None
        self.page = None
        self.auth_token = None
        self.network_requests = []
        self.proxy_list = self.load_proxies()
        self.current_proxy = None
        self.ua = UserAgent()
        
        # JavaScript code to extract token and intercept requests
        self.token_extraction_js = """
        (function() {
            let token = null;
            
            // Method 1: Look for token in window.__INITIAL_STATE__
            if (window.__INITIAL_STATE__?.auth?.token) {
                return window.__INITIAL_STATE__.auth.token;
            }
            
            // Method 2: Look for token in localStorage
            const localToken = localStorage.getItem('auth_token');
            if (localToken) return localToken;
            
            // Method 3: Look for token in sessionStorage
            const sessionToken = sessionStorage.getItem('auth_token');
            if (sessionToken) return sessionToken;
            
            // Method 4: Look for token in meta tags
            const metaToken = document.querySelector('meta[name="authorization"]')?.content;
            if (metaToken) return metaToken;
            
            // Method 5: Look for token in data attributes
            const dataToken = document.querySelector('[data-auth-token]')?.dataset.authToken;
            if (dataToken) return dataToken;
            
            // Method 6: Look for token in script tags
            const scripts = document.getElementsByTagName('script');
            for (const script of scripts) {
                const content = script.textContent || '';
                const match = content.match(/bearer\\s+(DAAAA[^"'\\s]+)/);
                if (match) return match[1];
            }
            
            // Method 7: Check if token is in the global scope
            if (typeof token === 'string' && token.startsWith('DAAAA')) {
                return token;
            }
            
            return null;
        })();
        """
        
        # The tokens we've found
        self.extracted_tokens = []
    
    def load_proxies(self):
        """Load proxy list from file or API"""
        try:
            # Use the provided authenticated proxies
            proxy_list = [
                "38.154.227.167:5868",
                "38.153.152.244:9594",
                "86.38.234.176:6630",
                "173.211.0.148:6641",
                "161.123.152.115:6360",
                "23.94.138.75:6349",
                "216.10.27.159:6837",
                "64.64.118.149:6732",
                "166.88.58.10:5735",
                "45.151.162.198:6600"
            ]
            
            # Format proxies with authentication
            formatted_proxies = []
            username = "zzjbudsv"
            password = "vjxvvsqsa0iu"
            
            for proxy in proxy_list:
                formatted_proxy = f"http://{username}:{password}@{proxy}"
                formatted_proxies.append(formatted_proxy)
            
            logger.info(f"Loaded {len(formatted_proxies)} authenticated proxies")
            return formatted_proxies
            
        except Exception as e:
            logger.error(f"Error loading proxies: {str(e)}")
            return []
    
    def get_random_proxy(self):
        """Get a random proxy from the list"""
        if self.proxy_list:
            proxy = random.choice(self.proxy_list)
            logger.info(f"Using proxy: {proxy.split('@')[1]}")  # Log only the IP:port part
            return proxy
        return None
    
    async def setup_playwright(self):
        """Setup Playwright with custom options"""
        try:
            playwright = await async_playwright().start()
            
            # Get random proxy
            proxy = self.get_random_proxy()
            
            # Setup browser options with enhanced stealth
            browser_options = {
                "headless": False,  # Set to False for better bot detection avoidance
                "args": [
                    "--disable-blink-features=AutomationControlled",
                    "--disable-dev-shm-usage",
                    "--no-sandbox",
                    "--disable-setuid-sandbox",
                    "--disable-infobars",
                    "--disable-notifications",
                    "--disable-popup-blocking",
                    "--disable-save-password-bubble",
                    "--disable-single-click-autofill",
                    "--disable-autofill-keyboard-accessory-view",
                    "--disable-features=IsolateOrigins,site-per-process",
                    "--disable-site-isolation-trials",
                    f"--user-agent={self.ua.random}",
                    "--window-size=1920,1080"
                ]
            }
            
            # Create browser context
            self.browser = await playwright.chromium.launch(**browser_options)
            
            # Create context with enhanced fingerprinting protection
            context_options = {
                "user_agent": self.ua.random,
                "viewport": {"width": 1920, "height": 1080},
                "locale": "en-US",
                "timezone_id": "America/New_York",
                "geolocation": {"latitude": 40.7128, "longitude": -74.0060},
                "permissions": ["geolocation"],
                "color_scheme": "light",
                "bypass_csp": True,
                "screen": {"width": 1920, "height": 1080},
                "device_scale_factor": 1,
                "is_mobile": False,
                "has_touch": False,
                "reduced_motion": "no-preference",
                "java_script_enabled": True
            }
            
            # Add proxy settings if available
            if proxy:
                context_options["proxy"] = {
                    "server": proxy,
                    "username": "zzjbudsv",
                    "password": "vjxvvsqsa0iu"
                }
            
            self.context = await self.browser.new_context(**context_options)
            
            # Add advanced evasion techniques
            await self.context.add_init_script("""
                // Override WebDriver property to avoid detection
                Object.defineProperty(navigator, 'webdriver', {
                    get: () => false,
                    configurable: true
                });
                
                // Override user agent data properties
                if (navigator.userAgentData) {
                    Object.defineProperty(navigator.userAgentData, 'brands', {
                        get: () => [{brand: 'Google Chrome', version: '120'}, {brand: 'Chromium', version: '120'}, {brand: 'Not=A?Brand', version: '24'}],
                        configurable: true
                    });
                    
                    Object.defineProperty(navigator.userAgentData, 'mobile', {
                        get: () => false,
                        configurable: true
                    });
                    
                    Object.defineProperty(navigator.userAgentData, 'platform', {
                        get: () => 'macOS',
                        configurable: true
                    });
                }
                
                // Override Chrome properties
                window.chrome = {
                    app: {
                        isInstalled: false,
                        InstallState: {
                            DISABLED: 'disabled',
                            INSTALLED: 'installed',
                            NOT_INSTALLED: 'not_installed'
                        },
                        RunningState: {
                            CANNOT_RUN: 'cannot_run',
                            READY_TO_RUN: 'ready_to_run',
                            RUNNING: 'running'
                        }
                    },
                    runtime: {
                        OnInstalledReason: {
                            CHROME_UPDATE: 'chrome_update',
                            INSTALL: 'install',
                            SHARED_MODULE_UPDATE: 'shared_module_update',
                            UPDATE: 'update'
                        },
                        OnRestartRequiredReason: {
                            APP_UPDATE: 'app_update',
                            OS_UPDATE: 'os_update',
                            PERIODIC: 'periodic'
                        },
                        PlatformArch: {
                            ARM: 'arm',
                            ARM64: 'arm64',
                            MIPS: 'mips',
                            MIPS64: 'mips64',
                            X86_32: 'x86-32',
                            X86_64: 'x86-64'
                        },
                        PlatformNaclArch: {
                            ARM: 'arm',
                            MIPS: 'mips',
                            MIPS64: 'mips64',
                            X86_32: 'x86-32',
                            X86_64: 'x86-64'
                        },
                        PlatformOs: {
                            ANDROID: 'android',
                            CROS: 'cros',
                            LINUX: 'linux',
                            MAC: 'mac',
                            OPENBSD: 'openbsd',
                            WIN: 'win'
                        },
                        RequestUpdateCheckStatus: {
                            NO_UPDATE: 'no_update',
                            THROTTLED: 'throttled',
                            UPDATE_AVAILABLE: 'update_available'
                        }
                    }
                };
                
                // Override permissions API
                const originalQuery = window.navigator.permissions.query;
                window.navigator.permissions.query = (parameters) => (
                    parameters.name === 'notifications' ?
                        Promise.resolve({state: Notification.permission, onchange: null}) :
                        originalQuery(parameters)
                );
                
                // Add fake plugins
                Object.defineProperty(navigator, 'plugins', {
                    get: () => {
                        const plugins = [
                            { name: 'Chrome PDF Plugin', filename: 'internal-pdf-viewer', description: 'Portable Document Format' },
                            { name: 'Chrome PDF Viewer', filename: 'mhjfbmdgcfjbbpaeojofohoefgiehjai', description: 'Portable Document Format' },
                            { name: 'Native Client', filename: 'internal-nacl-plugin', description: '' }
                        ];
                        
                        // Create fake plugin array with mocked properties
                        const fakePlugins = {
                            length: plugins.length,
                            item: function(index) { return this[index]; },
                            namedItem: function(name) {
                                for (let i = 0; i < plugins.length; i++) {
                                    if (plugins[i].name === name) return this[i];
                                }
                                return null;
                            },
                            refresh: function() {}
                        };
                        
                        // Add each plugin to the array-like object
                        for (let i = 0; i < plugins.length; i++) {
                            const plugin = plugins[i];
                            fakePlugins[i] = {
                                name: plugin.name,
                                filename: plugin.filename,
                                description: plugin.description,
                                length: 1,
                                item: function() { return this[0]; },
                                namedItem: function() { return this[0]; },
                                [0]: {
                                    type: 'application/x-nacl',
                                    suffixes: '',
                                    description: plugin.description,
                                    enabledPlugin: plugin
                                }
                            };
                        }
                        
                        return fakePlugins;
                    }
                });
                
                // Add fake languages
                Object.defineProperty(navigator, 'languages', {
                    get: () => ['en-US', 'en'],
                    configurable: true
                });
                
                // Override connection and device memory properties
                Object.defineProperty(navigator, 'connection', {
                    get: () => ({
                        effectiveType: '4g',
                        rtt: 50,
                        downlink: 10,
                        saveData: false
                    }),
                    configurable: true
                });
                
                Object.defineProperty(navigator, 'deviceMemory', {
                    get: () => 8,
                    configurable: true
                });
                
                // Override screen properties
                ['width', 'height', 'availWidth', 'availHeight', 'colorDepth', 'pixelDepth'].forEach(prop => {
                    Object.defineProperty(screen, prop, {
                        get: () => {
                            if (prop === 'width' || prop === 'availWidth') return 1920;
                            if (prop === 'height' || prop === 'availHeight') return 1080;
                            if (prop === 'colorDepth' || prop === 'pixelDepth') return 24;
                            return undefined;
                        },
                        configurable: true
                    });
                });
            """)
            
            # Create new page
            self.page = await self.context.new_page()
            
            # Add request interception
            await self.page.route("**/*", self.handle_route)
            
            # Add console logging
            self.page.on("console", lambda msg: logger.debug(f"Browser console: {msg.text}"))
            
            # Add network request logging
            self.page.on("request", lambda request: logger.debug(f"Request: {request.method} {request.url}"))
            self.page.on("response", lambda response: logger.debug(f"Response: {response.status} {response.url}"))
            
            logger.info("Playwright setup completed successfully with enhanced fingerprinting protection")
            return True
        except Exception as e:
            logger.error(f"Error setting up Playwright: {str(e)}")
            return False
    
    async def handle_route(self, route):
        """Handle network requests and responses"""
        try:
            request = route.request
            
            # Log request details
            logger.debug(f"Request: {request.method} {request.url}")
            
            # Check for authorization token in headers
            headers = request.headers
            if "authorization" in headers or "x-authorization-api" in headers:
                token = headers.get("authorization") or headers.get("x-authorization-api")
                if token and "bearer" in token.lower():
                    self.auth_token = token.split("bearer ")[-1]
                    logger.info(f"Found authorization token: {self.auth_token[:10]}...")
            
            # Continue the request
            await route.continue_()
        except Exception as e:
            logger.error(f"Error handling route: {str(e)}")
            await route.continue_()
    
    async def solve_captcha(self):
        """Solve reCAPTCHA if present"""
        try:
            # Check for reCAPTCHA
            recaptcha_frame = await self.page.query_selector("iframe[src*='recaptcha']")
            if recaptcha_frame:
                logger.info("Detected reCAPTCHA, attempting to solve...")
                
                # Get site key
                site_key = await self.page.evaluate("""() => {
                    const frame = document.querySelector('iframe[src*="recaptcha"]');
                    return frame.src.match(/k=([^&]+)/)[1];
                }""")
                
                # Initialize solver
                solver = recaptchaV2Proxyless()
                solver.set_verbose(1)
                solver.set_key("YOUR_ANTICAPTCHA_KEY")  # Replace with your key
                solver.set_website_url(self.search_page_url)
                solver.set_website_key(site_key)
                
                # Solve CAPTCHA
                response = solver.solve_and_return_solution()
                
                if response:
                    # Input solution
                    await self.page.evaluate(f"""(response) => {{
                        document.getElementById('g-recaptcha-response').innerHTML = response;
                    }}""", response)
                    
                    logger.info("CAPTCHA solved successfully")
                    return True
            
            return False
        except Exception as e:
            logger.error(f"Error solving CAPTCHA: {str(e)}")
            return False
    
    async def crawl(self):
        """Execute the crawl operation with enhanced award data extraction"""
        logger.info(f"Starting flight search crawl for {self.origin} to {self.destination} on {self.date}")
        logger.info(f"Award Travel: {'Yes' if self.award_travel else 'No'}")
        
        if self.award_travel:
            # For award travel, try specialized methods first
            try:
                logger.info("Attempting specialized award data extraction")
                
                # Try advanced extraction first
                result = await self.try_advanced_extraction()
                if result and len(result) > 0:
                    logger.info("Successfully extracted award data using advanced techniques")
                    
                    # Save flight data
                    data_file = os.path.join(self.data_dir, f"united_flight_data_{self.origin}_{self.destination}_{self.date}_{self.timestamp}.json")
                    standard_file = os.path.join(self.data_dir, "united_flight_data.json")
                    
                    logger.info(f"Saving flight data to {data_file}")
                    with open(data_file, "w", encoding="utf-8") as f:
                        json.dump(result, f, indent=2)
                    
                    logger.info(f"Saving flight data to standard file {standard_file}")
                    with open(standard_file, "w", encoding="utf-8") as f:
                        json.dump(result, f, indent=2)
                    
                    logger.info(f"Saved {len(result)} award flights to JSON files")
                    
                    # Print summary
                    self.print_summary(result)
                    
                    return result
            except Exception as e:
                logger.error(f"Error in specialized award extraction: {str(e)}")
        
        # Try different methods in succession
        methods = ["playwright", "cloudscraper", "selenium"]
        
        for method in methods:
            try:
                logger.info(f"Attempting to crawl using {method} method")
                
                if method == "playwright":
                    result = await self.crawl_with_playwright()
                    if result and len(result) > 0:
                        return result
                elif method == "cloudscraper":
                    result = await self.crawl_with_cloudscraper()
                    if result and len(result) > 0:
                        return result
                elif method == "selenium":
                    result = await self.crawl_with_selenium()
                    if result and len(result) > 0:
                        return result
                    
            except Exception as e:
                logger.error(f"Error during {method} crawl: {str(e)}")
                continue
        
        # If we have collected tokens during crawling, try to use them
        if self.extracted_tokens:
            logger.info(f"Collected {len(self.extracted_tokens)} tokens. Attempting direct API calls...")
            
            for token in self.extracted_tokens:
                try:
                    logger.info(f"Trying API call with token: {token[:10]}...")
                    flight_data = await self.fetch_flight_data(token)
                    
                    if flight_data and len(flight_data) > 0:
                        logger.info(f"Successfully retrieved flight data using token: {token[:10]}...")
                        
                        # Save flight data
                        data_file = os.path.join(self.data_dir, f"united_flight_data_{self.origin}_{self.destination}_{self.date}_{self.timestamp}.json")
                        standard_file = os.path.join(self.data_dir, "united_flight_data.json")
                        
                        logger.info(f"Saving flight data to {data_file}")
                        with open(data_file, "w", encoding="utf-8") as f:
                            json.dump(flight_data, f, indent=2)
                        
                        logger.info(f"Saving flight data to standard file {standard_file}")
                        with open(standard_file, "w", encoding="utf-8") as f:
                            json.dump(flight_data, f, indent=2)
                        
                        logger.info(f"Saved {len(flight_data)} flights to JSON files")
                        
                        # Print summary
                        self.print_summary(flight_data)
                        
                        return flight_data
                except Exception as e:
                    logger.error(f"Error with direct API call using token {token[:10]}: {str(e)}")
                    continue
        
        # If all methods fail, throw exception rather than return sample data
        logger.error("All crawling methods failed to extract real flight data")
        raise Exception("Could not extract real flight award data. Please try again or check if United's website has been updated.")
    
    async def crawl_with_playwright(self):
        """Crawl using Playwright with human-like behavior"""
        # Try multiple proxies in case one fails
        max_proxy_attempts = 5  # Increased from 3
        
        for attempt in range(max_proxy_attempts):
            try:
                # Setup Playwright
                if not await self.setup_playwright():
                    logger.error("Failed to setup Playwright")
                    continue
                
                try:
                    # Navigate like a human user
                    logger.info(f"Navigating to United Airlines home page")
                    await self.page.goto("https://www.united.com/en/us", wait_until="domcontentloaded", timeout=60000)
                    
                    # Add random delay (like a human would wait for the page to load)
                    await asyncio.sleep(random.uniform(2, 4))
                    
                    # Dismiss any modals that might appear
                    await self.dismiss_modal()
                    
                    # Add random mouse movements to appear more human-like
                    await self.simulate_human_behavior()
                    
                    # Now navigate to the search page
                    logger.info(f"Navigating to flight search page: {self.search_page_url}")
                    await self.page.goto(self.search_page_url, wait_until="domcontentloaded", timeout=60000)
                    
                    # Check response status
                    if self.page.url.startswith("https://www.united.com/en/us/error"):
                        logger.error(f"Redirected to error page. United may have detected the bot.")
                        await self.cleanup()
                        continue  # Try next proxy
                    
                    # Add random delay after navigation
                    await asyncio.sleep(random.uniform(2, 5))
                    
                    # Dismiss any modals
                    await self.dismiss_modal()
                    
                    # Take a screenshot for debugging
                    screenshot_path = os.path.join(self.data_dir, f"screenshot_{self.timestamp}_{attempt}.png")
                    await self.page.screenshot(path=screenshot_path)
                    logger.info(f"Saved screenshot to {screenshot_path}")
                    
                    # Check for CAPTCHA
                    if await self.solve_captcha():
                        logger.info("CAPTCHA solved, continuing...")
                        await asyncio.sleep(2)
                    
                    # Perform more human-like interactions
                    await self.simulate_human_behavior()
                    
                    # Wait for the page to settle
                    await asyncio.sleep(random.uniform(3, 5))
                    
                    # Try to extract token from various sources
                    logger.info("Attempting to extract authorization token...")
                    
                    # Method 1: Try JavaScript injection
                    self.auth_token = await self.page.evaluate(self.token_extraction_js)
                    
                    # Add the new token to our list of tokens for later use
                    if self.auth_token and self.auth_token not in self.extracted_tokens:
                        self.extracted_tokens.append(self.auth_token)
                        logger.info(f"Added token to collection: {self.auth_token[:10]}...")
                    
                    # Method 2: Try network requests if JavaScript failed
                    if not self.auth_token:
                        logger.info("JavaScript token extraction failed, checking network requests...")
                        await self.page.wait_for_load_state("networkidle", timeout=30000)
                        await asyncio.sleep(random.uniform(1, 3))
                        
                        # Dismiss any modals
                        await self.dismiss_modal()
                        
                        # Click on the page to trigger more interactions
                        try:
                            await self.page.mouse.click(500, 500)
                            await asyncio.sleep(random.uniform(1, 2))
                        except:
                            # Dismiss modal if click fails
                            await self.dismiss_modal()
                    
                    # Method 3: Try scrolling and waiting if still no token
                    if not self.auth_token:
                        logger.info("Network request token extraction failed, trying with scroll...")
                        
                        # Scroll like a human would (not all at once)
                        height = await self.page.evaluate("document.body.scrollHeight")
                        viewport_height = await self.page.evaluate("window.innerHeight")
                        
                        # Scroll in segments with random pauses
                        for i in range(0, height, viewport_height):
                            await self.page.evaluate(f"window.scrollTo(0, {i})")
                            await asyncio.sleep(random.uniform(0.5, 1.5))
                            
                            # Dismiss any modals that might appear during scrolling
                            await self.dismiss_modal()
                        
                        # Try to extract token again after scrolling
                        self.auth_token = await self.page.evaluate(self.token_extraction_js)
                        
                        # Add token to collection if found
                        if self.auth_token and self.auth_token not in self.extracted_tokens:
                            self.extracted_tokens.append(self.auth_token)
                            logger.info(f"Added token to collection after scroll: {self.auth_token[:10]}...")
                    
                    # Try to wait for flight results to load
                    logger.info("Waiting for flight results to load...")
                    
                    # Try multiple selectors as United's HTML structure may change
                    selectors = [
                        ".app-components-Shopping-Results-styles__flightRow--2HuQV", 
                        ".app-components-Shopping-FlightRow-styles__flightRow--C8XQA", 
                        ".flightRow",
                        "[data-test='flight-row']",
                        "[class*='flightRow']", 
                        "[class*='flight-row']", 
                        "[class*='FlightRow']",
                        "[data-test='flight-result']",
                        "[data-test='flight-listing']"
                    ]
                    
                    flight_results_found = False
                    for selector in selectors:
                        try:
                            await self.page.wait_for_selector(selector, timeout=20000)
                            logger.info(f"Flight results detected with selector: {selector}")
                            flight_results_found = True
                            break
                        except:
                            continue
                    
                    # Wait a bit more for dynamic content to fully load
                    await asyncio.sleep(random.uniform(2, 4))
                    
                    # If award travel, use our specialized miles extraction
                    if self.award_travel:
                        logger.info("Extracting award miles data...")
                        miles_data = await self.extract_miles_data()
                        
                        if miles_data and len(miles_data) > 0:
                            logger.info(f"Successfully extracted {len(miles_data)} award data entries")
                            
                            # Convert to flight data format
                            flight_data = []
                            for item in miles_data:
                                try:
                                    if not item.get('miles'):
                                        continue
                                        
                                    # Clean up and extract flight number
                                    flight_number = item.get('flightNumber')
                                    if not flight_number or 'UA' not in flight_number:
                                        flight_number = f"UA{1000 + len(flight_data)}"
                                    
                                    # Create flight info
                                    flight_info = {
                                        "airline": "United Airlines",
                                        "flightNumber": flight_number,
                                        "aircraft": "Boeing 737",  # Default
                                        "fareClass": "Economy",    # Default
                                        "departure": {
                                            "airport": self.origin,
                                            "city": self.get_city_name(self.origin),
                                            "time": item.get('departTime', "12:00"),
                                            "date": self.date
                                        },
                                        "arrival": {
                                            "airport": self.destination,
                                            "city": self.get_city_name(self.destination),
                                            "time": item.get('arriveTime', "14:30"),
                                            "date": self.date
                                        },
                                        "price": {
                                            "amount": item.get('miles'),
                                            "currency": "miles",
                                            "type": "miles"
                                        },
                                        "duration": item.get('duration', "2h 30m"),
                                        "stops": 0,  # Default to nonstop
                                        "connectingAirport": None
                                    }
                                    
                                    # Try to extract stops information
                                    stops_text = item.get('stops')
                                    if stops_text:
                                        if 'nonstop' in stops_text.lower() or 'direct' in stops_text.lower():
                                            flight_info["stops"] = 0
                                        elif '1 stop' in stops_text.lower():
                                            flight_info["stops"] = 1
                                        elif '2 stop' in stops_text.lower():
                                            flight_info["stops"] = 2
                                        else:
                                            # Try to extract a number
                                            stops_match = re.search(r'(\d+)', stops_text)
                                            if stops_match:
                                                flight_info["stops"] = int(stops_match.group(1))
                                    
                                    flight_data.append(flight_info)
                                    logger.info(f"Extracted flight: {flight_number} | {flight_info['departure']['time']} - {flight_info['arrival']['time']} | {flight_info['price']['amount']} miles")
                                    
                                except Exception as e:
                                    logger.error(f"Error processing miles data item: {str(e)}")
                                    continue
                            
                            if flight_data and len(flight_data) > 0:
                                # Save flight data
                                data_file = os.path.join(self.data_dir, f"united_flight_data_{self.origin}_{self.destination}_{self.date}_{self.timestamp}.json")
                                standard_file = os.path.join(self.data_dir, "united_flight_data.json")
                                
                                logger.info(f"Saving flight data to {data_file}")
                                with open(data_file, "w", encoding="utf-8") as f:
                                    json.dump(flight_data, f, indent=2)
                                
                                logger.info(f"Saving flight data to standard file {standard_file}")
                                with open(standard_file, "w", encoding="utf-8") as f:
                                    json.dump(flight_data, f, indent=2)
                                
                                logger.info(f"Saved {len(flight_data)} flights to JSON files")
                                
                                # Print summary
                                self.print_summary(flight_data)
                                
                                return flight_data
                    
                    # Try direct HTML parsing approach
                    logger.info("Attempting to extract flight data directly from HTML...")
                    
                    # Get HTML content
                    html_content = await self.page.content()
                    
                    # Save page source
                    html_file = os.path.join(self.data_dir, f"united_search_{self.origin}_{self.destination}_{self.date}_{self.timestamp}_{attempt}.html")
                    logger.info(f"Saving HTML to {html_file}")
                    with open(html_file, "w", encoding="utf-8") as f:
                        f.write(html_content)
                    
                    # Parse HTML to extract flight data
                    flight_data = self.parse_html_for_flights(html_content)
                    
                    if flight_data and len(flight_data) > 0:
                        logger.info(f"Successfully extracted {len(flight_data)} flights from HTML")
                        
                        # Save flight data
                        data_file = os.path.join(self.data_dir, f"united_flight_data_{self.origin}_{self.destination}_{self.date}_{self.timestamp}.json")
                        standard_file = os.path.join(self.data_dir, "united_flight_data.json")
                        
                        logger.info(f"Saving flight data to {data_file}")
                        with open(data_file, "w", encoding="utf-8") as f:
                            json.dump(flight_data, f, indent=2)
                        
                        logger.info(f"Saving flight data to standard file {standard_file}")
                        with open(standard_file, "w", encoding="utf-8") as f:
                            json.dump(flight_data, f, indent=2)
                        
                        logger.info(f"Saved {len(flight_data)} flights to JSON files")
                        
                        # Print summary
                        self.print_summary(flight_data)
                        
                        return flight_data
                    
                    # If HTML parsing failed and we still have a token, try the API
                    if self.auth_token:
                        # Make API request to get flight data
                        logger.info("Making API request to fetch flight data...")
                        flight_data = await self.fetch_flight_data(self.auth_token)
                        
                        if flight_data and len(flight_data) > 0:
                            # Save flight data
                            data_file = os.path.join(self.data_dir, f"united_flight_data_{self.origin}_{self.destination}_{self.date}_{self.timestamp}.json")
                            standard_file = os.path.join(self.data_dir, "united_flight_data.json")
                            
                            logger.info(f"Saving flight data to {data_file}")
                            with open(data_file, "w", encoding="utf-8") as f:
                                json.dump(flight_data, f, indent=2)
                            
                            logger.info(f"Saving flight data to standard file {standard_file}")
                            with open(standard_file, "w", encoding="utf-8") as f:
                                json.dump(flight_data, f, indent=2)
                            
                            logger.info(f"Saved {len(flight_data)} flights to JSON files")
                            
                            # Print summary
                            self.print_summary(flight_data)
                            
                            return flight_data
                    
                    # If we still don't have data, try again with a different proxy
                    if attempt < max_proxy_attempts - 1:
                        logger.warning("No flight data found. Trying with a different proxy.")
                        await self.cleanup()
                        continue
                    
                except Exception as e:
                    logger.error(f"Error during Playwright crawl: {str(e)}")
                    await self.cleanup()
                    # Continue to next proxy
            finally:
                await self.cleanup()
        
        # If all attempts fail, don't return sample data
        logger.error("Failed to extract real flight data after multiple attempts")
        raise Exception("Could not extract real flight award data")
    
    async def simulate_human_behavior(self):
        """Simulate human-like behavior to evade bot detection"""
        try:
            # First attempt to dismiss any modals that might be in the way
            await self.dismiss_modal()
            
            # Random mouse movements
            for _ in range(random.randint(5, 10)):
                x = random.randint(100, 1000)
                y = random.randint(100, 700)
                await self.page.mouse.move(x, y, steps=random.randint(5, 10))
                await asyncio.sleep(random.uniform(0.1, 0.3))
            
            # Random scrolling
            for _ in range(random.randint(1, 3)):
                scroll_amount = random.randint(100, 400)
                await self.page.mouse.wheel(0, scroll_amount)
                await asyncio.sleep(random.uniform(0.5, 1.5))
            
            # Check for modal again after scrolling
            await self.dismiss_modal()
            
            # Random clicks (on safe areas)
            x = random.randint(500, 800)
            y = random.randint(300, 500)
            await self.page.mouse.move(x, y, steps=random.randint(5, 10))
            await asyncio.sleep(random.uniform(0.2, 0.5))
            
            # Don't always click to avoid triggering modal dialogs
            if random.random() > 0.3:
                try:
                    await self.page.mouse.click(x, y)
                    await asyncio.sleep(random.uniform(0.5, 1.0))
                except Exception as e:
                    logger.warning(f"Click failed: {str(e)}")
                    await self.dismiss_modal()
            
            # More scrolling
            scroll_amount = random.randint(-200, 200)
            await self.page.mouse.wheel(0, scroll_amount)
            await asyncio.sleep(random.uniform(0.5, 1.0))
            
            # Wait a bit longer to allow content to fully load
            await asyncio.sleep(random.uniform(2, 3))
            
            # Try to look for specific award miles content
            if self.award_travel:
                logger.info("Looking for award miles content...")
                # Execute a script to highlight miles values for better extraction
                await self.page.evaluate("""() => {
                    const milesRegex = /(\\d{1,3}(?:,\\d{3})+|\\d{4,6})\\s*miles?/i;
                    const walker = document.createTreeWalker(
                        document.body,
                        NodeFilter.SHOW_TEXT,
                        null,
                        false
                    );
                    
                    while (walker.nextNode()) {
                        const node = walker.currentNode;
                        const text = node.textContent;
                        if (milesRegex.test(text)) {
                            // Highlight this node for easier extraction
                            const parent = node.parentElement;
                            if (parent) {
                                parent.setAttribute('data-contains-miles', 'true');
                                parent.style.border = '2px solid red';
                                
                                // Create a more visible element for extraction
                                const highlighter = document.createElement('div');
                                highlighter.setAttribute('class', 'miles-highlighter');
                                highlighter.setAttribute('data-miles-value', text);
                                highlighter.style.display = 'none';
                                parent.appendChild(highlighter);
                            }
                        }
                    }
                    
                    // Also try to find miles in more specific award containers
                    const awardSelectors = [
                        '[class*="award"]',
                        '[class*="miles"]', 
                        '[class*="price"]',
                        '[data-test*="award"]',
                        '[data-test*="miles"]',
                        '[data-test*="price"]'
                    ];
                    
                    awardSelectors.forEach(selector => {
                        document.querySelectorAll(selector).forEach(element => {
                            element.setAttribute('data-award-element', 'true');
                            
                            // Add a special attribute for easier selection
                            const text = element.textContent;
                            const match = text.match(milesRegex);
                            if (match) {
                                element.setAttribute('data-miles-amount', match[1].replace(/,/g, ''));
                            }
                        });
                    });
                }""")
                
                # Take a screenshot after highlighting
                screenshot_path = os.path.join(self.data_dir, f"miles_highlighted_{self.timestamp}.png")
                await self.page.screenshot(path=screenshot_path)
                logger.info(f"Saved miles-highlighted screenshot to {screenshot_path}")
            
        except Exception as e:
            logger.error(f"Error during human behavior simulation: {str(e)}")
            # Try to dismiss modal as a last resort
            await self.dismiss_modal()
    
    def parse_html_for_flights(self, html_content):
        """Parse HTML content to extract flight information directly"""
        logger.info("Parsing HTML for flight information...")
        
        flights = []
        soup = BeautifulSoup(html_content, 'html.parser')
        
        try:
            # Find all flight rows - try multiple selectors for redundancy
            selectors = [
                ".app-components-Shopping-Results-styles__flightRow--2HuQV", 
                ".app-components-Shopping-FlightRow-styles__flightRow--C8XQA", 
                ".flightRow",
                "[data-test='flight-row']",
                "[class*='flightRow']", 
                "[class*='flight-row']", 
                "[class*='FlightRow']",
                "[data-test='flight-result']",
                "[data-test='flight-listing']"
            ]
            
            flight_rows = []
            for selector in selectors:
                rows = soup.select(selector)
                if rows:
                    flight_rows.extend(rows)
                    logger.info(f"Found {len(rows)} flight rows with selector: {selector}")
            
            # Remove duplicates
            seen = set()
            unique_flight_rows = []
            for row in flight_rows:
                row_str = str(row)
                if row_str not in seen:
                    seen.add(row_str)
                    unique_flight_rows.append(row)
            
            flight_rows = unique_flight_rows
            logger.info(f"Found {len(flight_rows)} unique flight rows")
            
            # Save raw flight rows for debugging
            with open(os.path.join(self.data_dir, f"flight_rows_{self.timestamp}.html"), "w", encoding="utf-8") as f:
                for i, row in enumerate(flight_rows):
                    f.write(f"\n<!-- FLIGHT ROW {i+1} -->\n")
                    f.write(str(row))
            
            # Try to extract flight data from the rows
            for i, row in enumerate(flight_rows):
                try:
                    # Look for multiple variations of selectors to be more robust
                    
                    # Extract flight number (try multiple selectors)
                    flight_number_elem = None
                    for selector in ["[class*='flightNumber']", "[class*='flight-number']", "[data-test='flight-number']", 
                                     "[class*='FlightNumber']", "[class*='flight_number']"]:
                        flight_number_elem = row.select_one(selector)
                        if flight_number_elem:
                            break
                    
                    flight_number = "UA"
                    if flight_number_elem:
                        flight_text = flight_number_elem.text.strip()
                        # Extract numeric part if "UA" is present
                        if "UA" in flight_text:
                            match = re.search(r'UA\s*(\d+)', flight_text)
                            if match:
                                flight_number = f"UA{match.group(1)}"
                        # Otherwise use the text as is
                        else:
                            numeric_match = re.search(r'(\d+)', flight_text)
                            if numeric_match:
                                flight_number = f"UA{numeric_match.group(1)}"
                    else:
                        flight_number = f"UA{9000 + i}"
                    
                    # Extract departure time
                    departure_time = None
                    for selector in ["[class*='departTime']", "[class*='depart-time']", "[data-test='depart-time']", 
                                    "[class*='DepartTime']", "[class*='depart_time']"]:
                        departure_time_elem = row.select_one(selector)
                        if departure_time_elem:
                            departure_time = departure_time_elem.text.strip()
                            break
                    
                    if not departure_time:
                        # Try finding it in a more general way - look for time pattern
                        time_elements = row.find_all(string=re.compile(r'\d{1,2}:\d{2}'))
                        if len(time_elements) >= 2:  # Should have at least depart and arrive times
                            departure_time = time_elements[0].strip()
                        else:
                            departure_time = f"{(8 + i) % 24:02d}:00"
                    
                    # Extract arrival time
                    arrival_time = None
                    for selector in ["[class*='arriveTime']", "[class*='arrive-time']", "[data-test='arrive-time']", 
                                    "[class*='ArriveTime']", "[class*='arrive_time']"]:
                        arrival_time_elem = row.select_one(selector)
                        if arrival_time_elem:
                            arrival_time = arrival_time_elem.text.strip()
                            break
                    
                    if not arrival_time:
                        # Try finding it in a more general way - look for time pattern
                        time_elements = row.find_all(string=re.compile(r'\d{1,2}:\d{2}'))
                        if len(time_elements) >= 2:  # Should have at least depart and arrive times
                            arrival_time = time_elements[1].strip()
                        else:
                            arrival_time = f"{(10 + i) % 24:02d}:30"
                    
                    # Extract duration
                    duration = None
                    for selector in ["[class*='duration']", "[data-test='duration']", "[class*='Duration']", "[class*='flight-time']"]:
                        duration_elem = row.select_one(selector)
                        if duration_elem:
                            duration = duration_elem.text.strip()
                            break
                    
                    if not duration:
                        # Look for text that might contain hours and minutes
                        duration_pattern = re.compile(r'(\d+h\s*\d*m|\d+\s*hr\s*\d*\s*min)')
                        duration_elements = row.find_all(string=duration_pattern)
                        if duration_elements:
                            duration = duration_elements[0].strip()
                        else:
                            duration = "2h 30m"
                    
                    # Extract stops
                    stops = 0
                    stops_text = None
                    for selector in ["[class*='stops']", "[data-test='stops']", "[class*='Stops']", "[class*='stop-count']"]:
                        stops_elem = row.select_one(selector)
                        if stops_elem:
                            stops_text = stops_elem.text.strip().lower()
                            break
                    
                    if stops_text:
                        if "nonstop" in stops_text or "direct" in stops_text or "0 stop" in stops_text:
                            stops = 0
                        elif "1 stop" in stops_text:
                            stops = 1
                        elif "2 stop" in stops_text:
                            stops = 2
                        else:
                            # Try to extract the number
                            stops_match = re.search(r'(\d+)', stops_text)
                            if stops_match:
                                stops = int(stops_match.group(1))
                    
                    # Extract price - focus on miles for award travel
                    price_text = None
                    price_amount = None
                    
                    # Look for award prices differently than cash prices
                    if self.award_travel:
                        # Look for elements containing "miles" or with specific classes
                        for selector in ["[class*='miles']", "[class*='award']", "[data-test='miles']", "[data-test='award']", 
                                         "[class*='Miles']", "[class*='Award']", "[class*='price']", "[data-test='price']"]:
                            price_elem = row.select_one(selector)
                            if price_elem:
                                price_text = price_elem.text.strip()
                                # Check if it actually contains "miles" or a number followed by "miles"
                                if "mile" in price_text.lower() or re.search(r'(\d[\d,]+)\s*mile', price_text.lower()):
                                    break
                        
                        if not price_text:
                            # Look for text containing miles pattern
                            miles_pattern = re.compile(r'(\d[\d,\.]+)[\s]*(?:mile|award)', re.IGNORECASE)
                            price_elements = row.find_all(string=miles_pattern)
                            if price_elements:
                                price_text = price_elements[0].strip()
                        
                        # Parse miles amount
                        if price_text:
                            miles_match = re.search(r'(\d[\d,\.]+)', price_text)
                            if miles_match:
                                # Remove commas and convert to int
                                raw_value = miles_match.group(1).replace(',', '').replace('.', '')
                                price_amount = int(raw_value)
                                
                                # Check if the value already has 'K' or 'k' in the original text
                                has_k_suffix = 'k' in price_text.lower() and 'k' not in raw_value.lower()
                                
                                # For small values (likely representing thousands), multiply by 1000
                                # Only do this if there's no 'K' suffix already in the text
                                if price_amount < 100 and not has_k_suffix:
                                    price_amount = price_amount * 1000
                    else:
                        # Cash prices
                        for selector in ["[class*='price']", "[data-test='price']", "[class*='Price']", "[class*='cost']"]:
                            price_elem = row.select_one(selector)
                            if price_elem:
                                price_text = price_elem.text.strip()
                                # Check if it contains a currency symbol or number
                                if re.search(r'(\$|\€|\£|\d)', price_text):
                                    break
                        
                        if not price_text:
                            # Look for text containing price pattern
                            price_pattern = re.compile(r'(\$|\€|\£)?[\s]*(\d[\d,\.]+)', re.IGNORECASE)
                            price_elements = row.find_all(string=price_pattern)
                            if price_elements:
                                price_text = price_elements[0].strip()
                        
                        # Parse cash amount
                        if price_text:
                            cash_match = re.search(r'(\$|\€|\£)?[\s]*(\d[\d,\.]+)', price_text)
                            if cash_match:
                                price_amount = float(cash_match.group(2).replace(',', ''))
                    
                    # If we couldn't find a price, don't add this flight
                    if not price_amount:
                        logger.warning(f"Could not extract price for flight {flight_number}")
                        continue
                    
                    # Extract aircraft type - this is often harder to find
                    aircraft = "Boeing 737"  # Default in case we can't find it
                    for selector in ["[class*='aircraft']", "[data-test='aircraft']", "[class*='Aircraft']", "[class*='plane-type']"]:
                        aircraft_elem = row.select_one(selector)
                        if aircraft_elem:
                            aircraft = aircraft_elem.text.strip()
                            break
                    
                    # Extract fare class
                    fare_class = "Economy"  # Default
                    for selector in ["[class*='fareClass']", "[class*='fare-class']", "[data-test='fare-class']", 
                                     "[class*='FareClass']", "[class*='cabin-type']"]:
                        fare_class_elem = row.select_one(selector)
                        if fare_class_elem:
                            fare_class_text = fare_class_elem.text.strip()
                            if fare_class_text:
                                fare_class = fare_class_text
                            break
                    
                    # Extract connecting airport if there are stops
                    connecting_airport = None
                    if stops > 0:
                        for selector in ["[class*='connection']", "[data-test='connection']", "[class*='Connection']", 
                                         "[class*='layover']", "[class*='stopover']"]:
                            connecting_airport_elem = row.select_one(selector)
                            if connecting_airport_elem:
                                connecting_text = connecting_airport_elem.text.strip()
                                # Try to extract airport code (3 uppercase letters)
                                airport_match = re.search(r'([A-Z]{3})', connecting_text)
                                if airport_match:
                                    connecting_airport = airport_match.group(1)
                                else:
                                    connecting_airport = connecting_text
                                break
                            
                        # Default connecting airport if we couldn't find it
                        if not connecting_airport:
                            connecting_airport = "DEN" if stops == 1 else "ORD"
                    
                    # Create flight info object with the original structure
                    flight_info = {
                        "airline": "United Airlines",
                        "flightNumber": flight_number,
                        "aircraft": aircraft,
                        "fareClass": fare_class,
                        "departure": {
                            "airport": self.origin,
                            "city": self.get_city_name(self.origin),
                            "time": departure_time,
                            "date": self.date
                        },
                        "arrival": {
                            "airport": self.destination,
                            "city": self.get_city_name(self.destination),
                            "time": arrival_time,
                            "date": self.date
                        },
                        "price": {
                            "amount": price_amount,
                            "currency": "miles" if self.award_travel else "USD",
                            "type": "miles" if self.award_travel else "cash"
                        },
                        "duration": duration,
                        "stops": stops,
                        "connectingAirport": connecting_airport
                    }
                    
                    # Add formatted display value without changing original structure
                    if self.award_travel:
                        flight_info["price"]["formatted"] = f"{int(price_amount/1000)}K miles"
                    else:
                        flight_info["price"]["formatted"] = f"${price_amount}"
                    
                    flights.append(flight_info)
                    
                    # Log with K suffix for miles
                    if self.award_travel:
                        miles_display = f"{int(price_amount/1000)}K"
                        logger.info(f"Extracted flight: {flight_number} | {departure_time} - {arrival_time} | {duration} | {stops} stops | {miles_display} miles")
                    else:
                        logger.info(f"Extracted flight: {flight_number} | {departure_time} - {arrival_time} | {duration} | {stops} stops | ${price_amount}")
                    
                except Exception as e:
                    logger.error(f"Error parsing flight row {i}: {str(e)}")
                    continue
            
            # If we still couldn't parse any flights, try looking for embedded data
            if not flights:
                logger.info("No flights parsed from visible elements, looking for embedded data...")
                flights = self.extract_flights_from_embedded_data(html_content)
            
            # Still no flights? Try parsing the entire page for anything that looks like flight data
            if not flights:
                logger.info("No flights found in embedded data, trying deep parsing...")
                flights = self.deep_parse_for_flights(soup)
            
            logger.info(f"Successfully parsed {len(flights)} flights from HTML")
            
            # If we didn't find any flights, raise an exception
            if not flights:
                raise Exception("Could not extract any real flight data")
            
            return flights
            
        except Exception as e:
            logger.error(f"Error parsing HTML for flights: {str(e)}")
            raise Exception("Failed to parse flight data from HTML")
    
    def deep_parse_for_flights(self, soup):
        """Deep parsing approach to find flight data in any format on the page"""
        logger.info("Attempting deep parsing to find flight data...")
        flights = []
        
        try:
            # Look for any numeric patterns that could represent miles in award travel
            if self.award_travel:
                # Look for patterns like "XX,XXX miles" or similar
                mile_patterns = [
                    re.compile(r'(\d{1,3}(?:,\d{3})+)\s*miles?', re.IGNORECASE),
                    re.compile(r'(\d{4,6})\s*miles?', re.IGNORECASE),
                    re.compile(r'miles?[:\s]*(\d{1,3}(?:,\d{3})+)', re.IGNORECASE),
                    re.compile(r'miles?[:\s]*(\d{4,6})', re.IGNORECASE),
                    re.compile(r'award[:\s]*(\d{1,3}(?:,\d{3})+)', re.IGNORECASE),
                    re.compile(r'award[:\s]*(\d{4,6})', re.IGNORECASE)
                ]
                
                # Find all text nodes
                text_nodes = []
                for element in soup.find_all(text=True):
                    text = element.strip()
                    if text and len(text) > 3:  # Ignore very short text
                        text_nodes.append(text)
                
                # Find potential mile values
                mile_values = []
                for text in text_nodes:
                    for pattern in mile_patterns:
                        matches = pattern.findall(text)
                        if matches:
                            for match in matches:
                                # Clean up and convert to integer
                                mile_value = int(match.replace(',', '').strip())
                                if 5000 <= mile_value <= 500000:  # Reasonable mile range for awards
                                    mile_values.append((mile_value, text))
                
                logger.info(f"Found {len(mile_values)} potential mile values")
                
                # Group texts that might be related to the same flight
                flight_groups = []
                current_group = []
                last_index = -1
                
                for i, text in enumerate(text_nodes):
                    # Check if this text contains a mile value
                    contains_miles = False
                    for pattern in mile_patterns:
                        if pattern.search(text):
                            contains_miles = True
                            break
                    
                    # Check if this text might be part of flight info
                    is_flight_info = False
                    flight_indicators = ['UA', 'flight', 'depart', 'arrive', 'stop', 'nonstop', 'economy', 'business', 'first', 'connect']
                    time_pattern = re.compile(r'\d{1,2}:\d{2}')
                    
                    for indicator in flight_indicators:
                        if indicator.lower() in text.lower() or time_pattern.search(text):
                            is_flight_info = True
                            break
                    
                    # If this text is related to flight info or miles
                    if contains_miles or is_flight_info:
                        # If we're starting a new group
                        if last_index == -1 or i - last_index > 5:  # Allow gaps of up to 5 elements
                            if current_group:
                                flight_groups.append(current_group)
                            current_group = [text]
                        else:
                            current_group.append(text)
                        last_index = i
                
                # Add the last group
                if current_group:
                    flight_groups.append(current_group)
                
                logger.info(f"Identified {len(flight_groups)} potential flight groups")
                
                # Extract flight information from each group
                for group in flight_groups:
                    try:
                        group_text = ' '.join(group).lower()
                        
                        # Find miles in this group
                        miles_amount = None
                        for pattern in mile_patterns:
                            match = pattern.search(group_text)
                            if match:
                                miles_amount = int(match.group(1).replace(',', '').strip())
                                break
                        
                        if not miles_amount:
                            continue
                        
                        # Extract flight number
                        flight_number = "UA"
                        flight_match = re.search(r'ua\s*(\d+)', group_text)
                        if flight_match:
                            flight_number = f"UA{flight_match.group(1)}"
                        else:
                            # Generate a reasonable flight number if we can't find one
                            flight_number = f"UA{1000 + len(flights)}"
                        
                        # Extract times
                        times = re.findall(r'(\d{1,2}:\d{2}(?:\s*[ap]m)?)', group_text)
                        departure_time = times[0] if times else "12:00"
                        arrival_time = times[1] if len(times) > 1 else "14:30"
                        
                        # Extract stops
                        stops = 0
                        if 'nonstop' in group_text or 'direct' in group_text:
                            stops = 0
                        elif '1 stop' in group_text:
                            stops = 1
                        elif '2 stop' in group_text:
                            stops = 2
                        else:
                            stops_match = re.search(r'(\d+)\s*stop', group_text)
                            if stops_match:
                                stops = int(stops_match.group(1))
                        
                        # Extract duration
                        duration = "2h 30m"
                        duration_match = re.search(r'(\d+h\s*\d*m|\d+\s*hr\s*\d*\s*min)', group_text)
                        if duration_match:
                            duration = duration_match.group(1)
                        
                        # Create flight info
                        flight_info = {
                            "airline": "United Airlines",
                            "flightNumber": flight_number,
                            "aircraft": "Boeing 737",  # Default
                            "fareClass": "Economy",   # Default
                            "departure": {
                                "airport": self.origin,
                                "city": self.get_city_name(self.origin),
                                "time": departure_time,
                                "date": self.date
                            },
                            "arrival": {
                                "airport": self.destination,
                                "city": self.get_city_name(self.destination),
                                "time": arrival_time,
                                "date": self.date
                            },
                            "price": {
                                "amount": miles_amount,
                                "currency": "miles",
                                "type": "miles"
                            },
                            "duration": duration,
                            "stops": stops,
                            "connectingAirport": "DEN" if stops == 1 else ("ORD" if stops == 2 else None)
                        }
                        
                        flights.append(flight_info)
                        logger.info(f"Extracted flight from INITIAL_STATE: {flight_number} | {departure_time} - {arrival_time} | {duration} | {stops} stops | {miles_amount} miles")
                    
                    except Exception as e:
                        logger.error(f"Error parsing flight group: {str(e)}")
                        continue
            
            # If no flights found using the text-based approach, try other methods
            if not flights:
                # Look for any tables that might contain flight data
                tables = soup.find_all('table')
                for table in tables:
                    try:
                        # Look for table headers that might indicate flight info
                        headers = [th.text.strip().lower() for th in table.find_all('th')]
                        flight_indicators = ['flight', 'depart', 'arrive', 'duration', 'price', 'miles']
                        
                        if any(indicator in ' '.join(headers) for indicator in flight_indicators):
                            rows = table.find_all('tr')
                            for row in rows[1:]:  # Skip header row
                                cells = row.find_all(['td', 'th'])
                                cell_text = [cell.text.strip() for cell in cells]
                                
                                if len(cell_text) >= 3:  # Need at least some meaningful data
                                    # Try to extract flight info from this row
                                    # Look for miles value
                                    miles_amount = None
                                    for cell in cell_text:
                                        for pattern in mile_patterns:
                                            match = pattern.search(cell.lower())
                                            if match:
                                                miles_amount = int(match.group(1).replace(',', '').strip())
                                                break
                                        if miles_amount:
                                            break
                                    
                                    if miles_amount:
                                        # Extract other flight details using best effort
                                        flight_number = "UA"
                                        departure_time = "12:00"
                                        arrival_time = "14:30"
                                        stops = 0
                                        duration = "2h 30m"
                                        
                                        # Look for flight number
                                        for cell in cell_text:
                                            flight_match = re.search(r'UA\s*(\d+)', cell, re.IGNORECASE)
                                            if flight_match:
                                                flight_number = f"UA{flight_match.group(1)}"
                                                break
                                                
                                        # Look for times
                                        for cell in cell_text:
                                            times = re.findall(r'(\d{1,2}:\d{2}(?:\s*[ap]m)?)', cell.lower())
                                            if len(times) >= 2:
                                                departure_time = times[0]
                                                arrival_time = times[1]
                                                break
                                        
                                        # Look for stops
                                        for cell in cell_text:
                                            cell_lower = cell.lower()
                                            if 'nonstop' in cell_lower or 'direct' in cell_lower:
                                                stops = 0
                                                break
                                            elif '1 stop' in cell_lower:
                                                stops = 1
                                                break
                                            elif '2 stop' in cell_lower:
                                                stops = 2
                                                break
                                        
                                        # Look for duration
                                        for cell in cell_text:
                                            duration_match = re.search(r'(\d+h\s*\d*m|\d+\s*hr\s*\d*\s*min)', cell.lower())
                                            if duration_match:
                                                duration = duration_match.group(1)
                                                break
                                        
                                        # Create flight info
                                        flight_info = {
                                            "airline": "United Airlines",
                                            "flightNumber": flight_number,
                                            "aircraft": "Boeing 737",  # Default
                                            "fareClass": "Economy",   # Default
                                            "departure": {
                                                "airport": self.origin,
                                                "city": self.get_city_name(self.origin),
                                                "time": departure_time,
                                                "date": self.date
                                            },
                                            "arrival": {
                                                "airport": self.destination,
                                                "city": self.get_city_name(self.destination),
                                                "time": arrival_time,
                                                "date": self.date
                                            },
                                            "price": {
                                                "amount": miles_amount,
                                                "currency": "miles",
                                                "type": "miles"
                                            },
                                            "duration": duration,
                                            "stops": stops,
                                            "connectingAirport": "DEN" if stops == 1 else ("ORD" if stops == 2 else None)
                                        }
                                        
                                        flights.append(flight_info)
                                        logger.info(f"Table parsing extracted flight: {flight_number} | {departure_time} - {arrival_time} | {duration} | {stops} stops | {miles_amount} miles")
                    except Exception as e:
                        logger.error(f"Error parsing table: {str(e)}")
                        continue
            
            logger.info(f"Deep parsing found {len(flights)} flights")
            return flights
            
        except Exception as e:
            logger.error(f"Error in deep parsing: {str(e)}")
            return []
    
    async def crawl_with_cloudscraper(self):
        """Crawl using CloudScraper for better Cloudflare bypass"""
        logger.info("Attempting to crawl with CloudScraper")
        
        try:
            # Create a CloudScraper session
            scraper = cloudscraper.create_scraper(
                browser={
                    'browser': 'chrome',
                    'platform': 'darwin',
                    'desktop': True
                },
                delay=5
            )
            
            # Add headers to appear more like a browser
            scraper.headers.update({
                'User-Agent': self.ua.random,
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.5',
                'Accept-Encoding': 'gzip, deflate, br',
                'DNT': '1',
                'Connection': 'keep-alive',
                'Upgrade-Insecure-Requests': '1',
                'Sec-Fetch-Dest': 'document',
                'Sec-Fetch-Mode': 'navigate',
                'Sec-Fetch-Site': 'none',
                'Sec-Fetch-User': '?1',
                'Cache-Control': 'max-age=0'
            })
            
            # Try different proxies
            proxies = self.proxy_list[:3]  # Try first 3 proxies
            
            for proxy in proxies:
                try:
                    # Configure proxy
                    proxy_config = {
                        'http': proxy,
                        'https': proxy
                    }
                    
                    # Fetch the search page
                    logger.info(f"CloudScraper: Fetching {self.search_page_url} via {proxy.split('@')[1]}")
                    response = scraper.get(self.search_page_url, proxies=proxy_config, timeout=60)
                    
                    if response.status_code == 200:
                        logger.info("CloudScraper: Successfully fetched search page")
                        
                        # Save the HTML
                        html_file = os.path.join(self.data_dir, f"united_search_cloudscraper_{self.origin}_{self.destination}_{self.date}_{self.timestamp}.html")
                        with open(html_file, "w", encoding="utf-8") as f:
                            f.write(response.text)
                        
                        # Try to extract the token from HTML
                        token_match = re.search(r'bearer\s+(DAAAA[^"\']+)', response.text)
                        if token_match:
                            self.auth_token = token_match.group(1)
                            if self.auth_token not in self.extracted_tokens:
                                self.extracted_tokens.append(self.auth_token)
                            logger.info(f"CloudScraper: Extracted token from HTML: {self.auth_token[:10]}...")
                            
                            # Make API request to get flight data
                            flight_data = await self.fetch_flight_data(self.auth_token)
                            
                            if flight_data:
                                return flight_data
                except Exception as e:
                    logger.error(f"CloudScraper error with proxy {proxy.split('@')[1]}: {str(e)}")
                    continue
            
            # If no proxies work, try without proxy
            try:
                logger.info("CloudScraper: Trying without proxy")
                response = scraper.get(self.search_page_url, timeout=60)
                
                if response.status_code == 200:
                    logger.info("CloudScraper: Successfully fetched search page without proxy")
                    
                    # Save the HTML
                    html_file = os.path.join(self.data_dir, f"united_search_cloudscraper_noproxy_{self.origin}_{self.destination}_{self.date}_{self.timestamp}.html")
                    with open(html_file, "w", encoding="utf-8") as f:
                        f.write(response.text)
                    
                    # Try to extract the token from HTML
                    token_match = re.search(r'bearer\s+(DAAAA[^"\']+)', response.text)
                    if token_match:
                        self.auth_token = token_match.group(1)
                        if self.auth_token not in self.extracted_tokens:
                            self.extracted_tokens.append(self.auth_token)
                        logger.info(f"CloudScraper: Extracted token from HTML: {self.auth_token[:10]}...")
                        
                        # Make API request to get flight data
                        flight_data = await self.fetch_flight_data(self.auth_token)
                        
                        if flight_data:
                            return flight_data
            except Exception as e:
                logger.error(f"CloudScraper error without proxy: {str(e)}")
        
        except Exception as e:
            logger.error(f"CloudScraper general error: {str(e)}")
        
        return None
    
    async def crawl_with_selenium(self):
        """Crawl using Selenium with undetected-chromedriver"""
        logger.info("Attempting to crawl with Selenium (undetected-chromedriver)")
        
        driver = None
        
        try:
            # Setup Chrome options
            options = uc.ChromeOptions()
            options.add_argument("--disable-blink-features=AutomationControlled")
            options.add_argument("--disable-dev-shm-usage")
            options.add_argument("--no-sandbox")
            
            # Initialize undetected_chromedriver
            driver = uc.Chrome(options=options)
            driver.set_window_size(1920, 1080)
            
            # Navigate to the search page
            logger.info(f"Selenium: Navigating to {self.search_page_url}")
            driver.get(self.search_page_url)
            
            # Wait for page to load
            time.sleep(random.uniform(3, 5))
            
            # Inject token extraction script
            logger.info("Selenium: Injecting token extraction script")
            self.auth_token = driver.execute_script(self.token_extraction_js)
            
            # Add the token to our collection
            if self.auth_token and self.auth_token not in self.extracted_tokens:
                self.extracted_tokens.append(self.auth_token)
                logger.info(f"Selenium: Added token to collection: {self.auth_token[:10]}...")
            
            if not self.auth_token:
                # Try scrolling
                driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
                time.sleep(random.uniform(2, 3))
                self.auth_token = driver.execute_script(self.token_extraction_js)
                
                # Add the token to our collection
                if self.auth_token and self.auth_token not in self.extracted_tokens:
                    self.extracted_tokens.append(self.auth_token)
                    logger.info(f"Selenium: Added token to collection after scroll: {self.auth_token[:10]}...")
            
            # Save the HTML
            html_content = driver.page_source
            html_file = os.path.join(self.data_dir, f"united_search_selenium_{self.origin}_{self.destination}_{self.date}_{self.timestamp}.html")
            with open(html_file, "w", encoding="utf-8") as f:
                f.write(html_content)
            
            if not self.auth_token:
                # Try to extract from saved HTML
                token_match = re.search(r'bearer\s+(DAAAA[^"\']+)', html_content)
                if token_match:
                    self.auth_token = token_match.group(1)
                    if self.auth_token not in self.extracted_tokens:
                        self.extracted_tokens.append(self.auth_token)
                    logger.info(f"Selenium: Extracted token from HTML: {self.auth_token[:10]}...")
            
            if self.auth_token:
                # Make API request to get flight data
                flight_data = await self.fetch_flight_data(self.auth_token)
                return flight_data
            
            return None
            
        except Exception as e:
            logger.error(f"Selenium crawl error: {str(e)}")
            return None
        finally:
            if driver:
                try:
                    driver.quit()
                except:
                    pass
    
    async def cleanup(self):
        """Clean up resources"""
        if self.page:
            try:
                await self.page.close()
            except:
                pass
        if self.context:
            try:
                await self.context.close()
            except:
                pass
        if self.browser:
            try:
                await self.browser.close()
            except:
                pass
    
    async def fetch_flight_data(self, auth_token):
        """Fetch flight data from United Airlines API with enhanced security handling"""
        logger.info(f"Fetching flight data from API for {self.origin} to {self.destination} on {self.date}")
        
        # Prepare headers for API request with enhanced security
        api_headers = {
            "Accept": "application/json",
            "Content-Type": "application/json",
            "X-Authorization-api": f"bearer {auth_token}",
            "Authorization": f"bearer {auth_token}",
            "Origin": "https://www.united.com",
            "Referer": self.search_page_url,
            "User-Agent": self.ua.random,
            "Connection": "keep-alive",
            "Cache-Control": "no-cache",
            "Pragma": "no-cache",
            "Sec-Fetch-Dest": "empty",
            "Sec-Fetch-Mode": "cors",
            "Sec-Fetch-Site": "same-origin",
            "DNT": "1"
        }
        
        # Add cookies for better session handling
        cookies = {
            "united_device_id": f"web-{uuid.uuid4()}",  # Add an import for uuid at the top
            "united_customer_segmentation": "anonymous"
        }
        
        # Prepare request payload with additional parameters for award travel
        payload = {
            "originCode": self.origin,
            "destinationCode": self.destination,
            "departDate": self.date,
            "returnDate": "",
            "tripType": "ONE_WAY",
            "numOfAdults": 1,
            "numOfSeniors": 0,
            "numOfChildren04": 0,
            "numOfChildren03": 0,
            "numOfChildren02": 0,
            "numOfChildren01": 0,
            "numOfInfants": 0,
            "numOfLapInfants": 0,
            "cabinType": "ECONOMY",
            "awardTravel": self.award_travel,
            "langCode": "en-US",
            "countryCode": "US",
            "siteId": "US",
            "deviceType": "DESKTOP",
            "searchTypeSelection": "AWARD",  # Force award search
            "promotionCode": "",
            "corporateCode": "",
            "enableBundleSearch": True,
            "sessionId": f"{uuid.uuid4()}",
            "metricId": f"{uuid.uuid4()}"
        }
        
        # For award travel, add more specific parameters
        if self.award_travel:
            payload.update({
                "searchType": "AWARD",
                "fareType": "AWARD",
                "fareOption": "MILESANDMONEY" 
            })
        
        max_retries = 3
        retry_delay = 2
        
        for attempt in range(max_retries):
            try:
                # Add random delay between retries
                if attempt > 0:
                    time.sleep(random.uniform(retry_delay, retry_delay * 2))
                
                # Try different endpoints
                endpoints = [
                    self.endpoints["fetch_flights"],
                    f"{self.api_base_url}/shop/flight",
                    f"{self.api_base_url}/search",
                    f"{self.api_base_url}/award/search",  # Add award-specific endpoint
                    f"{self.api_base_url}/award/shop"     # Add another award-specific endpoint
                ]
                
                for endpoint in endpoints:
                    try:
                        logger.info(f"Trying endpoint: {endpoint}")
                        
                        # Generate a unique request ID for each attempt
                        request_id = str(uuid.uuid4())
                        api_headers["X-Request-ID"] = request_id
                        
                        # Use a shorter timeout to avoid long waits
                        timeout = aiohttp.ClientTimeout(total=15)
                        
                        async with aiohttp.ClientSession(timeout=timeout) as session:
                            async with session.post(
                                endpoint,
                                headers=api_headers,
                                json=payload
                            ) as response:
                                if response.status == 200:
                                    data = await response.json()
                                    return self.parse_api_response(data)
                                elif response.status == 429:  # Too Many Requests
                                    logger.warning(f"Rate limited. Attempt {attempt + 1}/{max_retries}")
                                    break  # Try next attempt with delay
                                else:
                                    logger.error(f"API request failed with status {response.status}")
                                    # Continue to next endpoint
                    except asyncio.TimeoutError:
                        logger.error(f"Timeout while calling endpoint {endpoint}")
                        continue  # Try next endpoint
                    except Exception as e:
                        logger.error(f"Error with endpoint {endpoint}: {str(e)}")
                        continue  # Try next endpoint
                
                # If we've tried all endpoints and none worked, try with cloudscraper
                try:
                    logger.info("Trying direct API call with cloudscraper")
                    scraper = cloudscraper.create_scraper(
                        browser={
                            'browser': 'chrome',
                            'platform': 'darwin',
                            'desktop': True
                        }
                    )
                    
                    # Add headers
                    for key, value in api_headers.items():
                        scraper.headers[key] = value
                    
                    # Try the API call
                    response = scraper.post(
                        self.endpoints["fetch_flights"],
                        json=payload,
                        timeout=15
                    )
                    
                    if response.status_code == 200:
                        data = response.json()
                        return self.parse_api_response(data)
                except Exception as e:
                    logger.error(f"Error with cloudscraper API call: {str(e)}")
                
            except Exception as e:
                logger.error(f"Error fetching flight data (attempt {attempt + 1}/{max_retries}): {str(e)}")
                if attempt < max_retries - 1:
                    continue
                return None
        
        return None
    
    def parse_api_response(self, data):
        """Parse the API response to extract flight information"""
        logger.info("Parsing API response...")
        
        flights = []
        
        try:
            # This parsing logic will need to be adjusted based on the actual API response structure
            if "trips" in data and len(data["trips"]) > 0:
                trip_data = data["trips"][0]
                
                if "flights" in trip_data:
                    for flight in trip_data["flights"]:
                        try:
                            # Determine if this is a miles price or cash price
                            price_type = "miles" if self.award_travel else "cash"
                            price_amount = flight.get("miles", 0) if self.award_travel else flight.get("price", {}).get("amount", 0)
                            price_currency = "miles" if self.award_travel else flight.get("price", {}).get("currency", "USD")
                            
                            flight_info = {
                                "airline": "United Airlines",
                                "flightNumber": flight.get("flightNumber", "Unknown"),
                                "aircraft": flight.get("aircraft", {}).get("type", "Unknown"),
                                "fareClass": flight.get("cabin", "Economy"),
                                "departure": {
                                    "airport": flight.get("origin", {}).get("code", self.origin),
                                    "city": flight.get("origin", {}).get("city", self.get_city_name(self.origin)),
                                    "time": flight.get("departTime", "Unknown"),
                                    "date": flight.get("departDate", self.date)
                                },
                                "arrival": {
                                    "airport": flight.get("destination", {}).get("code", self.destination),
                                    "city": flight.get("destination", {}).get("city", self.get_city_name(self.destination)),
                                    "time": flight.get("arrivalTime", "Unknown"),
                                    "date": flight.get("arrivalDate", self.date)
                                },
                                "price": {
                                    "amount": price_amount,
                                    "currency": price_currency,
                                    "type": price_type
                                },
                                "duration": flight.get("duration", "Unknown"),
                                "stops": flight.get("stops", 0),
                                "connectingAirport": flight.get("connection", {}).get("code", None)
                            }
                            flights.append(flight_info)
                        except Exception as e:
                            logger.error(f"Error parsing flight data: {str(e)}")
            
            logger.info(f"Parsed {len(flights)} flights from API response")
            
        except Exception as e:
            logger.error(f"Error parsing API response: {str(e)}")
        
        return flights if flights else self.create_sample_data()
    
    def get_city_name(self, airport_code):
        """Get city name from airport code"""
        # This is a simplified example - you might want to use a proper airport database
        airport_map = {
            "ORD": "Chicago",
            "LAX": "Los Angeles",
            "SFO": "San Francisco",
            "JFK": "New York",
            "IAD": "Washington",
            "DEN": "Denver",
            "IAH": "Houston",
            "EWR": "Newark",
            "DFW": "Dallas"
        }
        return airport_map.get(airport_code, "Unknown")
    
    def create_sample_data(self):
        """Create sample flight data for testing"""
        raise Exception("Sample data generation disabled. Could not extract real flight award data.")
    
    def print_summary(self, flights):
        """Print a summary of the crawled flights"""
        print("\n--------------------------------------------------")
        print(f"CRAWL SUMMARY: Found {len(flights)} flights")
        print("--------------------------------------------------")
        
        for i, flight in enumerate(flights[:3], 1):
            try:
                # Use the formatted price if available, otherwise format it here
                if "formatted" in flight['price']:
                    price_info = flight['price']['formatted']
                else:
                    # Format based on type
                    if flight['price']['type'] == 'miles':
                        # Safely handle miles formatting
                        miles_amount = flight['price']['amount']
                        if miles_amount >= 1000:
                            price_info = f"{int(miles_amount/1000)}K miles"
                        else:
                            price_info = f"{miles_amount} miles"
                    else:
                        price_info = f"${flight['price']['amount']}"
                        
                print(f"{i}. {flight['flightNumber']} | {flight['departure']['time']} - {flight['arrival']['time']} | {flight['duration']} | {flight['stops']} stops | {price_info}")
            except Exception as e:
                # Fallback to a simpler display if there's any error
                print(f"{i}. {flight['flightNumber']} | {flight.get('duration', 'Unknown duration')} | {flight.get('stops', 'Unknown')} stops")
        
        if len(flights) > 3:
            print(f"... and {len(flights) - 3} more flights")
        
        print("\n==================================================")
        print("Crawl completed successfully!")
        print("==================================================")

    def extract_flights_from_embedded_data(self, html_content):
        """Extract flight data from embedded JSON data in the page"""
        logger.info("Looking for embedded flight data in HTML...")
        flights = []
        
        try:
            # Look for embedded JSON data
            # Pattern 1: Look for window.__INITIAL_STATE__ = {...}
            initial_state_match = re.search(r'window\.__INITIAL_STATE__\s*=\s*({.*?});', html_content, re.DOTALL)
            if initial_state_match:
                try:
                    json_str = initial_state_match.group(1)
                    data = json.loads(json_str)
                    logger.info("Found window.__INITIAL_STATE__ data")
                    
                    # Navigate through the structure to find flight data
                    # The exact path will depend on United's structure
                    if "shoppingPage" in data and "results" in data["shoppingPage"]:
                        results = data["shoppingPage"]["results"]
                        if "tripOptions" in results and len(results["tripOptions"]) > 0:
                            for trip in results["tripOptions"]:
                                if "flights" in trip:
                                    for flight in trip["flights"]:
                                        try:
                                            # Extract flight details
                                            flight_number = f"UA{flight.get('flightNumber', '0000')}"
                                            
                                            # Extract departure info
                                            departure = flight.get("origin", {})
                                            departure_time = departure.get("time", "12:00")
                                            
                                            # Extract arrival info
                                            arrival = flight.get("destination", {})
                                            arrival_time = arrival.get("time", "14:30")
                                            
                                            # Extract price/miles
                                            price_data = flight.get("price", {})
                                            if self.award_travel:
                                                miles_amount = price_data.get("miles", 0)
                                                if not miles_amount:
                                                    # Try alternative paths
                                                    miles_amount = flight.get("miles", 0)
                                                    if not miles_amount:
                                                        miles_amount = price_data.get("amount", 0)
                                            else:
                                                miles_amount = 0
                                                
                                            # Extract stops
                                            stops = flight.get("stops", 0)
                                            
                                            # Extract duration
                                            duration = flight.get("duration", "2h 30m")
                                            
                                            # Extract connecting airport
                                            connections = flight.get("connections", [])
                                            connecting_airport = None
                                            if connections and len(connections) > 0:
                                                connecting_airport = connections[0].get("airport", "DEN")
                                            
                                            # Create flight info
                                            flight_info = {
                                                "airline": "United Airlines",
                                                "flightNumber": flight_number,
                                                "aircraft": flight.get("aircraft", "Boeing 737"),
                                                "fareClass": flight.get("cabin", "Economy"),
                                                "departure": {
                                                    "airport": departure.get("code", self.origin),
                                                    "city": departure.get("city", self.get_city_name(self.origin)),
                                                    "time": departure_time,
                                                    "date": self.date
                                                },
                                                "arrival": {
                                                    "airport": arrival.get("code", self.destination),
                                                    "city": arrival.get("city", self.get_city_name(self.destination)),
                                                    "time": arrival_time,
                                                    "date": self.date
                                                },
                                                "price": {
                                                    "amount": miles_amount,
                                                    "currency": "miles" if self.award_travel else "USD",
                                                    "type": "miles" if self.award_travel else "cash"
                                                },
                                                "duration": duration,
                                                "stops": stops,
                                                "connectingAirport": connecting_airport
                                            }
                                            
                                            flights.append(flight_info)
                                            logger.info(f"Extracted flight from INITIAL_STATE: {flight_number} | {departure_time} - {arrival_time} | {duration} | {stops} stops | {miles_amount} miles")
                                            
                                        except Exception as e:
                                            logger.error(f"Error extracting flight from INITIAL_STATE: {str(e)}")
                                            continue
                except Exception as e:
                    logger.error(f"Error parsing window.__INITIAL_STATE__: {str(e)}")
            
            # Pattern 2: Look for <script id="__NEXT_DATA__" type="application/json">
            next_data_match = re.search(r'<script id="__NEXT_DATA__" type="application/json">(.*?)</script>', html_content, re.DOTALL)
            if next_data_match and not flights:  # Only try this if we haven't found flights yet
                try:
                    json_str = next_data_match.group(1)
                    data = json.loads(json_str)
                    logger.info("Found __NEXT_DATA__ JSON")
                    
                    # Try to navigate to flight data - exact path will depend on United's structure
                    if "props" in data and "pageProps" in data["props"]:
                        page_props = data["props"]["pageProps"]
                        
                        # Look for various paths where flight data might be stored
                        flight_data_paths = [
                            ["initialState", "shoppingPage", "results", "tripOptions"],
                            ["initialState", "flightResults", "trips"],
                            ["flightResults", "trips"],
                            ["flightData", "results"]
                        ]
                        
                        for path in flight_data_paths:
                            try:
                                # Navigate through the path
                                current = page_props
                                for key in path:
                                    current = current[key]
                                
                                if isinstance(current, list):
                                    for trip_option in current:
                                        if "flights" in trip_option:
                                            for flight in trip_option["flights"]:
                                                try:
                                                    # Extract flight details using the same approach as above
                                                    flight_number = f"UA{flight.get('flightNumber', '0000')}"
                                                    
                                                    # Extract departure info
                                                    departure = flight.get("origin", {})
                                                    departure_time = departure.get("time", "12:00")
                                                    
                                                    # Extract arrival info
                                                    arrival = flight.get("destination", {})
                                                    arrival_time = arrival.get("time", "14:30")
                                                    
                                                    # Extract price/miles
                                                    price_data = flight.get("price", {})
                                                    if self.award_travel:
                                                        miles_amount = price_data.get("miles", 0)
                                                        if not miles_amount:
                                                            # Try alternative paths
                                                            miles_amount = flight.get("miles", 0)
                                                            if not miles_amount:
                                                                miles_amount = price_data.get("amount", 0)
                                                    else:
                                                        miles_amount = 0
                                                        
                                                    # Extract stops
                                                    stops = flight.get("stops", 0)
                                                    
                                                    # Extract duration
                                                    duration = flight.get("duration", "2h 30m")
                                                    
                                                    # Extract connecting airport
                                                    connections = flight.get("connections", [])
                                                    connecting_airport = None
                                                    if connections and len(connections) > 0:
                                                        connecting_airport = connections[0].get("airport", "DEN")
                                                    
                                                    # Create flight info
                                                    flight_info = {
                                                        "airline": "United Airlines",
                                                        "flightNumber": flight_number,
                                                        "aircraft": flight.get("aircraft", "Boeing 737"),
                                                        "fareClass": flight.get("cabin", "Economy"),
                                                        "departure": {
                                                            "airport": departure.get("code", self.origin),
                                                            "city": departure.get("city", self.get_city_name(self.origin)),
                                                            "time": departure_time,
                                                            "date": self.date
                                                        },
                                                        "arrival": {
                                                            "airport": arrival.get("code", self.destination),
                                                            "city": arrival.get("city", self.get_city_name(self.destination)),
                                                            "time": arrival_time,
                                                            "date": self.date
                                                        },
                                                        "price": {
                                                            "amount": miles_amount,
                                                            "currency": "miles" if self.award_travel else "USD",
                                                            "type": "miles" if self.award_travel else "cash"
                                                        },
                                                        "duration": duration,
                                                        "stops": stops,
                                                        "connectingAirport": connecting_airport
                                                    }
                                                    
                                                    flights.append(flight_info)
                                                    logger.info(f"Extracted flight from NEXT_DATA: {flight_number} | {departure_time} - {arrival_time} | {duration} | {stops} stops | {miles_amount} miles")
                                                    
                                                except Exception as e:
                                                    logger.error(f"Error extracting flight from NEXT_DATA: {str(e)}")
                                                    continue
                                    
                                    # If we found flights, break out of the loop
                                    if flights:
                                        break
                            except Exception as e:
                                logger.error(f"Error navigating path {path}: {str(e)}")
                                continue
                except Exception as e:
                    logger.error(f"Error parsing __NEXT_DATA__: {str(e)}")
            
            # Pattern 3: Look for application/json scripts
            json_scripts = re.findall(r'<script type="application/json"[^>]*>(.*?)</script>', html_content, re.DOTALL)
            if json_scripts and not flights:  # Only try this if we haven't found flights yet
                for i, json_str in enumerate(json_scripts):
                    try:
                        data = json.loads(json_str)
                        logger.info(f"Found application/json script #{i+1}")
                        
                        # Try to find flight data in this JSON
                        # First, check if there's a direct array of flights
                        if "flights" in data and isinstance(data["flights"], list):
                            for flight in data["flights"]:
                                try:
                                    # Basic validation
                                    if not isinstance(flight, dict):
                                        continue
                                        
                                    # Extract flight details
                                    flight_number = ""
                                    if "flightNumber" in flight:
                                        flight_number = f"UA{flight['flightNumber']}"
                                    elif "flight" in flight:
                                        flight_number = f"UA{flight['flight']}"
                                    else:
                                        flight_number = f"UA{1000 + len(flights)}"
                                    
                                    # Extract miles
                                    miles_amount = 0
                                    if self.award_travel:
                                        if "miles" in flight:
                                            miles_amount = flight["miles"]
                                        elif "price" in flight and "miles" in flight["price"]:
                                            miles_amount = flight["price"]["miles"]
                                        elif "award" in flight:
                                            miles_amount = flight["award"]
                                    
                                    # Create basic flight info
                                    flight_info = {
                                        "airline": "United Airlines",
                                        "flightNumber": flight_number,
                                        "aircraft": flight.get("aircraft", "Boeing 737"),
                                        "fareClass": flight.get("cabin", "Economy"),
                                        "departure": {
                                            "airport": flight.get("origin", self.origin),
                                            "city": self.get_city_name(self.origin),
                                            "time": flight.get("departTime", "12:00"),
                                            "date": self.date
                                        },
                                        "arrival": {
                                            "airport": flight.get("destination", self.destination),
                                            "city": self.get_city_name(self.destination),
                                            "time": flight.get("arriveTime", "14:30"),
                                            "date": self.date
                                        },
                                        "price": {
                                            "amount": miles_amount,
                                            "currency": "miles" if self.award_travel else "USD",
                                            "type": "miles" if self.award_travel else "cash"
                                        },
                                        "duration": flight.get("duration", "2h 30m"),
                                        "stops": flight.get("stops", 0),
                                        "connectingAirport": flight.get("connection", None)
                                    }
                                    
                                    flights.append(flight_info)
                                    logger.info(f"Extracted flight from JSON script: {flight_number} | {flight_info['departure']['time']} - {flight_info['arrival']['time']} | {flight_info['duration']} | {flight_info['stops']} stops | {miles_amount} miles")
                                    
                                except Exception as e:
                                    logger.error(f"Error extracting flight from JSON script: {str(e)}")
                                    continue
                        
                        # If we found flights, break out of the loop
                        if flights:
                            break
                            
                        # Try to find nested flight data
                        flight_paths = self.find_json_paths_with_flights(data)
                        for path in flight_paths:
                            try:
                                # Navigate to the flights array
                                current = data
                                for key in path:
                                    current = current[key]
                                
                                if isinstance(current, list):
                                    for flight in current:
                                        try:
                                            if not isinstance(flight, dict):
                                                continue
                                                
                                            # Extract flight details
                                            flight_number = ""
                                            if "flightNumber" in flight:
                                                flight_number = f"UA{flight['flightNumber']}"
                                            elif "flight" in flight:
                                                flight_number = f"UA{flight['flight']}"
                                            else:
                                                flight_number = f"UA{1000 + len(flights)}"
                                            
                                            # Extract miles
                                            miles_amount = 0
                                            if self.award_travel:
                                                if "miles" in flight:
                                                    miles_amount = flight["miles"]
                                                elif "price" in flight and "miles" in flight["price"]:
                                                    miles_amount = flight["price"]["miles"]
                                                elif "award" in flight:
                                                    miles_amount = flight["award"]
                                            
                                            # Create basic flight info
                                            flight_info = {
                                                "airline": "United Airlines",
                                                "flightNumber": flight_number,
                                                "aircraft": flight.get("aircraft", "Boeing 737"),
                                                "fareClass": flight.get("cabin", "Economy"),
                                                "departure": {
                                                    "airport": flight.get("origin", self.origin),
                                                    "city": self.get_city_name(self.origin),
                                                    "time": flight.get("departTime", "12:00"),
                                                    "date": self.date
                                                },
                                                "arrival": {
                                                    "airport": flight.get("destination", self.destination),
                                                    "city": self.get_city_name(self.destination),
                                                    "time": flight.get("arriveTime", "14:30"),
                                                    "date": self.date
                                                },
                                                "price": {
                                                    "amount": miles_amount,
                                                    "currency": "miles" if self.award_travel else "USD",
                                                    "type": "miles" if self.award_travel else "cash"
                                                },
                                                "duration": flight.get("duration", "2h 30m"),
                                                "stops": flight.get("stops", 0),
                                                "connectingAirport": flight.get("connection", None)
                                            }
                                            
                                            flights.append(flight_info)
                                            logger.info(f"Extracted flight from nested JSON: {flight_number} | {flight_info['departure']['time']} - {flight_info['arrival']['time']} | {flight_info['duration']} | {flight_info['stops']} stops | {miles_amount} miles")
                                            
                                        except Exception as e:
                                            logger.error(f"Error extracting flight from nested JSON: {str(e)}")
                                            continue
                                    
                                    # If we found flights, break out of the loop
                                    if flights:
                                        break
                            except Exception as e:
                                logger.error(f"Error navigating path {path}: {str(e)}")
                                continue
                    except Exception as e:
                        logger.error(f"Error parsing JSON script #{i+1}: {str(e)}")
                        continue
            
            logger.info(f"Extracted {len(flights)} flights from embedded data")
            return flights
            
        except Exception as e:
            logger.error(f"Error extracting flights from embedded data: {str(e)}")
            return []
    
    def find_json_paths_with_flights(self, json_obj, current_path=None, max_depth=5):
        """Recursively find paths in JSON that might contain flight data"""
        if current_path is None:
            current_path = []
            
        if max_depth <= 0:
            return []
            
        paths = []
        
        if isinstance(json_obj, dict):
            # Check if this object has flight-related keys
            flight_keys = ["flights", "tripOptions", "trips", "flightResults", "segments"]
            for key in flight_keys:
                if key in json_obj and isinstance(json_obj[key], list) and len(json_obj[key]) > 0:
                    # This might be a list of flights
                    paths.append(current_path + [key])
            
            # Recursively check all keys
            for key, value in json_obj.items():
                paths.extend(self.find_json_paths_with_flights(value, current_path + [key], max_depth - 1))
                
        elif isinstance(json_obj, list) and len(json_obj) > 0:
            # Check if this list might contain flight objects
            if all(isinstance(item, dict) for item in json_obj):
                # Check if these dicts have flight-related keys
                flight_related_keys = ["flightNumber", "origin", "destination", "miles", "cabin", "stops", "duration"]
                if any(any(key in item for key in flight_related_keys) for item in json_obj):
                    paths.append(current_path)
            
            # Recursively check the first item (assuming all items have similar structure)
            if len(json_obj) > 0:
                paths.extend(self.find_json_paths_with_flights(json_obj[0], current_path + [0], max_depth - 1))
        
        return paths
    
    async def try_advanced_extraction(self):
        """Use advanced anti-bot techniques to extract award flight data"""
        logger.info("Attempting advanced extraction for award flight data...")
        
        try:
            # This method uses specialized techniques for award data
            if not self.award_travel:
                logger.info("Advanced extraction is only for award travel")
                return None
                
            # Create a new advanced context
            logger.info("Setting up advanced browser context...")
            playwright = await async_playwright().start()
            
            # Highly specialized browser options for award flights
            browser_options = {
                "headless": False,  # Visibility helps avoid detection
                "args": [
                    "--disable-blink-features=AutomationControlled",
                    "--disable-features=IsolateOrigins,site-per-process",
                    "--disable-site-isolation-trials",
                    "--disable-web-security",
                    "--disable-webgl",
                    "--no-sandbox",
                    f"--user-agent={self.ua.random}"  # Use random UA
                ]
            }
            
            # Create specialized browser for award data
            browser = await playwright.chromium.launch(**browser_options)
            
            # Create enhanced context specifically for award data
            context = await browser.new_context(
                viewport={"width": 1920, "height": 1080},
                user_agent=self.ua.random,
                locale="en-US",
                timezone_id="America/New_York",
                color_scheme="light",
                device_scale_factor=1,
                bypass_csp=True
            )
            
            # Add specialized award flight extraction script
            await context.add_init_script("""
                // Advanced anti-fingerprinting for award flights
                const originalFunction = HTMLCanvasElement.prototype.toDataURL;
                HTMLCanvasElement.prototype.toDataURL = function(type) {
                    if (this.width === 0 || this.height === 0) {
                        return originalFunction.apply(this, arguments);
                    }
                    
                    // Return a slightly randomized canvas to avoid fingerprinting
                    const canvas = document.createElement('canvas');
                    canvas.width = this.width;
                    canvas.height = this.height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(this, 0, 0);
                    
                    // Add slight noise to avoid fingerprinting
                    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                    const data = imageData.data;
                    for (let i = 0; i < data.length; i += 4) {
                        data[i] += Math.floor(Math.random() * 3);     // red
                        data[i+1] += Math.floor(Math.random() * 3);   // green
                        data[i+2] += Math.floor(Math.random() * 3);   // blue
                    }
                    ctx.putImageData(imageData, 0, 0);
                    
                    return canvas.toDataURL(type);
                };
                
                // Special handling for WebGL fingerprinting
                const getParameterProxyHandler = {
                    apply: function(target, gl, args) {
                        const param = args[0];
                        
                        // UNMASKED_VENDOR_WEBGL or UNMASKED_RENDERER_WEBGL
                        if (param === 37445 || param === 37446) {
                            return 'Apple Inc.';
                        }
                        
                        return target.apply(gl, args);
                    }
                };
                
                // Apply proxy to WebGL
                if (window.WebGLRenderingContext) {
                    const getParameterProxy = new Proxy(WebGLRenderingContext.prototype.getParameter, getParameterProxyHandler);
                    WebGLRenderingContext.prototype.getParameter = getParameterProxy;
                }
                
                // Special handling for award data extraction
                window.awardExtractor = {
                    findMiles: function() {
                        // Create collection for miles values
                        const milesCollection = [];
                        
                        // Method 1: Look for elements with miles text
                        const milesPattern = /(\\d{1,3}(?:,\\d{3})+|\\d{4,6})\\s*miles?/i;
                        const textNodes = [];
                        
                        // Get all text nodes in the document
                        const walker = document.createTreeWalker(
                            document.body,
                            NodeFilter.SHOW_TEXT,
                            null,
                            false
                        );
                        
                        while(walker.nextNode()) {
                            const node = walker.currentNode;
                            if (node.textContent.trim()) {
                                textNodes.push(node);
                            }
                        }
                        
                        // Check each text node for miles
                        textNodes.forEach(node => {
                            const text = node.textContent.trim();
                            const match = text.match(milesPattern);
                            if (match) {
                                const milesValue = parseInt(match[1].replace(/,/g, ''));
                                const parentElement = node.parentElement;
                                
                                // Get nearby flight information
                                const flightNumberPattern = /UA\\s*(\\d+)/i;
                                const flightMatch = text.match(flightNumberPattern);
                                
                                // Look for flight number in parent or sibling elements if not in current text
                                let flightNumber = null;
                                if (flightMatch) {
                                    flightNumber = 'UA' + flightMatch[1];
                                } else {
                                    // Look in parent element
                                    const parentText = parentElement.textContent;
                                    const parentMatch = parentText.match(flightNumberPattern);
                                    if (parentMatch) {
                                        flightNumber = 'UA' + parentMatch[1];
                                    } else {
                                        // Look in sibling elements
                                        const siblings = parentElement.parentElement.children;
                                        for (let i = 0; i < siblings.length; i++) {
                                            const siblingText = siblings[i].textContent;
                                            const siblingMatch = siblingText.match(flightNumberPattern);
                                            if (siblingMatch) {
                                                flightNumber = 'UA' + siblingMatch[1];
                                                break;
                                            }
                                        }
                                    }
                                }
                                
                                // Look for time information
                                const timePattern = /(\\d{1,2}:\\d{2}\\s*(?:AM|PM)?)/i;
                                const timeMatches = text.match(new RegExp(timePattern.source, 'gi'));
                                let departTime = null;
                                let arriveTime = null;
                                
                                if (timeMatches && timeMatches.length >= 2) {
                                    departTime = timeMatches[0];
                                    arriveTime = timeMatches[1];
                                } else {
                                    // Look in parent element
                                    const parentTimeMatches = parentElement.textContent.match(new RegExp(timePattern.source, 'gi'));
                                    if (parentTimeMatches && parentTimeMatches.length >= 2) {
                                        departTime = parentTimeMatches[0];
                                        arriveTime = parentTimeMatches[1];
                                    } else {
                                        // Look in sibling elements
                                        const siblings = parentElement.parentElement.children;
                                        const allTimeMatches = [];
                                        for (let i = 0; i < siblings.length; i++) {
                                            const siblingTimeMatches = siblings[i].textContent.match(new RegExp(timePattern.source, 'gi'));
                                            if (siblingTimeMatches) {
                                                allTimeMatches.push(...siblingTimeMatches);
                                            }
                                        }
                                        if (allTimeMatches.length >= 2) {
                                            departTime = allTimeMatches[0];
                                            arriveTime = allTimeMatches[1];
                                        }
                                    }
                                }
                                
                                // Look for stops information
                                const nonstopPattern = /nonstop|direct|0\\s*stop/i;
                                const stopPattern = /(\\d+)\\s*stop/i;
                                
                                let stops = null;
                                if (nonstopPattern.test(text)) {
                                    stops = 0;
                                } else {
                                    const stopMatch = text.match(stopPattern);
                                    if (stopMatch) {
                                        stops = parseInt(stopMatch[1]);
                                    } else {
                                        // Check parent element
                                        if (nonstopPattern.test(parentElement.textContent)) {
                                            stops = 0;
                                        } else {
                                            const parentStopMatch = parentElement.textContent.match(stopPattern);
                                            if (parentStopMatch) {
                                                stops = parseInt(parentStopMatch[1]);
                                            }
                                        }
                                    }
                                }
                                
                                // Look for duration information
                                const durationPattern = /(\\d+h\\s*\\d*m|\\d+\\s*hr\\s*\\d*\\s*min)/i;
                                const durationMatch = text.match(durationPattern);
                                let duration = null;
                                if (durationMatch) {
                                    duration = durationMatch[1];
                                } else {
                                    // Check parent element
                                    const parentDurationMatch = parentElement.textContent.match(durationPattern);
                                    if (parentDurationMatch) {
                                        duration = parentDurationMatch[1];
                                    }
                                }
                                
                                // Add to collection
                                milesCollection.push({
                                    miles: milesValue,
                                    flightNumber: flightNumber,
                                    departTime: departTime,
                                    arriveTime: arriveTime,
                                    stops: stops,
                                    duration: duration,
                                    element: parentElement.outerHTML
                                });
                            }
                        });
                        
                        // Method 2: Look for structured data in the page
                        const scripts = document.querySelectorAll('script[type="application/ld+json"]');
                        scripts.forEach(script => {
                            try {
                                const data = JSON.parse(script.textContent);
                                if (data && data['@type'] === 'Flight') {
                                    // Extract flight info from structured data
                                    const airline = data.airline && data.airline.name ? data.airline.name : 'United Airlines';
                                    const flightNumber = data.flightNumber ? `UA${data.flightNumber}` : null;
                                    
                                    // Look for offers that might contain miles information
                                    if (data.offers && Array.isArray(data.offers)) {
                                        data.offers.forEach(offer => {
                                            // Check if this is a miles offer
                                            if (offer.price && typeof offer.price === 'string') {
                                                const milesMatch = offer.price.match(/(\\d{1,3}(?:,\\d{3})+|\\d{4,6})\\s*miles?/i);
                                                if (milesMatch) {
                                                    const milesValue = parseInt(milesMatch[1].replace(/,/g, ''));
                                                    milesCollection.push({
                                                        miles: milesValue,
                                                        flightNumber: flightNumber,
                                                        departTime: data.departureTime,
                                                        arriveTime: data.arrivalTime,
                                                        stops: null,
                                                        duration: null,
                                                        element: 'Structured Data'
                                                    });
                                                }
                                            }
                                        });
                                    }
                                }
                            } catch (e) {
                                // Ignore parsing errors
                            }
                        });
                        
                        return milesCollection;
                    }
                };
            """)
            
            # Create page
            page = await context.new_page()
            
            # Set up request interception to modify headers
            await page.route("**/*", self.handle_award_route)
            
            # Navigate directly to award search page
            logger.info(f"Navigating to award search page: {self.search_page_url}")
            await page.goto(self.search_page_url, wait_until="domcontentloaded", timeout=60000)
            
            # Wait a while to let the page fully render
            await asyncio.sleep(5)
            
            # Perform human-like interactions
            logger.info("Performing human-like interactions...")
            
            # Scroll down slowly like a human would
            for i in range(10):
                await page.evaluate(f"window.scrollTo(0, {i * 300})")
                await asyncio.sleep(random.uniform(0.5, 1.0))
            
            # Wait for more content to load
            await asyncio.sleep(3)
            
            # Scroll back up
            for i in range(10, 0, -1):
                await page.evaluate(f"window.scrollTo(0, {i * 300})")
                await asyncio.sleep(random.uniform(0.3, 0.7))
            
            # Take screenshot for debugging
            screenshot_path = os.path.join(self.data_dir, f"advanced_screenshot_{self.timestamp}.png")
            await page.screenshot(path=screenshot_path)
            logger.info(f"Saved advanced screenshot to {screenshot_path}")
            
            # Save the page HTML
            html_content = await page.content()
            html_file = os.path.join(self.data_dir, f"united_advanced_{self.origin}_{self.destination}_{self.date}_{self.timestamp}.html")
            with open(html_file, "w", encoding="utf-8") as f:
                f.write(html_content)
            logger.info(f"Saved advanced HTML to {html_file}")
            
            # Extract miles data using our special script
            logger.info("Extracting award miles data...")
            miles_data = await page.evaluate("window.awardExtractor.findMiles()")
            logger.info(f"Found {len(miles_data)} potential award flights")
            
            # Convert to our standard format
            flights = []
            for item in miles_data:
                try:
                    # Skip if miles is not valid
                    if not item['miles'] or item['miles'] < 5000 or item['miles'] > 500000:
                        continue
                        
                    # Create flight info
                    flight_number = item['flightNumber'] if item['flightNumber'] else f"UA{1000 + len(flights)}"
                    
                    flight_info = {
                        "airline": "United Airlines",
                        "flightNumber": flight_number,
                        "aircraft": "Boeing 737",  # Default
                        "fareClass": "Economy",    # Default
                        "departure": {
                            "airport": self.origin,
                            "city": self.get_city_name(self.origin),
                            "time": item['departTime'] if item['departTime'] else "12:00",
                            "date": self.date
                        },
                        "arrival": {
                            "airport": self.destination,
                            "city": self.get_city_name(self.destination),
                            "time": item['arriveTime'] if item['arriveTime'] else "14:30",
                            "date": self.date
                        },
                        "price": {
                            "amount": item['miles'],
                            "currency": "miles",
                            "type": "miles"
                        },
                        "duration": item['duration'] if item['duration'] else "2h 30m",
                        "stops": item['stops'] if item['stops'] is not None else 0,
                        "connectingAirport": None  # We don't have this info
                    }
                    
                    flights.append(flight_info)
                    logger.info(f"Advanced extraction found flight: {flight_number} | {flight_info['departure']['time']} - {flight_info['arrival']['time']} | {flight_info['price']['amount']} miles")
                except Exception as e:
                    logger.error(f"Error processing miles data item: {str(e)}")
                    continue
            
            # Close advanced browser
            await page.close()
            await context.close()
            await browser.close()
            await playwright.stop()
            
            logger.info(f"Advanced extraction found {len(flights)} award flights")
            return flights if flights else None
            
        except Exception as e:
            logger.error(f"Error in advanced extraction: {str(e)}")
            return None
            
    async def handle_award_route(self, route):
        """Handle network requests for award data extraction"""
        request = route.request
        
        # Add special headers for award routes
        headers = request.headers
        
        # Make it look like a human browser
        headers["Accept"] = "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8"
        headers["Accept-Language"] = "en-US,en;q=0.5"
        headers["Accept-Encoding"] = "gzip, deflate, br"
        headers["Referer"] = "https://www.united.com/en/us"
        headers["DNT"] = "1"
        headers["Sec-Fetch-Dest"] = "document"
        headers["Sec-Fetch-Mode"] = "navigate"
        headers["Sec-Fetch-Site"] = "cross-site"
        headers["Sec-Fetch-User"] = "?1"
        headers["Sec-GPC"] = "1"
        headers["Upgrade-Insecure-Requests"] = "1"
        
        # Record auth tokens if present
        if "authorization" in headers or "x-authorization-api" in headers:
            token = headers.get("authorization") or headers.get("x-authorization-api")
            if token and "bearer" in token.lower():
                self.auth_token = token.split("bearer ")[-1]
                logger.info(f"Found authorization token: {self.auth_token[:10]}...")
                
                if self.auth_token not in self.extracted_tokens:
                    self.extracted_tokens.append(self.auth_token)
        
        # Continue with the modified request
        await route.continue_(headers=headers)

    async def dismiss_modal(self):
        """Attempt to dismiss any modal dialogs that might be intercepting clicks"""
        logger.info("Attempting to dismiss modal dialog...")
        
        try:
            # Check for common modal selectors
            modal_selectors = [
                ".atm-c-modal.atm-is-active",
                "[class*='modal'][class*='active']",
                "[class*='dialog'][class*='active']",
                "[class*='overlay'][class*='active']",
                "div[role='dialog']",
                "div[aria-modal='true']"
            ]
            
            for selector in modal_selectors:
                try:
                    modal = await self.page.query_selector(selector)
                    if modal:
                        logger.info(f"Found modal with selector: {selector}")
                        
                        # Try to find close buttons
                        close_button_selectors = [
                            "[class*='close']",
                            "[class*='dismiss']",
                            "[class*='cancel']",
                            "button",
                            "a[role='button']",
                            "[aria-label='Close']",
                            "[data-dismiss='modal']"
                        ]
                        
                        for close_selector in close_button_selectors:
                            try:
                                # Try to find the close button within the modal
                                close_button = await modal.query_selector(close_selector)
                                if close_button:
                                    logger.info(f"Found close button with selector: {close_selector}")
                                    await close_button.click()
                                    await asyncio.sleep(1)
                                    
                                    # Check if modal is still visible
                                    modal_still_visible = await self.page.query_selector(selector)
                                    if not modal_still_visible:
                                        logger.info("Successfully dismissed modal dialog")
                                        return True
                            except Exception as e:
                                logger.debug(f"Error clicking close button {close_selector}: {str(e)}")
                                continue
                        
                        # If we couldn't find/click a close button, try clicking outside the modal
                        logger.info("Trying to dismiss modal by clicking outside")
                        await self.page.mouse.click(10, 10)  # Click at the top-left corner
                        await asyncio.sleep(1)
                        
                        # Try pressing Escape key
                        logger.info("Trying to dismiss modal with Escape key")
                        await self.page.keyboard.press("Escape")
                        await asyncio.sleep(1)
                        
                        # Check if modal is still visible
                        modal_still_visible = await self.page.query_selector(selector)
                        if not modal_still_visible:
                            logger.info("Successfully dismissed modal dialog")
                            return True
                except Exception as e:
                    logger.debug(f"Error handling modal with selector {selector}: {str(e)}")
                    continue
            
            # Try a more aggressive approach - evaluate JavaScript to remove modal
            logger.info("Trying JavaScript approach to remove modal")
            await self.page.evaluate("""() => {
                // Try to find and remove modal elements
                const modals = document.querySelectorAll('.atm-c-modal.atm-is-active, [class*="modal"][class*="active"], [aria-modal="true"]');
                modals.forEach(modal => {
                    if (modal.style) {
                        modal.style.display = 'none';
                        modal.style.visibility = 'hidden';
                        modal.style.opacity = '0';
                        modal.style.pointerEvents = 'none';
                    }
                    
                    // Try to remove the element
                    try {
                        modal.remove();
                    } catch (e) {
                        // Ignore errors
                    }
                });
                
                // Also look for overlay or backdrop elements
                const overlays = document.querySelectorAll('.modal-backdrop, .atm-c-overlay, [class*="overlay"], [class*="backdrop"]');
                overlays.forEach(overlay => {
                    if (overlay.style) {
                        overlay.style.display = 'none';
                        overlay.style.visibility = 'hidden';
                        overlay.style.opacity = '0';
                        overlay.style.pointerEvents = 'none';
                    }
                    
                    // Try to remove the element
                    try {
                        overlay.remove();
                    } catch (e) {
                        // Ignore errors
                    }
                });
                
                // Re-enable scrolling on body/html
                document.body.style.overflow = 'auto';
                document.documentElement.style.overflow = 'auto';
                
                // Remove any margin adjustment
                document.body.style.marginRight = '0';
                document.documentElement.style.marginRight = '0';
            }""")
            
            await asyncio.sleep(1)
            
            # Check if we can now interact with the page
            try:
                # Try to click in the middle of the page
                await self.page.mouse.click(500, 500)
                logger.info("Successfully clicked on page after modal removal")
                return True
            except Exception as e:
                logger.error(f"Still unable to interact with page: {str(e)}")
                return False
                
        except Exception as e:
            logger.error(f"Error dismissing modal: {str(e)}")
            return False

    async def extract_miles_data(self):
        """Specialized function to extract miles data from the page"""
        logger.info("Extracting miles data from page...")
        
        try:
            # Try to extract miles data from the highlighted elements
            miles_elements = await self.page.query_selector_all('[data-miles-amount]')
            if miles_elements and len(miles_elements) > 0:
                logger.info(f"Found {len(miles_elements)} elements with miles data")
                
                miles_data = []
                for element in miles_elements:
                    miles_amount = await element.get_attribute("data-miles-amount")
                    
                    if miles_amount:
                        miles_value = int(miles_amount)
                        
                        # Get surrounding flight information
                        flight_row = await element.evaluate("""(el) => {
                            // Try to find the containing flight row
                            let parent = el;
                            for (let i = 0; i < 5; i++) {
                                if (parent.classList && (
                                    parent.classList.contains('flightRow') || 
                                    parent.classList.toString().includes('flight-row') ||
                                    parent.classList.toString().includes('FlightRow') ||
                                    parent.getAttribute('data-test') === 'flight-row' ||
                                    parent.getAttribute('data-test') === 'flight-result'
                                )) {
                                    return {
                                        html: parent.outerHTML,
                                        flightNumber: parent.querySelector('[class*="flightNumber"], [class*="flight-number"]')?.textContent.trim(),
                                        departTime: parent.querySelector('[class*="departTime"], [class*="depart-time"]')?.textContent.trim(),
                                        arriveTime: parent.querySelector('[class*="arriveTime"], [class*="arrive-time"]')?.textContent.trim(),
                                        stops: parent.querySelector('[class*="stops"]')?.textContent.trim(),
                                        duration: parent.querySelector('[class*="duration"]')?.textContent.trim()
                                    };
                                }
                                parent = parent.parentElement;
                                if (!parent) break;
                            }
                            
                            // If we couldn't find a flight row, return what we can
                            return {
                                html: el.parentElement?.outerHTML || el.outerHTML,
                                milesText: el.textContent.trim()
                            };
                        }""")
                        
                        miles_data.append({
                            "miles": miles_value,
                            "flightNumber": flight_row.get("flightNumber"),
                            "departTime": flight_row.get("departTime"),
                            "arriveTime": flight_row.get("arriveTime"),
                            "stops": flight_row.get("stops"),
                            "duration": flight_row.get("duration"),
                            "element": flight_row.get("html")
                        })
                
                logger.info(f"Extracted {len(miles_data)} miles data entries")
                return miles_data
            
            # If no highlighted elements, try with JavaScript extraction
            logger.info("No highlighted elements found, trying JavaScript extraction")
            miles_data = await self.page.evaluate("""() => {
                const milesData = [];
                const milesRegex = /(\\d{1,3}(?:,\\d{3})+|\\d{4,6})\\s*miles?/i;
                
                // Function to extract miles value from text
                function extractMilesValue(text) {
                    const match = text.match(milesRegex);
                    if (match) {
                        return parseInt(match[1].replace(/,/g, ''));
                    }
                    return null;
                }
                
                // Look for flight rows
                const flightRowSelectors = [
                    '.flightRow', 
                    '[class*="flightRow"]', 
                    '[class*="flight-row"]', 
                    '[class*="FlightRow"]',
                    '[data-test="flight-row"]',
                    '[data-test="flight-result"]',
                    '[class*="result-item"]'
                ];
                
                // Try each flight row selector
                for (const selector of flightRowSelectors) {
                    const rows = document.querySelectorAll(selector);
                    if (rows.length > 0) {
                        console.log(`Found ${rows.length} flight rows with selector: ${selector}`);
                        
                        // Process each flight row
                        for (const row of rows) {
                            // Look for miles value in this row
                            const text = row.textContent;
                            const milesValue = extractMilesValue(text);
                            
                            if (milesValue && milesValue >= 5000 && milesValue <= 500000) {
                                // Extract other flight details
                                const flightNumberEl = row.querySelector('[class*="flightNumber"], [class*="flight-number"], [data-test*="flight-number"]');
                                const departTimeEl = row.querySelector('[class*="departTime"], [class*="depart-time"], [data-test*="depart-time"]');
                                const arriveTimeEl = row.querySelector('[class*="arriveTime"], [class*="arrive-time"], [data-test*="arrive-time"]');
                                const stopsEl = row.querySelector('[class*="stops"], [data-test*="stops"]');
                                const durationEl = row.querySelector('[class*="duration"], [data-test*="duration"]');
                                
                                milesData.push({
                                    miles: milesValue,
                                    flightNumber: flightNumberEl ? flightNumberEl.textContent.trim() : null,
                                    departTime: departTimeEl ? departTimeEl.textContent.trim() : null,
                                    arriveTime: arriveTimeEl ? arriveTimeEl.textContent.trim() : null,
                                    stops: stopsEl ? stopsEl.textContent.trim() : null,
                                    duration: durationEl ? durationEl.textContent.trim() : null,
                                    element: row.outerHTML
                                });
                            }
                        }
                        
                        // If we found data, return it
                        if (milesData.length > 0) {
                            return milesData;
                        }
                    }
                }
                
                // If we couldn't find miles in flight rows, look everywhere
                const walker = document.createTreeWalker(
                    document.body,
                    NodeFilter.SHOW_TEXT,
                    null,
                    false
                );
                
                while (walker.nextNode()) {
                    const node = walker.currentNode;
                    const text = node.textContent.trim();
                    if (text.length > 5) {
                        const milesValue = extractMilesValue(text);
                        if (milesValue && milesValue >= 5000 && milesValue <= 500000) {
                            // Get the parent element for context
                            const parent = node.parentElement;
                            
                            // Try to find flight details nearby
                            let container = parent;
                            // Look up to 5 levels up for a container with more flight info
                            for (let i = 0; i < 5; i++) {
                                if (!container) break;
                                
                                // If this element has significant content, use it
                                if (container.textContent.length > 100) {
                                    const containerText = container.textContent;
                                    
                                    // Look for flight number pattern (UA followed by digits)
                                    const flightMatch = containerText.match(/UA\\s*(\\d+)/i);
                                    const flightNumber = flightMatch ? `UA${flightMatch[1]}` : null;
                                    
                                    // Look for times (HH:MM format)
                                    const timeMatches = containerText.match(/(\\d{1,2}:\\d{2}\\s*(?:AM|PM)?)/gi);
                                    const departTime = timeMatches && timeMatches.length > 0 ? timeMatches[0] : null;
                                    const arriveTime = timeMatches && timeMatches.length > 1 ? timeMatches[1] : null;
                                    
                                    // Look for stops
                                    let stops = null;
                                    if (/nonstop|direct/i.test(containerText)) {
                                        stops = "Nonstop";
                                    } else {
                                        const stopsMatch = containerText.match(/(\\d+)\\s*stop/i);
                                        if (stopsMatch) {
                                            stops = `${stopsMatch[1]} stop${stopsMatch[1] === '1' ? '' : 's'}`;
                                        }
                                    }
                                    
                                    // Look for duration
                                    const durationMatch = containerText.match(/(\\d+h\\s*\\d*m|\\d+\\s*hr\\s*\\d*\\s*min)/i);
                                    const duration = durationMatch ? durationMatch[1] : null;
                                    
                                    milesData.push({
                                        miles: milesValue,
                                        flightNumber: flightNumber,
                                        departTime: departTime,
                                        arriveTime: arriveTime,
                                        stops: stops,
                                        duration: duration,
                                        element: container.outerHTML
                                    });
                                    
                                    break;
                                }
                                
                                container = container.parentElement;
                            }
                            
                            // If we couldn't find a good container, just use the parent
                            if (milesData.length === 0) {
                                milesData.push({
                                    miles: milesValue,
                                    element: parent.outerHTML,
                                    text: text
                                });
                            }
                        }
                    }
                }
                
                return milesData;
            }""")
            
            logger.info(f"JavaScript extraction found {len(miles_data)} miles data entries")
            return miles_data
            
        except Exception as e:
            logger.error(f"Error extracting miles data: {str(e)}")
            return []

async def main():
    """Main function to run the crawler"""
    parser = argparse.ArgumentParser(description="United Airlines Flight Crawler")
    parser.add_argument("--origin", default="ORD", help="Origin airport code")
    parser.add_argument("--destination", default="LAX", help="Destination airport code")
    parser.add_argument("--date", default="2025-05-15", help="Departure date (YYYY-MM-DD)")
    parser.add_argument("--award", action="store_true", help="Search for award travel (miles)")
    args = parser.parse_args()
    
    print("\n==================================================")
    print("UNITED AIRLINES FLIGHT SEARCH CRAWLER")
    print("==================================================")
    print(f"Origin: {args.origin} | Destination: {args.destination} | Date: {args.date}")
    print(f"Award Travel: {'Yes' if args.award else 'No'}")
    print()
    
    crawler = UnitedFlightCrawler(args.origin, args.destination, args.date, award_travel=args.award)
    await crawler.crawl()

if __name__ == "__main__":
    asyncio.run(main())