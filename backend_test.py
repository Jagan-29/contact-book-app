#!/usr/bin/env python3
"""
Comprehensive Backend API Test Suite for Contact Book Application
Tests all endpoints according to the review request specifications
"""

import requests
import json
import time
import sys
from typing import Dict, Any, Optional

class ContactBookAPITester:
    def __init__(self, base_url: str = "http://localhost:8001"):
        self.base_url = base_url
        self.token = None
        self.user_data = None
        self.created_contact_id = None
        self.test_results = []
        
    def log_test(self, test_name: str, success: bool, message: str, details: Any = None):
        """Log test results"""
        result = {
            "test": test_name,
            "success": success,
            "message": message,
            "details": details
        }
        self.test_results.append(result)
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} {test_name}: {message}")
        if details and not success:
            print(f"   Details: {details}")
    
    def make_request(self, method: str, endpoint: str, data: Dict = None, 
                    headers: Dict = None, files: Dict = None) -> requests.Response:
        """Make HTTP request with proper error handling"""
        url = f"{self.base_url}{endpoint}"
        default_headers = {"Content-Type": "application/json"}
        
        if self.token:
            default_headers["Authorization"] = f"Bearer {self.token}"
        
        if headers:
            default_headers.update(headers)
        
        # Remove Content-Type for file uploads
        if files:
            default_headers.pop("Content-Type", None)
        
        try:
            if method.upper() == "GET":
                response = requests.get(url, headers=default_headers, params=data)
            elif method.upper() == "POST":
                if files:
                    response = requests.post(url, headers={k: v for k, v in default_headers.items() if k != "Content-Type"}, 
                                           data=data, files=files)
                else:
                    response = requests.post(url, headers=default_headers, 
                                           json=data if data else None)
            elif method.upper() == "PUT":
                response = requests.put(url, headers=default_headers, 
                                      json=data if data else None)
            elif method.upper() == "DELETE":
                response = requests.delete(url, headers=default_headers)
            else:
                raise ValueError(f"Unsupported method: {method}")
            
            return response
        except requests.exceptions.RequestException as e:
            print(f"Request failed: {e}")
            return None

    def test_health_check(self):
        """Test 1: Health Check"""
        response = self.make_request("GET", "/api/health")
        
        if response and response.status_code == 200:
            data = response.json()
            if "status" in data and data["status"] == "healthy":
                self.log_test("Health Check", True, "Server is running and healthy")
            else:
                self.log_test("Health Check", False, "Invalid health response format", data)
        else:
            self.log_test("Health Check", False, 
                         f"Health check failed with status: {response.status_code if response else 'No response'}")

    def test_user_registration(self):
        """Test 2: User Registration"""
        user_data = {
            "email": "test@example.com",
            "password": "password123",
            "name": "Test User"
        }
        
        response = self.make_request("POST", "/api/auth/register", user_data)
        
        if response and response.status_code == 200:
            data = response.json()
            if "access_token" in data and "user" in data:
                self.token = data["access_token"]
                self.user_data = data["user"]
                self.log_test("User Registration", True, "User registered successfully")
            else:
                self.log_test("User Registration", False, "Invalid registration response format", data)
        else:
            error_msg = response.json().get("detail", "Unknown error") if response else "No response"
            self.log_test("User Registration", False, f"Registration failed: {error_msg}")

    def test_user_login(self):
        """Test 3: User Login"""
        login_data = {
            "email": "test@example.com",
            "password": "password123"
        }
        
        response = self.make_request("POST", "/api/auth/login", login_data)
        
        if response and response.status_code == 200:
            data = response.json()
            if "access_token" in data and "user" in data:
                self.token = data["access_token"]  # Update token
                self.log_test("User Login", True, "User logged in successfully")
            else:
                self.log_test("User Login", False, "Invalid login response format", data)
        else:
            error_msg = response.json().get("detail", "Unknown error") if response else "No response"
            self.log_test("User Login", False, f"Login failed: {error_msg}")

    def test_get_current_user(self):
        """Test 4: Get Current User"""
        if not self.token:
            self.log_test("Get Current User", False, "No authentication token available")
            return
        
        response = self.make_request("GET", "/api/auth/me")
        
        if response and response.status_code == 200:
            data = response.json()
            if "user_id" in data and "email" in data and "name" in data:
                self.log_test("Get Current User", True, "User data retrieved successfully")
            else:
                self.log_test("Get Current User", False, "Invalid user data format", data)
        else:
            error_msg = response.json().get("detail", "Unknown error") if response else "No response"
            self.log_test("Get Current User", False, f"Get user failed: {error_msg}")

    def test_get_categories(self):
        """Test 5: Get Categories"""
        if not self.token:
            self.log_test("Get Categories", False, "No authentication token available")
            return
        
        response = self.make_request("GET", "/api/categories")
        
        if response and response.status_code == 200:
            categories = response.json()
            if isinstance(categories, list) and len(categories) >= 4:
                # Check for default categories
                category_names = [cat.get("name") for cat in categories]
                expected_categories = ["Family", "Friends", "Work", "General"]
                if all(cat in category_names for cat in expected_categories):
                    self.log_test("Get Categories", True, f"Default categories created successfully ({len(categories)} total)")
                else:
                    self.log_test("Get Categories", False, f"Missing default categories. Found: {category_names}")
            else:
                self.log_test("Get Categories", False, f"Invalid categories response: {categories}")
        else:
            error_msg = response.json().get("detail", "Unknown error") if response else "No response"
            self.log_test("Get Categories", False, f"Get categories failed: {error_msg}")

    def test_create_contact(self):
        """Test 6: Create Contact"""
        if not self.token:
            self.log_test("Create Contact", False, "No authentication token available")
            return
        
        contact_data = {
            "name": "John Doe",
            "phones": [{"number": "555-1234", "label": "mobile"}],
            "emails": [{"email": "john@example.com", "label": "personal"}],
            "category": "Friends",
            "notes": "Best friend from college"
        }
        
        response = self.make_request("POST", "/api/contacts", contact_data)
        
        if response and response.status_code == 201:
            data = response.json()
            if "contact_id" in data and "name" in data:
                self.created_contact_id = data["contact_id"]
                self.log_test("Create Contact", True, "Contact created successfully")
            else:
                self.log_test("Create Contact", False, "Invalid contact creation response", data)
        else:
            error_msg = response.json().get("detail", "Unknown error") if response else "No response"
            self.log_test("Create Contact", False, f"Contact creation failed: {error_msg}")

    def test_get_all_contacts(self):
        """Test 7: Get All Contacts"""
        if not self.token:
            self.log_test("Get All Contacts", False, "No authentication token available")
            return
        
        response = self.make_request("GET", "/api/contacts")
        
        if response and response.status_code == 200:
            contacts = response.json()
            if isinstance(contacts, list):
                self.log_test("Get All Contacts", True, f"Retrieved {len(contacts)} contacts")
            else:
                self.log_test("Get All Contacts", False, "Invalid contacts response format", contacts)
        else:
            error_msg = response.json().get("detail", "Unknown error") if response else "No response"
            self.log_test("Get All Contacts", False, f"Get contacts failed: {error_msg}")

    def test_search_contacts(self):
        """Test 8: Search Contacts"""
        if not self.token:
            self.log_test("Search Contacts", False, "No authentication token available")
            return
        
        response = self.make_request("GET", "/api/contacts", {"search": "John"})
        
        if response and response.status_code == 200:
            contacts = response.json()
            if isinstance(contacts, list):
                # Check if search results contain "John"
                found_john = any("john" in contact.get("name", "").lower() for contact in contacts)
                if found_john or len(contacts) == 0:  # Empty is also valid if no John exists
                    self.log_test("Search Contacts", True, f"Search returned {len(contacts)} results")
                else:
                    self.log_test("Search Contacts", False, "Search results don't match query", contacts)
            else:
                self.log_test("Search Contacts", False, "Invalid search response format", contacts)
        else:
            error_msg = response.json().get("detail", "Unknown error") if response else "No response"
            self.log_test("Search Contacts", False, f"Search contacts failed: {error_msg}")

    def test_filter_by_category(self):
        """Test 9: Filter by Category"""
        if not self.token:
            self.log_test("Filter by Category", False, "No authentication token available")
            return
        
        response = self.make_request("GET", "/api/contacts", {"category": "Friends"})
        
        if response and response.status_code == 200:
            contacts = response.json()
            if isinstance(contacts, list):
                # Check if all results are in Friends category
                all_friends = all(contact.get("category") == "Friends" for contact in contacts)
                if all_friends:
                    self.log_test("Filter by Category", True, f"Category filter returned {len(contacts)} Friends")
                else:
                    self.log_test("Filter by Category", False, "Filter results contain wrong categories", contacts)
            else:
                self.log_test("Filter by Category", False, "Invalid filter response format", contacts)
        else:
            error_msg = response.json().get("detail", "Unknown error") if response else "No response"
            self.log_test("Filter by Category", False, f"Category filter failed: {error_msg}")

    def test_update_contact(self):
        """Test 10: Update Contact"""
        if not self.token or not self.created_contact_id:
            self.log_test("Update Contact", False, "No authentication token or contact ID available")
            return
        
        update_data = {
            "phones": [{"number": "555-9999", "label": "mobile"}]
        }
        
        response = self.make_request("PUT", f"/api/contacts/{self.created_contact_id}", update_data)
        
        if response and response.status_code == 200:
            data = response.json()
            if "contact_id" in data and "phones" in data:
                # Check if phone number was updated
                updated_phone = data["phones"][0]["number"] if data["phones"] else None
                if updated_phone == "555-9999":
                    self.log_test("Update Contact", True, "Contact updated successfully")
                else:
                    self.log_test("Update Contact", False, f"Phone not updated correctly: {updated_phone}")
            else:
                self.log_test("Update Contact", False, "Invalid update response format", data)
        else:
            error_msg = response.json().get("detail", "Unknown error") if response else "No response"
            self.log_test("Update Contact", False, f"Contact update failed: {error_msg}")

    def test_get_statistics(self):
        """Test 11: Get Statistics"""
        if not self.token:
            self.log_test("Get Statistics", False, "No authentication token available")
            return
        
        response = self.make_request("GET", "/api/stats")
        
        if response and response.status_code == 200:
            stats = response.json()
            if "total_contacts" in stats and "by_category" in stats:
                self.log_test("Get Statistics", True, f"Statistics retrieved: {stats['total_contacts']} total contacts")
            else:
                self.log_test("Get Statistics", False, "Invalid statistics response format", stats)
        else:
            error_msg = response.json().get("detail", "Unknown error") if response else "No response"
            self.log_test("Get Statistics", False, f"Get statistics failed: {error_msg}")

    def test_create_custom_category(self):
        """Test 12: Create Custom Category"""
        if not self.token:
            self.log_test("Create Custom Category", False, "No authentication token available")
            return
        
        # Category endpoint expects query parameters, not JSON body
        response = self.make_request("POST", "/api/categories?name=Colleagues&color=%23FF6B6B")
        
        if response and response.status_code == 201:
            data = response.json()
            if "category_id" in data and data.get("name") == "Colleagues":
                self.log_test("Create Custom Category", True, "Custom category created successfully")
            else:
                self.log_test("Create Custom Category", False, "Invalid category creation response", data)
        else:
            error_msg = response.json().get("detail", "Unknown error") if response else "No response"
            self.log_test("Create Custom Category", False, f"Category creation failed: {error_msg}")

    def test_duplicate_contact_detection(self):
        """Test 14: Duplicate Contact Detection"""
        if not self.token:
            self.log_test("Duplicate Contact Detection", False, "No authentication token available")
            return
        
        # Try to create a contact with the same name as before
        duplicate_contact = {
            "name": "John Doe",  # Same name as created earlier
            "phones": [{"number": "555-5555", "label": "home"}],
            "emails": [{"email": "john.doe@example.com", "label": "work"}],
            "category": "Work"
        }
        
        response = self.make_request("POST", "/api/contacts", duplicate_contact)
        
        if response and response.status_code == 400:
            error_msg = response.json().get("detail", "")
            if "already exists" in error_msg.lower():
                self.log_test("Duplicate Contact Detection", True, "Duplicate prevention working correctly")
            else:
                self.log_test("Duplicate Contact Detection", False, f"Wrong error message: {error_msg}")
        else:
            self.log_test("Duplicate Contact Detection", False, 
                         f"Duplicate was allowed (status: {response.status_code if response else 'No response'})")

    def test_delete_contact(self):
        """Test 13: Delete Contact"""
        if not self.token or not self.created_contact_id:
            self.log_test("Delete Contact", False, "No authentication token or contact ID available")
            return
        
        response = self.make_request("DELETE", f"/api/contacts/{self.created_contact_id}")
        
        if response and response.status_code == 204:
            self.log_test("Delete Contact", True, "Contact deleted successfully")
            # Verify deletion by trying to get the contact
            get_response = self.make_request("GET", f"/api/contacts/{self.created_contact_id}")
            if get_response and get_response.status_code == 404:
                self.log_test("Delete Contact Verification", True, "Contact deletion verified")
            else:
                self.log_test("Delete Contact Verification", False, "Contact still exists after deletion")
        else:
            error_msg = response.json().get("detail", "Unknown error") if response else "No response"
            self.log_test("Delete Contact", False, f"Contact deletion failed: {error_msg}")

    def run_all_tests(self):
        """Run all tests in sequence"""
        print("🚀 Starting Contact Book API Tests...")
        print("=" * 60)
        
        # Test sequence as specified in review request
        self.test_health_check()
        self.test_user_registration()
        self.test_user_login()
        self.test_get_current_user()
        self.test_get_categories()
        self.test_create_contact()
        self.test_get_all_contacts()
        self.test_search_contacts()
        self.test_filter_by_category()
        self.test_update_contact()
        self.test_get_statistics()
        self.test_create_custom_category()
        self.test_duplicate_contact_detection()
        self.test_delete_contact()
        
        # Summary
        print("\n" + "=" * 60)
        print("📊 TEST SUMMARY")
        print("=" * 60)
        
        passed = sum(1 for result in self.test_results if result["success"])
        total = len(self.test_results)
        
        print(f"Total Tests: {total}")
        print(f"Passed: {passed}")
        print(f"Failed: {total - passed}")
        print(f"Success Rate: {(passed/total)*100:.1f}%")
        
        if total - passed > 0:
            print("\n❌ FAILED TESTS:")
            for result in self.test_results:
                if not result["success"]:
                    print(f"  - {result['test']}: {result['message']}")
        
        return passed == total

def main():
    """Main test runner"""
    # Use the backend URL from frontend/.env
    backend_url = "http://localhost:8001"
    
    print(f"Testing Contact Book API at: {backend_url}")
    
    tester = ContactBookAPITester(backend_url)
    success = tester.run_all_tests()
    
    if success:
        print("\n🎉 All tests passed!")
        sys.exit(0)
    else:
        print("\n💥 Some tests failed!")
        sys.exit(1)

if __name__ == "__main__":
    main()