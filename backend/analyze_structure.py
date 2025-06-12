from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, NoSuchElementException, ElementNotInteractableException
import time
import logging
import os
import random
import json
from datetime import datetime, timedelta
import urllib.parse

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

def wait_for_element(driver, by, value, timeout=20):
    """Wait for an element to be present and visible"""
    try:
        element = WebDriverWait(driver, timeout).until(
            EC.presence_of_element_located((by, value))
        )
        return element
    except Exception as e:
        logger.error(f"Timeout waiting for element {value}: {str(e)}")
        return None

def human_delay():
    """Add random delay to mimic human behavior"""
    delay = random.uniform(1.0, 3.5)
    time.sleep(delay)

def save_page_info(driver, prefix):
    """Save screenshot and page source with timestamp"""
    timestamp = time.strftime("%Y%m%d_%H%M%S")
    os.makedirs('data/alaska_analysis', exist_ok=True)
    dir_path = f'data/alaska_analysis/{timestamp}'
    os.makedirs(dir_path, exist_ok=True)
    
    # Save screenshot
    screenshot_path = f'{dir_path}/{prefix}_screenshot.png'
    driver.save_screenshot(screenshot_path)
    logger.info(f'Saved screenshot to {screenshot_path}')
    
    # Save page source
    source_path = f'{dir_path}/{prefix}_page.html'
    with open(source_path, 'w', encoding='utf-8') as f:
        f.write(driver.page_source)
    logger.info(f'Saved page source to {source_path}')
    
    return dir_path

def extract_flight_data(driver):
    """
    Extract award flight data from results page
    Returns a list of flight dictionaries with award information
    """
    flight_data = []
    
    # Wait for results to load
    try:
        WebDriverWait(driver, 30).until(
            EC.presence_of_element_located((By.CSS_SELECTOR, '[class*="flight-list"]'))
        )
    except TimeoutException:
        logger.error("Flight results not found on page")
        return flight_data
    
    # Try multiple selectors for flight containers
    flight_container_selectors = [
        '[class*="flight-list"] [class*="flight-card"]',
        '[class*="flight-card"]',
        '[class*="flight-result"]',
        '[class*="flight"]',
        '[id*="flight"]'
    ]
    
    flight_containers = []
    for selector in flight_container_selectors:
        flight_containers = driver.find_elements(By.CSS_SELECTOR, selector)
        if flight_containers:
            logger.info(f"Found {len(flight_containers)} flights with selector: {selector}")
            break
    
    if not flight_containers:
        logger.warning("No flight containers found")
        
        # Try to find any miles information on the page
        miles_elements = driver.find_elements(By.XPATH, '//*[contains(text(), "miles")]')
        if miles_elements:
            logger.info(f"Found {len(miles_elements)} elements with 'miles' text")
            for element in miles_elements:
                logger.info(f"Miles text: {element.text}")
        
        # Save any prices found
        price_elements = driver.find_elements(By.XPATH, '//*[contains(text(), "$") or contains(text(), "miles")]')
        if price_elements:
            logger.info(f"Found {len(price_elements)} price elements")
            for element in price_elements[:10]:  # Limit to first 10 to avoid too much output
                logger.info(f"Price text: {element.text}")
        
        return flight_data
    
    # Iterate through each flight container to extract data
    for i, container in enumerate(flight_containers[:5]):  # Limit to first 5 flights
        try:
            flight_info = {"flight_number": "", "departure": "", "arrival": "", "duration": "", "award_price": ""}
            
            # Extract flight number
            flight_num_elements = container.find_elements(By.CSS_SELECTOR, 
                '[class*="flight-number"], [class*="flightNumber"], [id*="flight-number"]')
            if flight_num_elements:
                flight_info["flight_number"] = flight_num_elements[0].text.strip()
            
            # Extract departure/arrival times
            time_elements = container.find_elements(By.CSS_SELECTOR, 
                '[class*="time"], [class*="departure"], [class*="arrival"]')
            if len(time_elements) >= 2:
                flight_info["departure"] = time_elements[0].text.strip()
                flight_info["arrival"] = time_elements[1].text.strip()
            
            # Extract duration
            duration_elements = container.find_elements(By.CSS_SELECTOR, 
                '[class*="duration"], [class*="flight-time"]')
            if duration_elements:
                flight_info["duration"] = duration_elements[0].text.strip()
            
            # Extract award price - try multiple approaches
            award_elements = container.find_elements(By.XPATH, 
                './/*[contains(text(), "miles") or contains(text(), "Miles")]')
            
            if award_elements:
                for elem in award_elements:
                    if "miles" in elem.text.lower():
                        flight_info["award_price"] = elem.text.strip()
                        break
            
            if not flight_info["award_price"]:
                # Try another approach looking for specific award price containers
                award_containers = container.find_elements(By.CSS_SELECTOR, 
                    '[class*="award"], [class*="fare"], [class*="price"], [class*="miles"]')
                for elem in award_containers:
                    if elem.text and ("miles" in elem.text.lower() or "$" in elem.text):
                        flight_info["award_price"] = elem.text.strip()
                        break
            
            logger.info(f"Flight {i+1} data: {flight_info}")
            flight_data.append(flight_info)
            
        except Exception as e:
            logger.error(f"Error extracting data for flight {i+1}: {str(e)}")
    
    return flight_data

