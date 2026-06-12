import os
import sys
import csv
import json
import time
import datetime
import urllib.request
import urllib.error
import base64

# Backend config
BACKEND_URL = "http://127.0.0.1:8000"
FRONTEND_URL = "http://localhost:5173"

def request_with_retry(req, data=None, retries=3, delay=3):
    for attempt in range(retries):
        try:
            with urllib.request.urlopen(req, data=data, timeout=25) as response:
                status = response.status
                body = response.read()
                # Check if it returns JSON or bytes
                try:
                    return status, json.loads(body.decode("utf-8")), None
                except Exception:
                    return status, body, None
        except urllib.error.HTTPError as e:
            code = e.code
            try:
                err_body = json.loads(e.read().decode("utf-8"))
            except Exception:
                err_body = e.reason
            
            # If 502 or 503 (often transient AI rate limits/overloads), retry
            if code in (502, 503) and attempt < retries - 1:
                print(f"  [RETRY] Received HTTP {code}. Retrying in {delay}s...")
                time.sleep(delay)
                continue
            return code, None, err_body
        except Exception as e:
            if attempt < retries - 1:
                print(f"  [RETRY] Encountered exception {e}. Retrying in {delay}s...")
                time.sleep(delay)
                continue
            return 500, None, str(e)

def post_json(url, data, token=None, retries=3):
    req = urllib.request.Request(url, method="POST")
    req.add_header("Content-Type", "application/json")
    if token:
        req.add_header("Authorization", f"Bearer {token}")
    jsondata = json.dumps(data).encode("utf-8")
    return request_with_retry(req, data=jsondata, retries=retries)

def get_json(url, token=None, retries=3):
    req = urllib.request.Request(url, method="GET")
    if token:
        req.add_header("Authorization", f"Bearer {token}")
    return request_with_retry(req, retries=retries)

