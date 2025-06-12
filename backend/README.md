# Award Flight Crawler

A sophisticated framework for extracting award flight data from various airlines.

## Overview

This project aims to provide a framework for collecting award flight data from multiple airlines, focusing on availability and mileage costs. It currently includes implementations for Alaska Airlines with plans to extend to other carriers.

## Project Structure

```
backend/
├── award_flight_scrapy/        # Scrapy-based crawler implementation
│   ├── spiders/                # Individual airline spiders
│   ├── middlewares.py          # Custom middleware for browser automation
│   ├── pipelines.py            # Data processing pipelines
│   └── solvers.py              # CAPTCHA solvers and other challenge handlers
├── data/                       # Storage for extracted flight data
├── debug/                      # Debugging artifacts (screenshots, HTML, etc.)
├── logs/                       # Log files
├── alaska_crawler.py           # Standalone Playwright-based crawler
├── alaska_crawler_enhanced.py  # Enhanced version with anti-detection features
├── alaska_website_analysis.py  # Tool for analyzing website structure
├── run_alaska_enhanced.py      # Runner script for the enhanced crawler
├── test_scrapy_crawler.py      # Test script for Scrapy implementation
└── debug_alaska_blocking.py    # Specialized debugging tool for anti-bot detection
```

## Implementation Approaches

The project includes multiple implementation approaches, each with different strengths:

### 1. Pure Playwright Approach (`alaska_crawler.py`, `alaska_crawler_enhanced.py`)

- Direct browser automation with Playwright
- Simulates human-like interaction with the website
- Handles JavaScript rendering and complex interactions
- Enhanced version includes more sophisticated anti-detection measures

### 2. Scrapy Implementation (`award_flight_scrapy/`)

- Leverages Scrapy's robust crawling architecture
- Integrates with Playwright for JavaScript support
- More scalable and extensible for multiple airlines
- Better handling of distributed crawling

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/award-flight-crawler.git
cd award-flight-crawler
```

2. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements_scrapy_crawler.txt
```

4. Install Playwright browsers:
```bash
playwright install
```

## Usage

### Direct Playwright Crawler

```bash
python alaska_crawler_enhanced.py --origin SEA --destination JFK --date 2025-04-23 --headless
```

### Using the Runner Script

```bash
python run_alaska_enhanced.py --origin SEA --destination JFK --date 2025-04-23 --timeout 120
```

### Scrapy Implementation

```bash
cd backend
scrapy crawl alaska -a origin=SEA -a destination=JFK -a date=2025-04-23
```

### Testing

```bash
python test_scrapy_crawler.py
```

### Debugging Anti-Bot Mechanisms

```bash
python debug_alaska_blocking.py
```

## Challenges and Limitations

### Anti-Bot Detection

Modern airline websites employ sophisticated mechanisms to detect and block automated access:

- Browser fingerprinting (canvas, WebGL, fonts)
- Behavioral analysis (mouse movements, typing patterns)
- Token-based protection
- Hidden challenges and honeypot traps
- TLS/SSL fingerprinting

For more details, see [SCRAPY_CRAWLER_FINDINGS.md](SCRAPY_CRAWLER_FINDINGS.md).

### Alaska Airlines Specific Issues

Alaska Airlines employs particularly effective anti-bot measures that redirect automated access attempts to error pages. Our findings and recommendations can be found in:

- [ALASKA_CRAWLER_FINDINGS.md](ALASKA_CRAWLER_FINDINGS.md)
- [SCRAPY_CRAWLER_FINDINGS.md](SCRAPY_CRAWLER_FINDINGS.md)

## Best Practices for Development

1. **Legal Compliance**: Always review terms of service and ensure legal compliance
2. **Rate Limiting**: Implement respectful rate limits to minimize impact on servers
3. **Human-Like Behavior**: Design crawlers to mimic natural human interactions
4. **Adaptive Strategies**: Be prepared to update approaches as websites evolve

## Roadmap

1. Implement additional airline spiders (United, American, Delta)
2. Develop more sophisticated anti-detection mechanisms
3. Create a unified API for accessing award flight data
4. Implement data aggregation and analytics features

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details. 