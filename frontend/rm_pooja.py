import sys
import re

file_path = 'src/pages/staff/StaffDashboard.jsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Remove nav button
nav_pattern = r'\s*<button\s+type="button"\s+className={activeSection === "poojaSupport" \? "nav-item active" : "nav-item"}\s+onClick={\(\) => setActiveSection\("poojaSupport"\)}\s*>\s*<MdTempleHindu /> Pooja Support\s*</button>'
content = re.sub(nav_pattern, '', content, count=1)

# 2. Remove validSections
valid_sections = 'const validSections = new Set(["dashboard", "duties", "leaveRequests", "applyLeave", "notifications", "profile", "inventory", "poojaSupport"]);'
new_valid_sections = 'const validSections = new Set(["dashboard", "duties", "leaveRequests", "applyLeave", "notifications", "profile", "inventory"]);'
content = content.replace(valid_sections, new_valid_sections)

# 3. Remove pooja-support-page rendering block
# Find start
start_str = '{!loading && activeSection === "poojaSupport" ? ('
start_idx = content.find(start_str)
if start_idx != -1:
    # Find matching closing
    # The block ends with ) : null}
    # To be safe, we can find the next {!loading && activeSection === "leaveRequests" ? (
    end_str = '{!loading && activeSection === "leaveRequests" ? ('
    end_idx = content.find(end_str, start_idx)
    if end_idx != -1:
        # We want to remove everything from start_idx up to end_idx, but leave end_str
        # Let's see if there's whitespace before end_str
        sub_content = content[start_idx:end_idx]
        # let's just replace the slice
        content = content[:start_idx] + content[end_idx:]

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print('Done')
