# Alaska Airlines Award Flight Scraper

A Python tool for extracting award flight data from Alaska Airlines with advanced anti-detection measures and multi-proxy support.

## Features

- Implements stealth WebDriver configurations to avoid bot detection
- Randomized user-agent rotation and window sizes
- Realistic human-like interactions with randomized timing
- Robust error handling and bot detection recognition
- Multi-proxy support with automatic fallback
- Detailed logging for debugging and monitoring
- Modular design with a class-based approach

## Requirements

- Python 3.8+
- Chrome browser
- ChromeDriver compatible with your Chrome version

## Installation

1. Clone this repository
2. Install dependencies:
   ```
   pip install -r requirements.txt
   ```
3. If not using webdriver-manager, download the appropriate ChromeDriver for your Chrome version and set the path in the script

## Usage

### Basic Usage

Run the script with default parameters:
```
python alaska_award_scraper_advanced.py
```

### Advanced Usage with Command Line Arguments

The enhanced scraper supports command-line arguments for flexible configuration:

```
python alaska_award_scraper_advanced.py --origin SEA --destination JFK --departure 2024-07-15 --proxy 10.0.0.1:8080:username:password
```

#### Available Command Line Options

- `--origin`: Origin airport code (default: SEA)
- `--destination`: Destination airport code (default: JFK)
- `--departure`: Departure date in YYYY-MM-DD format (defaults to 10 days from now)
- `--return`: Return date in YYYY-MM-DD format (leave empty for one-way trips)
- `--data-dir`: Directory to store extracted data (default: alaska_data)
- `--proxy`: Single proxy in format host:port:username:password (or host:port for unauthenticated)
- `--proxy-file`: Path to JSON file containing a list of proxies to try
- `--max-retries`: Maximum retries per proxy (default: 3)

### Using Multiple Proxies

The scraper can test multiple proxies and automatically fall back if one fails. This significantly improves reliability.

#### Option 1: Specify a Proxy File

Create a JSON file containing a list of proxies:

```json
[
  {
    "host": "38.154.227.167", 
    "port": "5868", 
    "username": "your_username", 
    "password": "your_password"
  },
  {
    "host": "38.153.152.244", 
    "port": "9594", 
    "username": "your_username", 
    "password": "your_password"
  }
]
```

Then run the scraper with:

```
python alaska_award_scraper_advanced.py --proxy-file proxies.json
```

#### Option 2: Specify a Single Proxy

For quick testing with a single proxy:

```
python alaska_award_scraper_advanced.py --proxy 38.154.227.167:5868:username:password
```

Or for unauthenticated proxies:

```
python alaska_award_scraper_advanced.py --proxy 38.154.227.167:5868
```

### Example Code for Programmatic Use

```python
from alaska_award_scraper_advanced import AlaskaAwardScraperAdvanced
from datetime import datetime, timedelta

# Define proxies
proxies = [
    {
        "host": "38.154.227.167", 
        "port": "5868", 
        "username": "your_username", 
        "password": "your_password"
    },
    {
        "host": "38.153.152.244", 
        "port": "9594", 
        "username": "your_username", 
        "password": "your_password"
    }
]

# Define search parameters
origin = "SEA"
destination = "JFK"
departure_date = datetime.now() + timedelta(days=30)
return_date = datetime.now() + timedelta(days=37)  # None for one-way

# Test multiple proxies and extract flight data
flights = AlaskaAwardScraperAdvanced.test_multiple_proxies(
    proxies=proxies,
    origin=origin,
    destination=destination,
    departure_date=departure_date,
    return_date=return_date,
    data_dir="alaska_data",
    max_retries=2
)

# Process extracted flights
if flights:
    print(f"Successfully extracted {len(flights)} flights!")
    for flight in flights[:3]:
        print(f"Flight {flight.get('flight_number')}: {flight.get('points')} points")
else:
    print("Failed to extract any flights")
```

## Anti-Detection Features

This scraper implements several techniques to reduce the likelihood of bot detection:

1. **Stealth WebDriver Configuration:**
   - Uses undetected-chromedriver to bypass Cloudflare and other anti-bot systems
   - Disables WebDriver flags and automation indicators
   - Rotates user agents randomly
   - Uses realistic window sizes
   - Adds various Chrome options to appear more like a real browser

2. **Proxy Support:**
   - Supports authenticated proxies via Chrome extensions
   - Multiple proxy fallback for improved reliability
   - Comprehensive proxy testing and monitoring

