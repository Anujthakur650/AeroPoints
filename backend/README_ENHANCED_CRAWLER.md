# Enhanced United Flight Crawler

A robust crawler for extracting real-time flight data from United Airlines with advanced anti-detection techniques.

## Features

- **Residential Proxies**: Uses residential proxies to avoid IP-based blocking
- **Browser Profile Persistence**: Maintains cookies and browser fingerprints across sessions
- **CAPTCHA Solving**: Integrates with Anti-Captcha service to bypass CAPTCHA challenges
- **Human Behavior Simulation**: Mimics realistic user interactions
- **Multiple Extraction Methods**: Tries various approaches to extract flight data

## Setup

### 1. Install Dependencies

```bash
pip install -r requirements_enhanced.txt
```

### 2. Environment Configuration

Create a `.env` file based on the `.env.example` template:

```bash
cp .env.example .env
```

Edit the `.env` file to add your credentials:

```
# Residential Proxy Settings
PROXY_API_KEY=your_proxy_provider_api_key
PROXY_USERNAME=your_proxy_username
PROXY_PASSWORD=your_proxy_password

# Anti-CAPTCHA Service
ANTICAPTCHA_KEY=your_anticaptcha_api_key

# Crawler Settings
USE_RESIDENTIAL_PROXIES=True
USE_CAPTCHA_SOLVER=True
USE_BROWSER_PROFILES=True
HEADLESS_MODE=False
```

### 3. Directory Structure

Ensure these directories exist (they will be created automatically on first run):

```
/data             # For flight data output
/logs             # For log files
/browser_profiles # For browser profiles
/extensions       # For browser extensions
```

## Usage

### Running the Enhanced Crawler Directly

```bash
python run_enhanced_crawler.py --origin SFO --destination JFK --date 2025-05-15 --award --proxies --captcha --profiles
```

Command-line options:
- `--origin`: Origin airport code (e.g., "SFO")
- `--destination`: Destination airport code (e.g., "JFK")
- `--date`: Departure date in YYYY-MM-DD format
- `--award`: Enable award travel search (miles)
- `--proxies`: Use residential proxies
- `--captcha`: Use CAPTCHA solving service
- `--profiles`: Use browser profiles
- `--headless`: Run in headless mode (no visible browser)
- `--debug`: Enable extra debug output

### Using the API Integration

Start the API server and it will automatically use the enhanced crawler:

```bash
python run_api.py
```

Then make a request to trigger a crawl:

```bash
curl -X POST "http://localhost:8000/api/crawl?origin=SFO&destination=JFK&date=2025-05-15&airline=united&cabin_class=economy"
```

## Components

The enhanced crawler consists of several modules:

1. **enhanced_crawler.py**: The main crawler with anti-detection techniques
2. **proxy_manager.py**: Manages residential proxies
3. **browser_profile_manager.py**: Manages persistent browser profiles
4. **run_enhanced_crawler.py**: Command-line interface
5. **enhanced_api_integration.py**: Integration with the API server

## Troubleshooting

### Residential Proxies

If you encounter issues with residential proxies:

1. Check your proxy provider credentials
2. Try different proxy providers (update in proxy_manager.py)
3. Use `python proxy_manager.py` to test proxy functionality

### CAPTCHA Solving

If CAPTCHA solving fails:

1. Verify your Anti-Captcha API key
2. Check the balance in your Anti-Captcha account
3. Look for CAPTCHA screenshots in the data directory

### Browser Profiles

If browser profiles cause issues:

1. Delete existing profiles: `rm -rf browser_profiles/*`
2. Run `python browser_profile_manager.py` to test profile creation

## Logs

Check the log files in the `logs` directory for detailed information about crawler execution:

- `logs/enhanced_crawler.log`: Main crawler logs
- `logs/proxy_manager.log`: Proxy-related logs
- `logs/browser_profile.log`: Browser profile logs
- `logs/crawler_YYYYMMDD_HHMMSS.log`: Session-specific logs

## Best Practices

1. **Run in Visible Mode**: For best results, don't use the `--headless` flag during initial setup
2. **Use All Features**: Enable proxies, CAPTCHA solving, and browser profiles for best results
3. **Respect Rate Limits**: Avoid making too many requests in a short period
4. **Check Logs**: Always check the logs for detailed information
5. **Update User-Agents**: Keep the user agent strings in enhanced_crawler.py up to date 