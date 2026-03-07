#!/usr/bin/env python3
"""
Backend API Testing for MEN'S HOUSE BARBER
Tests all API endpoints including authentication, services, appointments, and admin functionality.
"""

import requests
import json
import sys
from datetime import datetime, timedelta
from typing import Dict, Any

# Use the public backend URL from frontend .env
BASE_URL = "https://frizerie-pro-1.preview.emergentagent.com/api"

class BarberShopAPITester:
    def __init__(self):
        self.base_url = BASE_URL
        self.admin_token = None
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []

    def log_test(self, test_name: str, success: bool, details: str = ""):
        """Log test results"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
        
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} - {test_name}")
        if details:
            print(f"    {details}")
        
        self.test_results.append({
            "test": test_name,
            "success": success,
            "details": details
        })

    def make_request(self, method: str, endpoint: str, data: dict = None, headers: dict = None) -> tuple:
        """Make HTTP request and return (success, response_data, status_code)"""
        url = f"{self.base_url}/{endpoint.lstrip('/')}"
        
        default_headers = {'Content-Type': 'application/json'}
        if headers:
            default_headers.update(headers)
        
        try:
            if method.upper() == 'GET':
                response = requests.get(url, headers=default_headers, timeout=10)
            elif method.upper() == 'POST':
                response = requests.post(url, json=data, headers=default_headers, timeout=10)
            elif method.upper() == 'PUT':
                response = requests.put(url, json=data, headers=default_headers, timeout=10)
            elif method.upper() == 'DELETE':
                response = requests.delete(url, headers=default_headers, timeout=10)
            else:
                return False, {"error": f"Unsupported method: {method}"}, 0
            
            try:
                response_data = response.json()
            except:
                response_data = {"text": response.text}
            
            return response.status_code < 400, response_data, response.status_code
        
        except requests.exceptions.RequestException as e:
            return False, {"error": str(e)}, 0

    def test_api_health(self):
        """Test basic API connectivity"""
        success, data, status = self.make_request("GET", "/")
        expected_message = "MEN'S HOUSE BARBER API"
        
        if success and expected_message in str(data.get("message", "")):
            self.log_test("API Health Check", True, f"Status: {status}")
        else:
            self.log_test("API Health Check", False, f"Status: {status}, Response: {data}")

    def test_admin_setup_flow(self):
        """Test admin setup and authentication flow"""
        # Check if setup is needed
        success, data, status = self.make_request("GET", "/auth/check-setup")
        if not success:
            self.log_test("Check Setup Status", False, f"Status: {status}, Response: {data}")
            return
        
        setup_complete = data.get("setup_complete", False)
        self.log_test("Check Setup Status", True, f"Setup complete: {setup_complete}")
        
        # Create admin credentials
        admin_credentials = {
            "username": "testadmin",
            "password": "TestPass123!"
        }
        
        if not setup_complete:
            # Setup admin account
            success, data, status = self.make_request("POST", "/auth/setup", admin_credentials)
            if success and "token" in data:
                self.admin_token = data["token"]
                self.log_test("Admin Setup", True, "Admin account created successfully")
            else:
                self.log_test("Admin Setup", False, f"Status: {status}, Response: {data}")
                return
        else:
            # Login with existing admin
            success, data, status = self.make_request("POST", "/auth/login", admin_credentials)
            if success and "token" in data:
                self.admin_token = data["token"]
                self.log_test("Admin Login", True, "Login successful")
            else:
                # Try alternative credentials if default fails
                alt_credentials = {"username": "admin", "password": "admin123"}
                success, data, status = self.make_request("POST", "/auth/login", alt_credentials)
                if success and "token" in data:
                    self.admin_token = data["token"]
                    self.log_test("Admin Login (Alternative)", True, "Login successful with alt credentials")
                else:
                    self.log_test("Admin Login", False, f"Status: {status}, Response: {data}")
                    return
        
        # Test auth/me endpoint
        headers = {"Authorization": f"Bearer {self.admin_token}"}
        success, data, status = self.make_request("GET", "/auth/me", headers=headers)
        if success and "username" in data:
            self.log_test("Auth Me Endpoint", True, f"Username: {data['username']}")
        else:
            self.log_test("Auth Me Endpoint", False, f"Status: {status}, Response: {data}")

    def test_services_endpoints(self):
        """Test services CRUD operations"""
        # Get public services (no auth required)
        success, data, status = self.make_request("GET", "/services")
        if success and isinstance(data, list):
            service_count = len(data)
            self.log_test("Get Public Services", True, f"Found {service_count} services")
            
            # Store first service for later tests
            self.test_service_id = data[0]["id"] if data else None
        else:
            self.log_test("Get Public Services", False, f"Status: {status}, Response: {data}")

        if not self.admin_token:
            self.log_test("Services CRUD Tests", False, "Admin token required")
            return

        headers = {"Authorization": f"Bearer {self.admin_token}"}
        
        # Get all services (admin)
        success, data, status = self.make_request("GET", "/services/all", headers=headers)
        if success and isinstance(data, list):
            self.log_test("Get All Services (Admin)", True, f"Found {len(data)} services")
        else:
            self.log_test("Get All Services (Admin)", False, f"Status: {status}, Response: {data}")

        # Create new service
        new_service = {
            "name": "Test Service",
            "description": "Test description for automated testing",
            "price": 25.0,
            "duration": 15
        }
        
        success, data, status = self.make_request("POST", "/services", new_service, headers)
        if success and "id" in data:
            created_service_id = data["id"]
            self.log_test("Create Service", True, f"Service ID: {created_service_id}")
            
            # Update the service
            updated_service = {
                "name": "Updated Test Service",
                "description": "Updated description",
                "price": 30.0,
                "duration": 20
            }
            
            success, data, status = self.make_request("PUT", f"/services/{created_service_id}", updated_service, headers)
            if success:
                self.log_test("Update Service", True, "Service updated successfully")
            else:
                self.log_test("Update Service", False, f"Status: {status}, Response: {data}")
            
            # Delete the service
            success, data, status = self.make_request("DELETE", f"/services/{created_service_id}", headers=headers)
            if success:
                self.log_test("Delete Service", True, "Service deleted successfully")
            else:
                self.log_test("Delete Service", False, f"Status: {status}, Response: {data}")
        else:
            self.log_test("Create Service", False, f"Status: {status}, Response: {data}")

    def test_appointments_endpoints(self):
        """Test appointment booking and management"""
        if not hasattr(self, 'test_service_id') or not self.test_service_id:
            self.log_test("Appointment Tests", False, "No service available for testing")
            return

        # Test available slots
        tomorrow = (datetime.now() + timedelta(days=1)).strftime("%Y-%m-%d")
        success, data, status = self.make_request("GET", f"/appointments/available-slots?date={tomorrow}")
        if success and "slots" in data:
            available_slots = data["slots"]
            self.log_test("Get Available Slots", True, f"Found {len(available_slots)} slots for {tomorrow}")
            
            if available_slots:
                # Book an appointment
                appointment_data = {
                    "service_id": self.test_service_id,
                    "client_name": "Test Client",
                    "client_phone": "0722123456",
                    "client_email": "test@example.com",
                    "date": tomorrow,
                    "time": available_slots[0]
                }
                
                success, data, status = self.make_request("POST", "/appointments", appointment_data)
                if success and "id" in data:
                    appointment_id = data["id"]
                    self.log_test("Create Appointment", True, f"Appointment ID: {appointment_id}")
                    
                    # Test admin endpoints if token available
                    if self.admin_token:
                        headers = {"Authorization": f"Bearer {self.admin_token}"}
                        
                        # Get appointments for the date
                        success, data, status = self.make_request("GET", f"/appointments?date={tomorrow}", headers=headers)
                        if success and isinstance(data, list):
                            self.log_test("Get Appointments by Date", True, f"Found {len(data)} appointments")
                        else:
                            self.log_test("Get Appointments by Date", False, f"Status: {status}, Response: {data}")
                        
                        # Update appointment status
                        success, data, status = self.make_request("PUT", f"/appointments/{appointment_id}/status?status=completed", headers=headers)
                        if success:
                            self.log_test("Update Appointment Status", True, "Status updated to completed")
                        else:
                            self.log_test("Update Appointment Status", False, f"Status: {status}, Response: {data}")
                else:
                    self.log_test("Create Appointment", False, f"Status: {status}, Response: {data}")
            else:
                self.log_test("Create Appointment", False, "No available slots for testing")
        else:
            self.log_test("Get Available Slots", False, f"Status: {status}, Response: {data}")

    def test_working_hours_endpoints(self):
        """Test working hours management"""
        # Get working hours (public)
        success, data, status = self.make_request("GET", "/working-hours")
        if success and isinstance(data, list):
            self.log_test("Get Working Hours", True, f"Found {len(data)} working hour entries")
        else:
            self.log_test("Get Working Hours", False, f"Status: {status}, Response: {data}")

        if not self.admin_token:
            return

        # Update working hours (admin only)
        headers = {"Authorization": f"Bearer {self.admin_token}"}
        updated_hours = [
            {"day": "monday", "open_time": "09:00", "close_time": "18:00", "is_closed": False},
            {"day": "sunday", "open_time": "10:00", "close_time": "14:00", "is_closed": True}
        ]
        
        success, data, status = self.make_request("PUT", "/working-hours", updated_hours, headers)
        if success:
            self.log_test("Update Working Hours", True, "Working hours updated successfully")
        else:
            self.log_test("Update Working Hours", False, f"Status: {status}, Response: {data}")

    def test_settings_endpoints(self):
        """Test salon settings"""
        # Get settings (public)
        success, data, status = self.make_request("GET", "/settings")
        if success and isinstance(data, dict):
            self.log_test("Get Settings", True, f"Settings loaded: {data.get('name', 'Unknown')}")
        else:
            self.log_test("Get Settings", False, f"Status: {status}, Response: {data}")

        if not self.admin_token:
            return

        # Update settings (admin only)
        headers = {"Authorization": f"Bearer {self.admin_token}"}
        updated_settings = {
            "name": "MEN'S HOUSE BARBER",
            "phone": "0722123456",
            "email": "contact@menshouse.com",
            "address": "Strada Exemplu 123, București",
            "slot_duration": 30
        }
        
        success, data, status = self.make_request("PUT", "/settings", updated_settings, headers)
        if success:
            self.log_test("Update Settings", True, "Settings updated successfully")
        else:
            self.log_test("Update Settings", False, f"Status: {status}, Response: {data}")

    def test_stats_endpoint(self):
        """Test admin statistics"""
        if not self.admin_token:
            self.log_test("Stats Endpoint", False, "Admin token required")
            return

        headers = {"Authorization": f"Bearer {self.admin_token}"}
        success, data, status = self.make_request("GET", "/stats", headers=headers)
        if success and isinstance(data, dict):
            stats_keys = ["today_appointments", "month_appointments", "month_revenue", "services_count"]
            if all(key in data for key in stats_keys):
                self.log_test("Get Stats", True, f"All stats present: {data}")
            else:
                self.log_test("Get Stats", False, f"Missing stats keys: {data}")
        else:
            self.log_test("Get Stats", False, f"Status: {status}, Response: {data}")

    def run_all_tests(self):
        """Run all backend API tests"""
        print(f"\n🔍 Starting MEN'S HOUSE BARBER API Tests")
        print(f"📍 Base URL: {self.base_url}")
        print("=" * 60)
        
        # Run tests in logical order
        self.test_api_health()
        self.test_admin_setup_flow()
        self.test_services_endpoints()
        self.test_appointments_endpoints()
        self.test_working_hours_endpoints()
        self.test_settings_endpoints()
        self.test_stats_endpoint()
        
        print("\n" + "=" * 60)
        print(f"📊 Test Results: {self.tests_passed}/{self.tests_run} passed")
        
        if self.tests_passed == self.tests_run:
            print("🎉 All tests passed!")
            return 0
        else:
            print("❌ Some tests failed!")
            print("\nFailed tests:")
            for result in self.test_results:
                if not result["success"]:
                    print(f"  - {result['test']}: {result['details']}")
            return 1

def main():
    tester = BarberShopAPITester()
    return tester.run_all_tests()

if __name__ == "__main__":
    sys.exit(main())