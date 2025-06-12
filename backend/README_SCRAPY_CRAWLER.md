# Award Flight Scrapy Crawler

A sophisticated crawler for extracting real-time award flight data from airline websites.

## Overview

This implementation combines the power of Scrapy, Playwright, and advanced anti-bot measures to reliably extract award flight data from airline websites. The crawler employs multiple strategies to navigate websites, submit forms, and extract data while avoiding detection.

## Features

- **Scrapy Framework**: Robust crawling infrastructure with built-in concurrency and middleware support
- **Playwright Integration**: Full browser automation with JavaScript execution
- **Anti-Bot Measures**: Advanced techniques to avoid detection
  - Browser fingerprint randomization
  - Human-like behavior simulation
  - Residential proxy support
  - Request throttling and delays
- **CAPTCHA Solving**: Integration with 2captcha service for automated CAPTCHA solving
- **Multi-Approach Strategy**: Sequential fallback techniques when the primary approach fails
- **Comprehensive Logging**: Detailed logs for troubleshooting and analysis
- **Flexible Output**: Structured data export in JSON format
- **Command-Line Interface**: Easy to use with various configuration options

## Installation

1. Create a Python virtual environment:
   ```
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. Install the requirements:
   ```
   pip install -r requirements_scrapy_crawler.txt
   ```

3. Install Playwright browsers:
   ```
   playwright install
   ```

## Usage

Run the crawler using the provided runner script:

```bash
python run_scrapy_crawler.py --airline alaska --origin SEA --destination JFK --date 2025-04-23
```

### Required Arguments

- `--airline`: Airline to crawl (choices: `alaska`, `united`, `american`, `delta`)
- `--origin`: Origin airport code (e.g., `SEA`)
- `--destination`: Destination airport code (e.g., `JFK`)
- `--date`: Departure date in YYYY-MM-DD format (e.g., `2025-04-23`)

### Optional Arguments

- `--cabin-class`: Cabin class (choices: `economy`, `business`, `first`, default: `economy`)
- `--passengers`: Number of passengers (default: `1`)
- `--debug`: Enable debug mode
- `--headless`: Run in headless mode
- `--output`: Output file path
- `--timeout`: Timeout in seconds (default: `300`)
- `--proxy`: Proxy server to use (e.g., `http://user:pass@hostname:port`)
- `--use-residential-proxies`: Use residential proxies from `proxies.txt`
- `--use-captcha-solver`: Use CAPTCHA solver (requires `TWOCAPTCHA_API_KEY` env variable)

## Examples

### Basic Award Flight Search

```bash
python run_scrapy_crawler.py --airline alaska --origin SEA --destination JFK --date 2025-04-23
```

### Search with Specific Cabin Class

```bash
python run_scrapy_crawler.py --airline alaska --origin SEA --destination JFK --date 2025-04-23 --cabin-class business
```

### Debug Mode with Extended Timeout

```bash
python run_scrapy_crawler.py --airline alaska --origin SEA --destination JFK --date 2025-04-23 --debug --timeout 600
```

### Using Residential Proxies and CAPTCHA Solver

```bash
python run_scrapy_crawler.py --airline alaska --origin SEA --destination JFK --date 2025-04-23 --use-residential-proxies --use-captcha-solver
```

## CAPTCHA Solving

To use the CAPTCHA solving feature:

1. Sign up for a [2Captcha](https://2captcha.com/) account
2. Set your API key as an environment variable:
   ```
   export TWOCAPTCHA_API_KEY="your_api_key_here"
   ```
3. Run the crawler with the `--use-captcha-solver` flag

## Residential Proxies

To use residential proxies:

1. Create a file named `proxies.txt` in the project root
2. Add one proxy per line in the format:
   ```
   http://user:pass@hostname:port
   ```
3. Run the crawler with the `--use-residential-proxies` flag

## Output

By default, the crawler saves results to:
- `data/airlines/{airline_code}/{origin}_{destination}_{date}_{timestamp}.json`

You can specify a custom output file with the `--output` argument.

## Troubleshooting

- **Logs**: Check the `logs/` directory for detailed logs
- **Debug Mode**: Use the `--debug` flag to capture screenshots and HTML content
- **Timeouts**: Increase the timeout with `--timeout` if searches take too long

## Advanced Configuration

For advanced configuration, you can modify:
- `award_flight_scrapy/settings.py`: Scrapy settings
- `award_flight_scrapy/middlewares.py`: Custom middleware behaviors
- `award_flight_scrapy/solvers.py`: CAPTCHA solving strategies

## License

This project is licensed under the MIT License - see the LICENSE file for details. 