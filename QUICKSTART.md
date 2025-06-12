# Alaska Airlines Award Flight Scraper - Quick Start Guide

This guide will help you get started with the Alaska Airlines Award Flight Scraper quickly.

## Prerequisites

1. Python 3.8 or higher
2. Chrome browser
3. Internet connection
4. Proxies (recommended for reliable results)

## Installation

1. Clone the repository or download the files

2. Install required packages:
   ```bash
   pip install -r requirements.txt
   ```

## Basic Usage

For a simple test run without proxies (not recommended for production):

```bash
python alaska_award_scraper_advanced.py --origin SEA --destination JFK
```

This will search for flights from Seattle (SEA) to New York (JFK) with default dates.

## Using Proxies (Recommended)

### Option 1: Using a Single Proxy

```bash
python alaska_award_scraper_advanced.py --origin SEA --destination JFK --proxy host:port:username:password
```

Example:
```bash
python alaska_award_scraper_advanced.py --origin SEA --destination JFK --proxy 86.38.234.176:31150:zzjbudsv:vjxvvsqsa0iu
```

### Option 2: Using Multiple Proxies (Best Results)

1. Create a JSON file with your proxies:
   ```json
   [
       {
           "host": "86.38.234.176",
           "port": "31150",
           "username": "zzjbudsv",
           "password": "vjxvvsqsa0iu"
       },
       {
           "host": "38.154.227.167",
           "port": "5868",
           "username": "zzjbudsv",
           "password": "vjxvvsqsa0iu"
       }
   ]
   ```

2. Run the scraper with the proxy file:
   ```bash
   python alaska_award_scraper_advanced.py --origin SEA --destination JFK --proxy-file my_proxies.json
   ```

3. For more control, use the dedicated test script:
   ```bash
   python test_multiple_proxies.py --proxy-file my_proxies.json --origin SEA --destination JFK --limit 3
   ```

## Specifying Dates

For a specific departure date:
```bash
python alaska_award_scraper_advanced.py --origin SEA --destination JFK --departure 2024-07-15
```

For a round trip with return date:
```bash
python alaska_award_scraper_advanced.py --origin SEA --destination JFK --departure 2024-07-15 --return 2024-07-22
```

## Common Command-Line Options

- `--origin`: Origin airport code (e.g., SEA, LAX, SFO)
- `--destination`: Destination airport code (e.g., JFK, MCO, MIA)
- `--departure`: Departure date in YYYY-MM-DD format
- `--return`: Return date in YYYY-MM-DD format (omit for one-way trips)
- `--data-dir`: Directory to store the extracted data
- `--proxy`: Single proxy in format host:port:username:password
- `--proxy-file`: JSON file containing list of proxies
- `--max-retries`: Maximum retries per proxy (default: 3)

## Viewing Results

The scraper saves all results in a structured format:

1. **Flight data**: JSON files with detailed flight information
2. **Screenshots**: PNG files showing the browser state at various stages
3. **Page sources**: HTML files for debugging
4. **Logs**: Detailed logs of the scraping process

Results are saved in the data directory (default: `alaska_data`) with timestamped folders.

## Troubleshooting

If you encounter issues:

1. Check the logs in `alaska_scraper_advanced.log`
2. Review the screenshots in the data directory
3. Try different proxies (residential proxies work best)
4. Run with a lower `--max-retries` value if execution is too slow
5. Make sure your Chrome version is up to date

## Examples

### One-Way Trip with Date and Proxy File

```bash
python alaska_award_scraper_advanced.py --origin SFO --destination LAX --departure 2024-06-15 --proxy-file sample_proxies.json
```

### Round Trip with Specific Data Directory

```bash
python alaska_award_scraper_advanced.py --origin SEA --destination JFK --departure 2024-07-15 --return 2024-07-22 --data-dir my_alaska_data --proxy-file sample_proxies.json
```

### Testing Multiple Proxies with Limit

```bash
python test_multiple_proxies.py --proxy-file sample_proxies.json --origin SEA --destination JFK --limit 2 --max-retries 1
```

## Next Steps

- Check the full README.md for detailed information
- Review the Troubleshooting section for common issues
- Look at the code in alaska_award_scraper_advanced.py to understand how it works 