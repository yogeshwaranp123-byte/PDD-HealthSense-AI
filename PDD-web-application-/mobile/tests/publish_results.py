import os
import openpyxl

def parse_e2e_report(filepath):
    wb = openpyxl.load_workbook(filepath, data_only=True)
    
    # Parse Summary
    ws_summary = wb['Summary']
    summary_dict = {}
    for r in ws_summary.values:
        if r and len(r) >= 2 and r[0] is not None:
            key = str(r[0]).strip()
            val = r[1]
            summary_dict[key] = val
            
    # Parse Details
    ws_details = wb['All Test Cases']
    detail_rows = list(ws_details.values)
    detail_headers = [str(h) for h in detail_rows[0]]
    details = []
    for r in detail_rows[1:]:
        if r and r[0] is not None:
            details.append(dict(zip(detail_headers, r)))
            
    return summary_dict, details

def parse_security_report(filepath):
    wb = openpyxl.load_workbook(filepath, data_only=True)
    
    # Parse Summary
    ws_summary = wb['Summary']
    rows = list(ws_summary.values)
    headers = [str(h) for h in rows[0]]
    data = rows[1]
    summary_dict = dict(zip(headers, data))
    
    # Parse Details
    ws_details = wb['All Findings']
    detail_rows = list(ws_details.values)
    detail_headers = [str(h) for h in detail_rows[0]]
    details = []
    for r in detail_rows[1:]:
        if r and r[0] is not None:
            details.append(dict(zip(detail_headers, r)))
            
    return summary_dict, details

def main():
    import sys
    if hasattr(sys.stdout, 'reconfigure'):
        sys.stdout.reconfigure(encoding='utf-8', errors='replace')

    tests_dir = os.path.dirname(os.path.abspath(__file__))
    repo_root = os.path.dirname(tests_dir)
    
    # Paths to the reports relative to the mobile repository root
    e2e_path = os.path.join(repo_root, "report", "E2E_Appium_Report_HealthSense_2026-06-11T20-15-33.xlsx")
    sec_path = os.path.join(repo_root, "report", "Security_Vulnerability_Report_2026-06-11T07-29-57.xlsx")
    
    e2e_summary, e2e_details = parse_e2e_report(e2e_path)
    sec_summary, sec_details = parse_security_report(sec_path)
    
    markdown_output = []
    markdown_output.append("# 🧪 HealthSense Automated Test Verification Dashboard\n")
    markdown_output.append("This dashboard displays the test and vulnerability results verified from the completed execution reports.\n")
    
    # E2E Test Suite Summary
    markdown_output.append("## 🌿 E2E Test Suite Summary")
    markdown_output.append("| Metric | Value |")
    markdown_output.append("|---|---|")
    markdown_output.append(f"| **Test Suite** | {e2e_summary.get('Test Suite')} |")
    markdown_output.append(f"| **Total Test Cases** | {e2e_summary.get('Total Tests')} |")
    markdown_output.append(f"| **Passed** | ✅ {e2e_summary.get('Passed')} |")
    markdown_output.append(f"| **Failed** | ❌ {e2e_summary.get('Failed')} |")
    
    pass_rate = str(e2e_summary.get('Pass Rate', ''))
    if '%' not in pass_rate:
        pass_rate = f"{pass_rate}%"
    markdown_output.append(f"| **Pass Rate** | **{pass_rate}** |")
    markdown_output.append(f"| **Duration** | {e2e_summary.get('Total Duration')} |")
    markdown_output.append(f"| **Timestamp** | {e2e_summary.get('End Time')} |")
    markdown_output.append("\n")
    
    # Security Vulnerability Summary
    sec_suite = str(sec_summary.get('Report Suite', '')).replace('', '-')
    markdown_output.append("## 🛡️ Backend Security Verification Summary")
    markdown_output.append("| Metric | Value |")
    markdown_output.append("|---|---|")
    markdown_output.append(f"| **Report Suite** | {sec_suite} |")
    markdown_output.append(f"| **Total Findings** | {sec_summary.get('Total Findings')} |")
    markdown_output.append(f"| **Fixed** | ✅ {sec_summary.get('Fixed')} |")
    markdown_output.append(f"| **Documented** | 📄 {sec_summary.get('Documented')} |")
    
    sec_fix_rate = str(sec_summary.get('Fix Rate %', ''))
    if '%' not in sec_fix_rate:
        sec_fix_rate = f"{sec_fix_rate}%"
    markdown_output.append(f"| **Fix Rate** | **{sec_fix_rate}** |")
    markdown_output.append(f"| **Severity Breakdown** | 🔴 Critical: {sec_summary.get('Critical')}  •  🟠 High: {sec_summary.get('High')}  •  🟡 Medium: {sec_summary.get('Medium')}  •  🔵 Low: {sec_summary.get('Low')} |")
    markdown_output.append(f"| **Timestamp** | {sec_summary.get('Generated At')} |")
    markdown_output.append("\n")
    
    # E2E Details Expandable Section
    markdown_output.append("### 📋 E2E Test Cases Detail Breakdowns")
    markdown_output.append(f"<details><summary>Click to view all E2E Test Cases ({len(e2e_details)} tests)</summary>\n")
    markdown_output.append("| No. | Category | Test Name | Status |")
    markdown_output.append("|---|---|---|---|")
    for r in e2e_details:
        status_emoji = "✅ PASSED" if r.get("Status") == "PASSED" else "❌ FAILED"
        markdown_output.append(f"| {r.get('No.')} | {r.get('Category')} | `{r.get('Test Name')}` | {status_emoji} |")
    markdown_output.append("\n</details>\n")
    
    # Security Details Expandable Section
    markdown_output.append("### 🔐 Security Vulnerabilities Detail Breakdowns")
    markdown_output.append(f"<details><summary>Click to view all Security Findings ({len(sec_details)} findings)</summary>\n")
    markdown_output.append("| Ref No. | Severity | Category | File / Location | Vulnerability Type | Status |")
    markdown_output.append("|---|---|---|---|---|---|")
    for r in sec_details:
        status_emoji = "✅ FIXED" if r.get("Status") == "FIXED" else "⚠️ OPEN"
        markdown_output.append(f"| {r.get('No.')} | {r.get('Severity')} | {r.get('Category')} | `{r.get('File / Location')}` | {r.get('Vulnerability Type')} | {status_emoji} |")
    markdown_output.append("\n</details>\n")
    
    markdown_output.append("## 📦 Downloadable Test Report Artifacts")
    markdown_output.append("The full Excel spreadsheets (`.xlsx`) containing detailed worksheets (passed tests, failed tests, execution logs, and tracebacks) are uploaded as artifacts for this workflow run and can be downloaded from the **Artifacts** section at the top of the page.")
    
    full_markdown = "\n".join(markdown_output)
    
    # Write to GITHUB_STEP_SUMMARY
    summary_file = os.environ.get("GITHUB_STEP_SUMMARY")
    if summary_file:
        with open(summary_file, "w", encoding="utf-8") as f:
            f.write(full_markdown)
        print("Successfully published test results to GitHub Step Summary!")
    else:
        print(full_markdown)

if __name__ == "__main__":
    main()
