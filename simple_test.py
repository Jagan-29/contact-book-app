#!/usr/bin/env python3
import requests
import json

# Test basic functionality
base_url = "http://localhost:8001"

print("Testing basic endpoints...")

# 1. Health check
try:
    response = requests.get(f"{base_url}/api/health", timeout=5)
    print(f"Health: {response.status_code} - {response.json()}")
except Exception as e:
    print(f"Health check failed: {e}")

# 2. Register user
try:
    user_data = {
        "email": "simple@test.com",
        "password": "password123",
        "name": "Simple Test"
    }
    response = requests.post(f"{base_url}/api/auth/register", json=user_data, timeout=5)
    print(f"Register: {response.status_code}")
    if response.status_code == 200:
        token = response.json()["access_token"]
        print(f"Got token: {token[:20]}...")
    elif response.status_code == 400:
        print("User already exists (expected)")
        # Try login instead
        login_data = {"email": "simple@test.com", "password": "password123"}
        response = requests.post(f"{base_url}/api/auth/login", json=login_data, timeout=5)
        if response.status_code == 200:
            token = response.json()["access_token"]
            print(f"Login successful, got token: {token[:20]}...")
        else:
            print(f"Login failed: {response.status_code}")
            exit(1)
    else:
        print(f"Registration failed: {response.json()}")
        exit(1)
except Exception as e:
    print(f"Registration failed: {e}")
    exit(1)

# 3. Test category creation
try:
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.post(f"{base_url}/api/categories?name=TestCat&color=%23FF0000", 
                           headers=headers, timeout=5)
    print(f"Category creation: {response.status_code}")
    if response.status_code not in [200, 201, 400]:  # 400 if already exists
        print(f"Category creation response: {response.text}")
except Exception as e:
    print(f"Category creation failed: {e}")

print("Simple test completed.")