def convert_city_code(city_code):
    """Convert 3-letter city code to format needed for URL"""
    # This conversion follows Alaska's URL pattern
    # Examples: SEA -> DF1, LAX -> DF2, etc.
    # We might need to build a proper mapping for all airports
    city_map = {
        "SEA": "DF1",
        "LAX": "DF2", 
        "SFO": "DF3",
        "NYC": "NYC", # NYC is likely a multi-airport code
        "JFK": "DF4",
        "ORD": "DF5",
        "SJC": "DF6"
    }
    
    # If city is in mapping, return mapped code, otherwise return original
    return city_map.get(city_code, city_code)

def format_date(date_str):
    """Format date for URL: MM/DD/YYYY -> YYYY-MM-DD"""
    try:
        date_obj = datetime.strptime(date_str, "%m/%d/%Y")
        return date_obj.strftime("%Y-%m-%d")
    except:
        return date_str  # Return as-is if already in correct format or invalid

def build_direct_url(origin, destination, date_str, round_trip=False):
    """Build direct URL for award search"""
    # Convert date format if needed
    formatted_date = format_date(date_str)
    
    # Convert city codes if needed
    origin_code = convert_city_code(origin)
    destination_code = convert_city_code(destination)
    
    # Build URL with parameters
    url = (f"https://www.alaskaair.com/search/results?"
           f"A=1&C=0&L=0"  # 1 adult, 0 children, 0 lap infants
           f"&O={origin_code}"
           f"&D={destination_code}"
           f"&OD={formatted_date}"
           f"&RT={'true' if round_trip else 'false'}"
           f"&ShoppingMethod=onlineaward")
    
    return url

