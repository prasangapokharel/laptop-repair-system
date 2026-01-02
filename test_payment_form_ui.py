#!/usr/bin/env python3
"""
Browser-based UI testing for Session 7 features
Tests payment form auto-calculation and technician device management
"""

import time
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import Select, WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

BASE_URL = "http://localhost:3000"
ADMIN_LOGIN_URL = f"{BASE_URL}/auth/login"

def login_as_admin(driver):
    """Login as admin user"""
    print("\n[STEP 1] Logging in as Admin...")
    driver.get(ADMIN_LOGIN_URL)
    
    # Wait for phone input
    phone_input = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.NAME, "phone"))
    )
    
    # Enter credentials
    phone_input.send_keys("1234567890")
    password_input = driver.find_element(By.NAME, "password")
    password_input.send_keys("admin123")
    
    # Click login
    login_btn = driver.find_element(By.XPATH, "//button[contains(text(), 'Sign in')]")
    login_btn.click()
    
    # Wait for redirect
    WebDriverWait(driver, 10).until(
        EC.url_contains("/admin/dashboard")
    )
    print("SUCCESS: Admin logged in")

def test_payment_form(driver):
    """Test payment form auto-calculation"""
    print("\n[STEP 2] Testing Payment Form...")
    
    # Navigate to payment page
    driver.get(f"{BASE_URL}/admin/payments/add")
    
    # Wait for order combobox
    order_button = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.XPATH, "//button[contains(text(), 'Select order')]"))
    )
    
    print("  - Order selection combobox found")
    
    # Click to open order selection
    order_button.click()
    time.sleep(1)
    
    # Wait for order items and select first one
    order_items = WebDriverWait(driver, 10).until(
        EC.presence_of_all_elements_located((By.XPATH, "//div[contains(@class, 'command-item')]"))
    )
    
    if order_items:
        print(f"  - Found {len(order_items)} orders in dropdown")
        # Click first order
        order_items[0].click()
        time.sleep(1)
        print("  - Selected first order")
    else:
        print("  - No orders found in dropdown")
        return False
    
    # Get order total from the summary or the button text
    order_button_text = order_button.text
    print(f"  - Selected order: {order_button_text}")
    
    # Extract total cost from order button
    # Format: "Order #X - रु AMOUNT"
    import re
    match = re.search(r'रु\s*([\d.]+)', order_button_text)
    if match:
        order_total = float(match.group(1))
        print(f"  - Order Total: {order_total}")
    else:
        print("  - Could not extract order total from button")
        return False
    
    # Now test payment amount entry
    print("\n  Testing auto-calculation...")
    
    # Find amount input
    amount_input = driver.find_element(By.XPATH, "//input[@placeholder='Enter payment amount']")
    due_amount_input = driver.find_element(By.XPATH, "//input[@placeholder='Auto-calculated']")
    
    # Test 1: Full payment
    print(f"\n  [TEST 1] Full Payment")
    amount_input.clear()
    amount_input.send_keys(str(order_total))
    time.sleep(0.5)
    
    # Check due amount
    due_value = due_amount_input.get_attribute("value")
    print(f"    - Entered amount: {order_total}")
    print(f"    - Due amount: {due_value}")
    
    expected_due = 0.0
    if float(due_value) == expected_due:
        print(f"    SUCCESS: Full payment calculation correct (due = 0)")
    else:
        print(f"    ERROR: Expected due=0, got {due_value}")
        return False
    
    # Test 2: Partial payment
    if order_total > 10:
        print(f"\n  [TEST 2] Partial Payment")
        partial_amount = order_total / 2
        amount_input.clear()
        amount_input.send_keys(str(partial_amount))
        time.sleep(0.5)
        
        due_value = due_amount_input.get_attribute("value")
        expected_due = order_total - partial_amount
        
        print(f"    - Entered amount: {partial_amount:.2f}")
        print(f"    - Expected due: {expected_due:.2f}")
        print(f"    - Actual due: {due_value}")
        
        # Compare with some tolerance for floating point
        if abs(float(due_value) - expected_due) < 0.01:
            print(f"    SUCCESS: Partial payment calculation correct")
        else:
            print(f"    ERROR: Calculation mismatch")
            return False
    
    # Test 3: Payment summary display
    print(f"\n  [TEST 3] Payment Summary Display")
    summary = WebDriverWait(driver, 5).until(
        EC.presence_of_element_located((By.XPATH, "//div[contains(@class, 'bg-blue-50')]"))
    )
    
    if summary:
        print(f"    SUCCESS: Payment summary box is displayed")
    else:
        print(f"    ERROR: Payment summary box not found")
        return False
    
    return True

def test_technician_devices(driver):
    """Test technician device management pages"""
    print("\n[STEP 3] Testing Technician Device Management...")
    
    # First, we need to logout and login as technician
    # For now, let's just navigate to the pages if admin is logged in
    # In real scenario, you'd logout and login as technician
    
    # Try to navigate to technician pages directly
    driver.get(f"{BASE_URL}/technician/devices/types")
    time.sleep(2)
    
    # Check if page loaded
    try:
        heading = driver.find_element(By.XPATH, "//h1[contains(text(), 'Device Types')]")
        print("  - Device Types page loaded successfully")
        
        # Check for Add Device Type button
        add_btn = driver.find_element(By.XPATH, "//button[contains(text(), 'Add Device Type')]")
        print("  - Add Device Type button found")
        
        # Click to show form
        add_btn.click()
        time.sleep(1)
        
        # Check if form appeared
        form = driver.find_element(By.XPATH, "//form")
        print("  - Form appeared successfully")
        
        return True
    except Exception as e:
        print(f"  - Error: {e}")
        print("  - Note: This may require technician login")
        return False

def main():
    print("=" * 70)
    print(" SESSION 7 - BROWSER TESTING")
    print("=" * 70)
    
    # Initialize WebDriver
    options = webdriver.ChromeOptions()
    # Uncomment for headless mode:
    # options.add_argument("--headless")
    
    driver = webdriver.Chrome(options=options)
    
    try:
        # Step 1: Login
        login_as_admin(driver)
        
        # Step 2: Test payment form
        if test_payment_form(driver):
            print("\nPayment Form Tests: PASSED")
        else:
            print("\nPayment Form Tests: FAILED")
        
        # Step 3: Test technician pages
        if test_technician_devices(driver):
            print("\nTechnician Device Management: PASSED (basic)")
        else:
            print("\nTechnician Device Management: NEEDS TECHNICIAN LOGIN")
        
        print("\n" + "=" * 70)
        print(" Browser testing completed!")
        print("=" * 70)
        
        # Keep browser open for manual inspection
        print("\nBrowser will close in 10 seconds...")
        time.sleep(10)
    
    finally:
        driver.quit()

if __name__ == "__main__":
    main()
