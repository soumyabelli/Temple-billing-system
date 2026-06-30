import sys
import re

file_path = 'src/pages/staff/StaffDashboard.jsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Remove the unused poojaSupport variables
start_str = 'const poojaSupportTasks = useMemo(() => {'
end_str = '}, [activeSection, tasks, poojaSupportTasks]);'

start_idx = content.find(start_str)
end_idx = content.find(end_str, start_idx)

if start_idx != -1 and end_idx != -1:
    end_idx += len(end_str)
    # also remove the 'useEffect(() => {\n    if (activeSection === "poojaSupport" && poojaSupportTasks.length > 0) {'
    # which is included between these lines.
    content = content[:start_idx] + content[end_idx:]

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print('Done removing unused variables')