def analyze_award_flights(origin="SEA", destination="NYC", date_str="05/15/2024", return_date_str=None):
    """Search for award flights using form submission from homepage"""
    options = Options()
    
    # Add more realistic browser behavior
    options.add_argument('--disable-blink-features=AutomationControlled')
    options.add_experimental_option('excludeSwitches', ['enable-automation'])
    options.add_experimental_option('useAutomationExtension', False)
    
    # Add additional headers
    options.add_argument('--user-agent=Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36')
    options.add_argument('--accept-lang=en-US,en;q=0.9')
    
    # Basic options
    options.add_argument('--no-sandbox')
    options.add_argument('--disable-dev-shm-usage')
    options.add_argument('--disable-gpu')
    options.add_argument('--disable-extensions')
    options.add_argument('--disable-infobars')
    options.add_argument('--disable-notifications')
    options.add_argument('--ignore-certificate-errors')
    options.add_argument('--ignore-ssl-errors')
    
    # Add window size
    options.add_argument('--window-size=1920,1080')

    driver = None
    try:
        # Initialize driver
        driver = webdriver.Chrome(options=options)
        driver.set_page_load_timeout(45)  # Increase timeout for slower connections
        
        # Step 1: Navigate to homepage directly
        logger.info("Navigating to Alaska Airlines homepage")
        driver.get('https://www.alaskaair.com')
        
        # Wait for homepage to load with extra delay to avoid detection
        base_wait = random.uniform(8, 12)
        logger.info(f"Waiting {base_wait:.1f} seconds for homepage to load")
        time.sleep(base_wait)
        
        # Check if homepage loaded
        if "alaskaair.com" not in driver.current_url:
            logger.error(f"Failed to load homepage. Current URL: {driver.current_url}")
            return None
        
        # Save homepage info
        save_page_info(driver, '01_homepage')
        
        # Step 2: Find and interact with the flight search form on homepage
        form_selectors = [
            '#findFlights', 
            '#flight-search',
            '#book-tab',
            '#booking-form',
            '[data-testid="booking-form"]',
            'form[name="aspnetForm"]'
        ]
        
        found_form = False
        for selector in form_selectors:
            try:
                form = driver.find_element(By.CSS_SELECTOR, selector)
                if form:
                    logger.info(f"Found search form with selector: {selector}")
                    found_form = True
                    break
            except:
                continue
        
        if not found_form:
            logger.info("Could not find form directly, looking for book section/tab")
            # Try to find and click on Book tab/section if form not found directly
            book_selectors = [
                'a[href="#book"]',
                'a[href*="book"]', 
                'button:contains("Book")',
                '[data-testid*="book"]',
                '.nav-booking',
                'a:contains("Book")',
                'li:contains("Book")',
                '.navigation a',
                'nav a'
            ]
            
            for selector in book_selectors:
                try:
                    book_elements = driver.find_elements(By.CSS_SELECTOR, selector)
                    if book_elements:
                        for element in book_elements:
                            if element.is_displayed() and ('book' in element.text.lower() or 'flight' in element.text.lower()):
                                # Scroll to element and click
                                driver.execute_script("arguments[0].scrollIntoView(true);", element)
                                human_delay()
                                driver.execute_script("arguments[0].click();", element)
                                logger.info(f'Clicked book element: {element.text}')
                                found_form = True
                                time.sleep(5)  # Wait for tab/section to load
                                break
                        if found_form:
                            break
                except Exception as e:
                    logger.error(f"Error with book selector {selector}: {str(e)}")
                    continue
        
        # Random mouse movements to look more human
        for _ in range(3):
            x_coord = random.randint(100, 800)
            y_coord = random.randint(100, 600)
            driver.execute_script(f"window.scrollTo({x_coord}, {y_coord});")
            human_delay()
        
        # Step 3: Most important - find and check "Use miles" checkbox
        logger.info("Attempting to find and check 'Use miles' checkbox")
        
        # Try multiple approaches to find the award/miles checkbox
        award_checkbox_found = False
        award_checkbox_selectors = [
            '#awardReservation',
            'input#awardReservation', 
            'input[name="IsAwardReservation"]',
            'input[id*="award"]',
            'input[name*="award"]',
            'input[id*="miles"]',
            'input[name*="miles"]',
            'input[type="checkbox"][id*="award"]',
            'input[type="checkbox"][name*="award"]',
            'input[type="checkbox"][id*="miles"]',
            'input[type="checkbox"][name*="miles"]',
            'label:contains("Use miles")',
            'label:contains("Award")'
        ]
        
        for selector in award_checkbox_selectors:
            try:
                checkbox_elements = driver.find_elements(By.CSS_SELECTOR, selector)
                if checkbox_elements:
                    for checkbox in checkbox_elements:
                        # Try direct element if it's a checkbox
                        if checkbox.tag_name == 'input' and checkbox.get_attribute('type') == 'checkbox':
                            if not checkbox.is_selected():
                                driver.execute_script("arguments[0].scrollIntoView(true);", checkbox)
                                # Try multiple click methods
                                try:
                                    driver.execute_script("arguments[0].click();", checkbox)
                                    logger.info(f"Clicked 'Use miles' checkbox using JS")
                                    time.sleep(1)
                                    if checkbox.is_selected():
                                        award_checkbox_found = True
                                        break
                                except:
                                    try:
                                        checkbox.click()
                                        logger.info(f"Clicked 'Use miles' checkbox directly")
                                        award_checkbox_found = True
                                        break
                                    except:
                                        logger.warning(f"Failed to click checkbox with selector: {selector}")
                        # If it's a label, try to find the associated checkbox
                        elif checkbox.tag_name == 'label':
                            try:
                                # Try to click the label which should check the checkbox
                                driver.execute_script("arguments[0].click();", checkbox)
                                logger.info(f"Clicked 'Use miles' label")
                                award_checkbox_found = True
                                break
                            except:
                                continue
                    
                    if award_checkbox_found:
                        break
            except Exception as e:
                logger.error(f"Error with award checkbox selector {selector}: {str(e)}")
                continue
        
        if not award_checkbox_found:
            logger.warning("Could not find and check 'Use miles' checkbox - will try alternative methods")
            # Try backup approach: look for text containing "miles" or "award" and click nearby checkboxes
            try:
                miles_text_elements = driver.find_elements(By.XPATH, "//*[contains(text(), 'miles') or contains(text(), 'Miles') or contains(text(), 'award') or contains(text(), 'Award')]")
                for elem in miles_text_elements:
                    # Look for checkboxes near this text
                    nearby_checkboxes = driver.find_elements(By.XPATH, "//input[@type='checkbox']")
                    for checkbox in nearby_checkboxes:
                        try:
                            driver.execute_script("arguments[0].click();", checkbox)
                            logger.info("Clicked a checkbox near miles/award text")
                            award_checkbox_found = True
                            break
                        except:
                            continue
                    if award_checkbox_found:
                        break
            except Exception as e:
                logger.error(f"Error with backup miles checkbox approach: {str(e)}")
        
        # Allow some time for any UI updates after checkbox interaction
        time.sleep(2)
        
        # Save form state after checking miles checkbox
        save_page_info(driver, '02_form_with_miles')
        
        # Step 4: Fill in origin/destination and dates
        logger.info("Filling in flight search form fields")
        
        # Fill in From city
        origin_input_selectors = [
            '#fromCity1', 
            'input[name="DepartureCity1"]', 
            '#origin', 
            'input[placeholder*="From"]',
            'input[aria-label*="rom"]',
            'input[id*="rom"]',
            'input[id*="origin"]',
            'input[name*="origin"]'
        ]
        
        origin_input_success = False
        for selector in origin_input_selectors:
            try:
                from_city = driver.find_element(By.CSS_SELECTOR, selector)
                from_city.clear()
                human_delay()
                for char in origin:
                    from_city.send_keys(char)
                    time.sleep(random.uniform(0.1, 0.3))
                from_city.send_keys("\t")  # Tab to trigger autocomplete and move to next field
                logger.info(f'Entered origin: {origin} using selector {selector}')
                origin_input_success = True
                human_delay()
                break
            except:
                continue
        
        if not origin_input_success:
            logger.warning(f"Could not enter origin ({origin}) - form may be different than expected")
                
        # Fill in To city
        dest_input_selectors = [
            '#toCity1', 
            'input[name="ArrivalCity1"]', 
            '#destination', 
            'input[placeholder*="To"]',
            'input[aria-label*="o"]',
            'input[id*="destination"]',
            'input[name*="destination"]',
            'input[id*="arrival"]',
            'input[name*="arrival"]'
        ]
        
        dest_input_success = False
        for selector in dest_input_selectors:
            try:
                to_city = driver.find_element(By.CSS_SELECTOR, selector)
                to_city.clear()
                human_delay()
                for char in destination:
                    to_city.send_keys(char)
                    time.sleep(random.uniform(0.1, 0.3))
                to_city.send_keys("\t")  # Tab to trigger autocomplete and move to next field
                logger.info(f'Entered destination: {destination} using selector {selector}')
                dest_input_success = True
                human_delay()
                break
            except:
                continue
        
        if not dest_input_success:
            logger.warning(f"Could not enter destination ({destination}) - form may be different than expected")
                
        # Fill in departure date
        date_input_selectors = [
            '#departureDate1', 
            'input[name="DepartureDate1"]', 
            'input[placeholder*="Depart"]',
            'input[aria-label*="epart"]',
            'input[id*="depart"]',
            'input[name*="depart"]'
        ]
        
        date_input_success = False
        for selector in date_input_selectors:
            try:
                date_field = driver.find_element(By.CSS_SELECTOR, selector)
                date_field.clear()
                human_delay()
                # Some sites need different date formats - try both MM/DD/YYYY and YYYY-MM-DD
                for char in date_str:
                    date_field.send_keys(char)
                    time.sleep(random.uniform(0.1, 0.3))
                date_field.send_keys("\t")  # Tab to trigger validation and move to next field
                logger.info(f'Entered departure date: {date_str} using selector {selector}')
                date_input_success = True
                human_delay()
                break
            except:
                continue
        
        if not date_input_success:
            logger.warning(f"Could not enter departure date ({date_str}) - form may be different than expected")
        
        # Fill in return date if provided
        if return_date_str:
            return_date_selectors = [
                '#returnDate', 
                'input[name="ReturnDate"]', 
                'input[placeholder*="Return"]',
                'input[aria-label*="eturn"]',
                'input[id*="return"]',
                'input[name*="return"]'
            ]
            
            for selector in return_date_selectors:
                try:
                    return_field = driver.find_element(By.CSS_SELECTOR, selector)
                    return_field.clear()
                    human_delay()
                    for char in return_date_str:
                        return_field.send_keys(char)
                        time.sleep(random.uniform(0.1, 0.3))
                    return_field.send_keys("\t")  # Tab to trigger validation and move to next field
                    logger.info(f'Entered return date: {return_date_str} using selector {selector}')
                    human_delay()
                    break
                except:
                    continue
        
        # Step 5: Save form state before submission
        save_page_info(driver, '03_filled_form')
        
        # Step 6: Submit the search form
        logger.info("Attempting to submit search form")
        
        # Try clicking on a neutral spot to trigger any field validations
        try:
            driver.find_element(By.TAG_NAME, 'body').click()
            time.sleep(2)
        except:
            pass
        
        # Random movements before submission to look more human
        for _ in range(3):
            x_coord = random.randint(100, 800)
            y_coord = random.randint(100, 600)
            driver.execute_script(f"window.scrollTo({x_coord}, {y_coord});")
            human_delay()
        
        # Try multiple approaches to submit form
        submit_selectors = [
            '#findFlights', 
            'button[type="submit"]', 
            'input[type="submit"]',
            'button:contains("Find")',
            'button:contains("Search")',
            'button:contains("Continue")',
            'input[value="Find Flights"]',
            'input[value*="Search"]',
            'button.submit',
            'a:contains("Search")',
            '[data-testid*="search-button"]',
            '[data-testid*="submit"]'
        ]
        
        form_submitted = False
        for selector in submit_selectors:
            try:
                submit_buttons = driver.find_elements(By.CSS_SELECTOR, selector)
                if submit_buttons:
                    for button in submit_buttons:
                        if button.is_displayed():
                            # Try to scroll to button and click
                            driver.execute_script("arguments[0].scrollIntoView(true);", button)
                            time.sleep(1)
                            
                            # First try using JavaScript click (more reliable)
                            try:
                                driver.execute_script("arguments[0].click();", button)
                                logger.info(f'Clicked submit button using JavaScript: {button.text or selector}')
                                form_submitted = True
                                break
                            except Exception as js_e:
                                logger.error(f"JavaScript click failed: {str(js_e)}")
                                
                                # Fall back to regular click
                                try:
                                    button.click()
                                    logger.info(f'Clicked submit button directly: {button.text or selector}')
                                    form_submitted = True
                                    break
                                except Exception as click_e:
                                    logger.error(f"Direct click failed: {str(click_e)}")
                    
                    if form_submitted:
                        break
            except Exception as e:
                logger.error(f"Error with submit selector {selector}: {str(e)}")
                continue
        
        if not form_submitted:
            # Try to submit the form directly
            try:
                # Try to find the form
                form_elements = driver.find_elements(By.TAG_NAME, 'form')
                if form_elements:
                    for form in form_elements:
                        try:
                            driver.execute_script("arguments[0].submit();", form)
                            logger.info('Submitted form directly using JavaScript')
                            form_submitted = True
                            break
                        except:
                            continue
            except Exception as e:
                logger.error(f"Form submit failed: {str(e)}")
        
        if not form_submitted:
            logger.error("All form submission attempts failed")
            return None
        
        # Step 7: Wait for results page to load
        logger.info("Waiting for search results page to load")
        wait_time = random.uniform(20, 25)  # Longer wait for results page
        logger.info(f"Waiting {wait_time:.1f} seconds for results to load")
        time.sleep(wait_time)
        
        # Save search results page
        results_dir = save_page_info(driver, '04_search_results')
        
        # Check if we got results or redirected elsewhere
        current_url = driver.current_url
        logger.info(f"Current URL after form submission: {current_url}")
        
        # Step 8: Try to extract flight data
        logger.info("Attempting to extract flight data")
        
        # Give the page some extra time to load all dynamic content
        time.sleep(5)
        
        flights = extract_flight_data(driver)
        
        # Save the extracted data to JSON
        if flights:
            data_file = f'{results_dir}/flights_data.json'
            with open(data_file, 'w') as f:
                json.dump(flights, f, indent=2)
            logger.info(f"Found {len(flights)} flights with award data")
            return flights
        else:
            logger.warning("No flight data extracted")
            
            # Log any miles-related text on the page for debugging
            logger.info("Looking for any award information on the page...")
            award_texts = driver.find_elements(By.XPATH, '//*[contains(text(), "miles") or contains(text(), "Miles")]')
            for i, elem in enumerate(award_texts[:10]):
                logger.info(f"Award text {i+1}: {elem.text}")
        
        return None

    except Exception as e:
        logger.error(f'Error: {str(e)}')
        return None
    finally:
        if driver:
            # Save final state before quitting
            try:
                driver.save_screenshot('data/alaska_analysis/final_state.png')
                logger.info("Saved final browser state")
            except:
                pass
            driver.quit()