3. **Realistic Timing:**
   - Random delays between actions
   - Human-like typing with variable speeds
   - Proper waiting for elements using WebDriverWait

4. **Enhanced Bot Detection:**
   - Recognizes common CAPTCHA and bot detection patterns
   - Detects JavaScript challenges and CloudFlare protection
   - Extracts and logs context around detection triggers
   - Captures screenshots and page elements for analysis

5. **Error Handling:**
   - Comprehensive error detection and recovery
   - Intelligent retry mechanisms
   - Detailed logging and troubleshooting information

## Data Collection

The scraper collects and stores:

1. **Flight Data:**
   - Flight numbers, times, and durations
   - Award points required for each flight
   - Cabin class and other details
   - All saved in structured JSON format

2. **Troubleshooting Data:**
   - Screenshots at various stages of the scraping process
   - Page source files for detailed analysis
   - Error logs and execution traces
   - Bot detection indicators

## Important Notes

- Web scraping may be against a website's terms of service. Use responsibly and for educational purposes only.
- The script may need adjustments over time as Alaska Airlines' website changes.
- For best results, use residential proxies rather than datacenter proxies.

## Troubleshooting

### Common Issues

1. **Website Structure Changes**
   - The Alaska Airlines website may change its structure periodically, which can break existing selectors
   - Check the `initial_page_source.html`, `booking_page_source.html`, and `results_page_source.html` files to understand the current structure
   - Update the XPath selectors in `navigate_to_search_page()` and `search_flights()` methods accordingly

2. **Bot Detection**
   - If you're consistently getting bot detection errors, try the following:
     - Use different proxy servers (rotating proxies work best)
     - Run in non-headless mode (set `headless=False`)
     - Use the advanced version with undetected_chromedriver
     - Increase the random delay times in `_random_sleep()` method
     - Run the script during off-peak hours
     - Try using a residential proxy instead of a data center proxy

3. **CAPTCHA Challenges**
   - If you encounter CAPTCHA challenges, the script will save a screenshot
   - Consider implementing a CAPTCHA solving service or manually solve it by temporarily taking control of the browser

4. **Element Not Found Errors**
   - Look for error messages like "Could not find element with selector..."
   - Check the saved screenshots and page source files to identify the correct selectors
   - Update the XPath expressions in the script to match the current structure

5. **WebDriver Issues**
   - Make sure your Chrome and ChromeDriver versions are compatible
   - If using undetected_chromedriver, ensure it's properly installed and configured
   - Try clearing the Chrome user data directory and cookies before running the script

6. **Proxy Authentication Issues**
   - Authenticated proxies can be tricky with Selenium
   - For undetected_chromedriver, you may need a plugin-based approach for authenticated proxies
   - Use the included proxy testers to verify your proxies work with Alaska Airlines

### Debugging Tips

1. **Check the Logs**
   - The scraper creates detailed logs in `alaska_scraper_advanced.log`
   - Look for WARNING and ERROR level messages to diagnose issues

2. **Review Screenshots**
   - Many screenshots are taken at key points in the scraping process
   - Check these to understand what the scraper is seeing at different stages

3. **Analyze Page Sources**
   - Examine the saved HTML files to understand the page structure
   - Use browser developer tools to verify XPath expressions on the saved HTML

4. **Test in Manual Mode**
   - If you encounter issues, try manually executing the steps in a browser
   - Compare the manual process with the automated one to identify differences

## License

This project is for educational purposes only. Use responsibly and in accordance with Alaska Airlines' terms of service.

## Troubleshooting

### Common Issues

1. **Website Structure Changes**
   - The Alaska Airlines website may change its structure periodically, which can break existing selectors
   - Check the `initial_page_source.html`, `booking_page_source.html`, and `results_page_source.html` files to understand the current structure
   - Update the XPath selectors in `navigate_to_search_page()` and `search_flights()` methods accordingly

2. **Bot Detection**
   - If you're consistently getting bot detection errors, try the following:
     - Use different proxy servers (rotating proxies work best)
     - Run in non-headless mode (set `headless=False`)
     - Use the advanced version with undetected_chromedriver
     - Increase the random delay times in `_random_sleep()` method
     - Run the script during off-peak hours
     - Try using a residential proxy instead of a data center proxy

3. **CAPTCHA Challenges**
   - If you encounter CAPTCHA challenges, the script will save a screenshot
   - Consider implementing a CAPTCHA solving service or manually solve it by temporarily taking control of the browser

