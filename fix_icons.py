import os
import re

REPLACEMENTS = {
    "Trophy01Icon": "Award01Icon",
    "Activity01Icon": "Activity02Icon", # Wait, I don't know if Activity01Icon exists
    "PaintBoardIcon": "BrushIcon",
    "ShieldTickIcon": "Shield02Icon",
    "CheckmarkCircle01Icon": "Tick01Icon",
    "TrendingUp01Icon": "ArrowUpRight01Icon",
    "MenuIcon": "Menu01Icon",
    "BellIcon": "Notification01Icon",
    "RefreshCwIcon": "RefreshIcon",
    "FileSpreadsheetIcon": "File02Icon",
    "ChevronLeftIcon": "ArrowLeft01Icon",
    "UserCheckIcon": "UserCheck01Icon",
    "BarChart2Icon": "BarChartIcon",
    "MedalIcon": "Award02Icon",
    "ListIcon": "TaskIcon",
    "Building2Icon": "Building02Icon",
    "ShieldWarningIcon": "Alert01Icon",
    "ImageIcon": "Image01Icon",
    "LayersIcon": "Layers01Icon",
    "Share2Icon": "Share01Icon",
    "FileCheckIcon": "FolderCheckIcon",
    "RotateCcwIcon": "ReloadIcon",
    "Edit2Icon": "Edit02Icon",
    "Trash2Icon": "Delete01Icon",
    "PlusIcon": "Add01Icon",
    "SaveIcon": "FloppyDiskIcon"
}

def process_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    new_content = content
    for old, new in REPLACEMENTS.items():
        new_content = new_content.replace(old, new)

    if new_content != content:
        with open(filepath, 'w') as f:
            f.write(new_content)
        print(f"Fixed {filepath}")

for root, dirs, files in os.walk('src'):
    for file in files:
        if file.endswith(('.tsx', '.ts', '.jsx', '.js')):
            process_file(os.path.join(root, file))