def search_multiple_dates(origin, destination, start_date_str, num_days=3, with_return=False):
    """Search for flights across multiple dates"""
    all_results = {}
    
    # Parse the start date
    start_date = datetime.strptime(start_date_str, "%m/%d/%Y")
    
    # Search for each date
    for i in range(num_days):
        # Calculate the date
        current_date = start_date + timedelta(days=i)
        current_date_str = current_date.strftime("%m/%d/%Y")
        
        # Calculate return date if needed (5 days after departure)
        return_date_str = None
        if with_return:
            return_date = current_date + timedelta(days=5)
            return_date_str = return_date.strftime("%m/%d/%Y")
        
        logger.info(f"Searching flights for date: {current_date_str}" + 
                   (f" with return on {return_date_str}" if return_date_str else ""))
        
        # Search for this date
        flights = analyze_award_flights(origin, destination, current_date_str, return_date_str)
        
        # Store results
        all_results[current_date_str] = flights if flights else []
        
        # Add delay between searches to avoid rate limiting
        if i < num_days - 1:  # Don't delay after the last search
            delay = random.uniform(30, 45)  # Longer delay between searches
            logger.info(f"Waiting {delay:.1f} seconds before next search...")
            time.sleep(delay)
    
    # Save combined results
    timestamp = time.strftime("%Y%m%d_%H%M%S")
    os.makedirs('data/alaska_analysis', exist_ok=True)
    combined_file = f'data/alaska_analysis/combined_results_{timestamp}.json'
    
    with open(combined_file, 'w') as f:
        json.dump(all_results, f, indent=2)
    
    logger.info(f"Saved combined results to {combined_file}")
    return all_results

if __name__ == '__main__':
    # Single date search
    analyze_award_flights(origin="SEA", destination="NYC", date_str="04/23/2025")
    
    # Uncomment to search multiple dates
    # search_multiple_dates(origin="SEA", destination="NYC", 
    #                       start_date_str="05/15/2024", num_days=3) 