4. **Element Not Found Errors**
   - Look for error messages like "Could not find element with selector..."
   - Check the saved screenshots and page source files to identify the correct selectors
   - Update the XPath expressions in the script to match the current structure

5. **WebDriver Issues**
   - Make sure your Chrome and ChromeDriver versions are compatible
   - If using undetected_chromedriver, ensure it's properly installed and configured
   - Try clearing the Chrome user data directory and cookies before running the script

6. **Proxy Authentication Issues**
   - Authenticated proxies can be tricky with Selenium
   - For undetected_chromedriver, you may need a plugin-based approach for authenticated proxies
   - Use the included proxy testers to verify your proxies work with Alaska Airlines

### Debugging Tips

1. **Check the Logs**
   - The scraper creates detailed logs in `alaska_scraper_advanced.log`
   - Look for WARNING and ERROR level messages to diagnose issues

2. **Review Screenshots**
   - Many screenshots are taken at key points in the scraping process
   - Check these to understand what the scraper is seeing at different stages

3. **Analyze Page Sources**
   - Examine the saved HTML files to understand the page structure
   - Use browser developer tools to verify XPath expressions on the saved HTML

4. **Test in Manual Mode**
   - If you encounter issues, try manually executing the steps in a browser
   - Compare the manual process with the automated one to identify differences

## Using Proxies

This scraper supports both regular proxies and authenticated proxies. To use proxies:

### Testing Proxies

Several proxy testing scripts are included to help you determine which proxies work with Alaska Airlines:

1. **Basic Proxy Tester:**
   ```
   python proxy_tester.py
   ```
   Tests each proxy against the Alaska Airlines website and reports success or failure.

2. **Enhanced Proxy Tester:**
   ```
   python proxy_tester_enhanced.py
   ```
   Uses additional stealth techniques like:
   - Warm-up navigation to common sites
   - Human-like scrolling and interaction
   - Multiple attempts with different parameters
   - Detailed logs and screenshots for analysis

3. **Standard Proxy Tester (for individual proxies):**
   ```
   python test_proxy_standard.py IP:PORT:USERNAME:PASSWORD
   ```
   Tests a single proxy using the standard scraper and provides detailed output.

4. **Authenticated Proxy Extension Tester:**
   ```
   python test_proxy_auth.py IP:PORT:USERNAME:PASSWORD
   ```
   Tests a single proxy using a Chrome extension for authentication, which is more reliable
   for authenticated proxies.

5. **Batch Proxy Tester:**
   ```
   python batch_test_proxies.py [--max-workers 3]
   ```
   Tests multiple proxies in parallel and generates a summary report.
   Optional parameters:
   - `--proxies-file FILE`: File containing proxies (one per line)
   - `--url URL`: URL to test (default: Alaska Airlines homepage)
   - `--max-workers N`: Maximum number of parallel tests (default: 3)

6. **Install Required Dependencies:**
   ```
   python install_requirements.py
   ```
   Ensures all necessary packages are installed for the proxy testers.

### Proxy Format

Proxies should be in the format: `IP:PORT:USERNAME:PASSWORD`

Example usage in the scraper:
```python
proxy = {
    'host': '38.154.227.167',
    'port': '5868',
    'username': 'zzjbudsv',
    'password': 'vjxvvsqsa0iu'
}

scraper = AlaskaAwardScraperAdvanced(headless=False, proxy=proxy)
```

### Tips for Using Proxies

1. **Residential Proxies**: Residential proxies work better than data center proxies for avoiding detection
2. **Rotation**: Use different proxies for different requests to avoid IP bans
3. **Geographic Targeting**: Try using US-based proxies for best results with Alaska Airlines
4. **Authentication Methods**: For authenticated proxies, the Chrome extension approach (test_proxy_auth.py) tends to work better than the standard method
5. **Testing**: Always test proxies before using them in production

## Integration with Frontend

To integrate this scraper with a frontend application:

1. Modify the `extract_flight_data()` method to return the data in your desired format
2. Create an API endpoint that triggers the scraping process
3. Implement a queue system for handling multiple scraping requests
4. Cache results to minimize unnecessary scraping

## Rollback Instructions

If you encounter issues with the new airport search implementation:

1. Stop the development server
2. Run rollback command:
   ```bash
   npm run rollback:airport-search
   ```
3. Restart the development server:
   ```bash
   npm run dev
   ```

The application will revert to the previous working implementation.