def main():
    audit_results = []
    
    print("=== STARTING HEALTHSENSE SYSTEM AUDIT (WITH RETRIES & PNG FIX) ===")
    
    # --- 1. Backend Server Check ---
    try:
        with urllib.request.urlopen(f"{BACKEND_URL}/", timeout=5) as r:
            body = json.loads(r.read().decode("utf-8"))
            if r.status == 200 and "status" in body:
                audit_results.append({
                    "Module/Component": "Backend Service Status",
                    "Verified Flow": "Root Service Health check (GET /)",
                    "Status": "PASSED",
                    "Details/Observation": f"FastAPI Server is healthy and running. Service: '{body.get('service')}'"
                })
            else:
                audit_results.append({
                    "Module/Component": "Backend Service Status",
                    "Verified Flow": "Root Service Health check (GET /)",
                    "Status": "FAILED",
                    "Details/Observation": f"Unexpected response format: {body}"
                })
    except Exception as e:
        audit_results.append({
            "Module/Component": "Backend Service Status",
            "Verified Flow": "Root Service Health check (GET /)",
            "Status": "FAILED",
            "Details/Observation": f"Cannot connect to Backend: {e}"
        })

    time.sleep(2)

    # --- 2. Auth Flow: Registration & Login ---
    timestamp = int(datetime.datetime.now().timestamp())
    test_email = f"audit_user_{timestamp}@healthsense.ai"
    reg_data = {
        "name": "Audit User",
        "email": test_email,
        "password": "Password@1234!"
    }
    code, res, err = post_json(f"{BACKEND_URL}/auth/register", reg_data)
    
    token = None
    if code == 201 and res and "access_token" in res:
        token = res["access_token"]
        audit_results.append({
            "Module/Component": "Backend Authentication",
            "Verified Flow": "User Registration (POST /auth/register)",
            "Status": "PASSED",
            "Details/Observation": f"Registered new user '{test_email}' successfully. JWT tokens issued."
        })
    else:
        audit_results.append({
            "Module/Component": "Backend Authentication",
            "Verified Flow": "User Registration (POST /auth/register)",
            "Status": "FAILED",
            "Details/Observation": f"Registration failed with code {code}. Error: {err}"
        })

    time.sleep(2)

    # Login check with the seeded demo user
    login_data = {
        "email": "tester@healthsense.ai",
        "password": "Demo@HealthSense2026!"
    }
    code, res, err = post_json(f"{BACKEND_URL}/auth/login", login_data)
    if code == 200 and res and "access_token" in res:
        token = res["access_token"]
        audit_results.append({
            "Module/Component": "Backend Authentication",
            "Verified Flow": "Demo User Authentication (POST /auth/login)",
            "Status": "PASSED",
            "Details/Observation": "Successfully authenticated with demo user credentials. Access token retrieved."
        })
    else:
        audit_results.append({
            "Module/Component": "Backend Authentication",
            "Verified Flow": "Demo User Authentication (POST /auth/login)",
            "Status": "FAILED",
            "Details/Observation": f"Authentication failed with code {code}. Error: {err}"
        })

    time.sleep(2)

    # --- 3. User Profile Fetch ---
    if token:
        code, res, err = get_json(f"{BACKEND_URL}/user/profile", token)
        if code == 200 and res:
            audit_results.append({
                "Module/Component": "Backend User Profile",
                "Verified Flow": "Retrieve Profile Data (GET /user/profile)",
                "Status": "PASSED",
                "Details/Observation": f"Profile loaded. Name: '{res.get('name')}', Age: {res.get('age')}, Blood: {res.get('blood_type')}"
            })
        else:
            audit_results.append({
                "Module/Component": "Backend User Profile",
                "Verified Flow": "Retrieve Profile Data (GET /user/profile)",
                "Status": "FAILED",
                "Details/Observation": f"Profile fetch failed with code {code}. Error: {err}"
            })
    else:
        audit_results.append({
            "Module/Component": "Backend User Profile",
            "Verified Flow": "Retrieve Profile Data (GET /user/profile)",
            "Status": "FAILED",
            "Details/Observation": "Skipped due to authentication token failure."
        })

    time.sleep(2)

    # --- 4. Hospital Nearby Search ---
    if token:
        # Request hospital lookup
        code, res, err = get_json(f"{BACKEND_URL}/hospitals/nearby?lat=13.0827&lng=80.2707&address=Chennai", token, retries=4)
        if code == 200 and isinstance(res, list):
            audit_results.append({
                "Module/Component": "Backend Hospital Finder",
                "Verified Flow": "Nearby Hospitals Lookup (GET /hospitals/nearby)",
                "Status": "PASSED",
                "Details/Observation": f"Successfully retrieved {len(res)} nearby hospitals using coordinates and address."
            })
        else:
            audit_results.append({
                "Module/Component": "Backend Hospital Finder",
                "Verified Flow": "Nearby Hospitals Lookup (GET /hospitals/nearby)",
                "Status": "FAILED",
                "Details/Observation": f"Lookup failed with code {code}. Error: {err}"
            })
    else:
        audit_results.append({
            "Module/Component": "Backend Hospital Finder",
            "Verified Flow": "Nearby Hospitals Lookup (GET /hospitals/nearby)",
            "Status": "FAILED",
            "Details/Observation": "Skipped due to authentication token failure."
        })

    time.sleep(2.5)

    # --- 5. AI Chat integration ---
    if token:
        chat_payload = {"message": "What is hypertension?"}
        code, res, err = post_json(f"{BACKEND_URL}/chat", chat_payload, token, retries=4)
        if code == 200 and res and "reply" in res:
            audit_results.append({
                "Module/Component": "Backend AI Chat",
                "Verified Flow": "Clinical Health Assistant Query (POST /chat)",
                "Status": "PASSED",
                "Details/Observation": f"Chat integration with Gemini active. Reply length: {len(res['reply'])} chars."
            })
        else:
            audit_results.append({
                "Module/Component": "Backend AI Chat",
                "Verified Flow": "Clinical Health Assistant Query (POST /chat)",
                "Status": "FAILED",
                "Details/Observation": f"Chat query failed with code {code}. Error: {err}"
            })
    else:
        audit_results.append({
            "Module/Component": "Backend AI Chat",
            "Verified Flow": "Clinical Health Assistant Query (POST /chat)",
            "Status": "FAILED",
            "Details/Observation": "Skipped due to authentication token failure."
        })

    time.sleep(2.5)

    # --- 6. Predictions Risk Analysis ---
    prediction_id = None
    if token:
        # Create a mock 1x1 PNG file upload
        png_b64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
        png_data = base64.b64decode(png_b64)
        
        boundary = "====123456789===="
        data = []
        data.append(f"--{boundary}")
        data.append('Content-Disposition: form-data; name="disease"')
        data.append('')
        data.append("diabetes")
        data.append(f"--{boundary}")
        # Note: Must pass report.png with valid PNG bytes
        data.append('Content-Disposition: form-data; name="file"; filename="report.png"')
        data.append('Content-Type: image/png')
        data.append('')
        
        # We write raw bytes
        payload_header = "\r\n".join(data).encode("utf-8") + b"\r\n"
        payload_footer = b"\r\n--" + boundary.encode("utf-8") + b"--\r\n"
        payload_body = payload_header + png_data + payload_footer
        
        req = urllib.request.Request(f"{BACKEND_URL}/predict/report", method="POST")
        req.add_header("Content-Type", f"multipart/form-data; boundary={boundary}")
        req.add_header("Authorization", f"Bearer {token}")
        
        # Try running request with retries
        code, res_body, err = request_with_retry(req, data=payload_body, retries=4, delay=4)
        if code == 200 and res_body:
            prediction_id = res_body.get("prediction_id")
            audit_results.append({
                "Module/Component": "Backend Disease Predictor",
                "Verified Flow": "Risk Prediction from Report Upload (POST /predict/report)",
                "Status": "PASSED",
                "Details/Observation": f"Successfully analyzed mock PNG report for diabetes. Risk level: {res_body.get('probability')}% ({res_body.get('result')}). Prediction ID: {prediction_id}"
            })
        else:
            audit_results.append({
                "Module/Component": "Backend Disease Predictor",
                "Verified Flow": "Risk Prediction from Report Upload (POST /predict/report)",
                "Status": "FAILED",
                "Details/Observation": f"Prediction failed with code {code}. Error: {err or res_body}"
            })
    else:
        audit_results.append({
            "Module/Component": "Backend Disease Predictor",
            "Verified Flow": "Risk Prediction from Report Upload (POST /predict/report)",
            "Status": "FAILED",
            "Details/Observation": "Skipped due to authentication token failure."
        })

    time.sleep(2.5)

    # --- 7. Report Generator ---
    if token and prediction_id:
        report_payload = {"prediction_id": prediction_id}
        req = urllib.request.Request(f"{BACKEND_URL}/report/generate", method="POST")
        req.add_header("Content-Type", "application/json")
        req.add_header("Authorization", f"Bearer {token}")
        
        code, pdf_data, err = request_with_retry(req, data=json.dumps(report_payload).encode("utf-8"), retries=3)
        if code == 200 and isinstance(pdf_data, bytes) and pdf_data.startswith(b"%PDF"):
            audit_results.append({
                "Module/Component": "Backend Report Generator",
                "Verified Flow": "PDF Report Generation (POST /report/generate)",
                "Status": "PASSED",
                "Details/Observation": f"Successfully compiled and downloaded PDF report. File size: {len(pdf_data)} bytes."
            })
        else:
            audit_results.append({
                "Module/Component": "Backend Report Generator",
                "Verified Flow": "PDF Report Generation (POST /report/generate)",
                "Status": "FAILED",
                "Details/Observation": f"Download failed with code {code}. Response type: {type(pdf_data)}"
            })
    else:
        audit_results.append({
            "Module/Component": "Backend Report Generator",
            "Verified Flow": "PDF Report Generation (POST /report/generate)",
            "Status": "FAILED",
            "Details/Observation": "Skipped due to missing prediction id or auth failure."
        })

    # --- 8. Frontend Web Server Check ---
    try:
        with urllib.request.urlopen(f"{FRONTEND_URL}/", timeout=5) as r:
            if r.status == 200 or r.status == 304:
                audit_results.append({
                    "Module/Component": "Frontend Web Service",
                    "Verified Flow": "Local Vite Dev Server (GET /)",
                    "Status": "PASSED",
                    "Details/Observation": "React Web App is running and responding."
                })
            else:
                audit_results.append({
                    "Module/Component": "Frontend Web Service",
                    "Verified Flow": "Local Vite Dev Server (GET /)",
                    "Status": "FAILED",
                    "Details/Observation": f"Unexpected status from Vite server: {r.status}"
                })
    except Exception as e:
        audit_results.append({
            "Module/Component": "Frontend Web Service",
            "Verified Flow": "Local Vite Dev Server (GET /)",
            "Status": "FAILED",
            "Details/Observation": f"Vite server not reachable: {e}"
        })

    # --- 9. Frontend Project Files ---
    mobile_dir = r"c:\Users\yoges\OneDrive\Desktop\yog-pdd\yog-pdd\mobile"
    web_dir = r"c:\Users\yoges\OneDrive\Desktop\yog-pdd\yog-pdd\website"
    
    if os.path.exists(os.path.join(mobile_dir, "App.tsx")) and os.path.exists(os.path.join(mobile_dir, "package.json")):
        audit_results.append({
            "Module/Component": "Frontend Mobile Project Files",
            "Verified Flow": "React Native Mobile Entry Validation",
            "Status": "PASSED",
            "Details/Observation": "React Native Expo directory structure verified successfully with App.tsx and packages configuration."
        })
    else:
        audit_results.append({
            "Module/Component": "Frontend Mobile Project Files",
            "Verified Flow": "React Native Mobile Entry Validation",
            "Status": "FAILED",
            "Details/Observation": "Mobile project files are missing or incomplete."
        })

    if os.path.exists(os.path.join(web_dir, "index.html")) and os.path.exists(os.path.join(web_dir, "package.json")):
        audit_results.append({
            "Module/Component": "Frontend Web Project Files",
            "Verified Flow": "Vite Web Config Validation",
            "Status": "PASSED",
            "Details/Observation": "Vite React web directory structure verified successfully with index.html and packages configuration."
        })
    else:
        audit_results.append({
            "Module/Component": "Frontend Web Project Files",
            "Verified Flow": "Vite Web Config Validation",
            "Status": "FAILED",
            "Details/Observation": "Web project files are missing or incomplete."
        })

    # --- 10. Write Audit Report to CSV ---
    csv_file = r"c:\Users\yoges\OneDrive\Desktop\yog-pdd\yog-pdd\HealthSense_Full_System_Audit.csv"
    headers = ["Module/Component", "Verified Flow", "Status", "Details/Observation"]
    
    try:
        with open(csv_file, mode="w", newline="", encoding="utf-8") as f:
            writer = csv.DictWriter(f, fieldnames=headers)
            writer.writeheader()
            for r in audit_results:
                writer.writerow(r)
        print(f"[REPORT] Audit CSV generated: {csv_file}")
    except Exception as e:
        print(f"[ERROR] Failed to write CSV report: {e}")
        
    # Also copy to website directory
    try:
        web_csv = os.path.join(web_dir, "HealthSense_Full_System_Audit.csv")
        import shutil
        shutil.copy(csv_file, web_csv)
        print(f"[REPORT] Copied audit CSV to website folder: {web_csv}")
    except Exception as e:
        print(f"[WARNING] Could not copy CSV to website folder: {e}")
        
    # Output markdown report summary
    print("\n=== SYSTEM AUDIT RESULTS SUMMARY ===")
    passed_count = sum(1 for x in audit_results if x["Status"] == "PASSED")
    failed_count = len(audit_results) - passed_count
    print(f"Total Audited Points: {len(audit_results)}")
    print(f"PASSED: {passed_count}")
    print(f"FAILED: {failed_count}")
    print("====================================")

if __name__ == "__main__":
    main()
