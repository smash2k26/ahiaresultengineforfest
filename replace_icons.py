import os
import re

# List of lucide icons used
LUCIDE_ICONS = [
    "Activity", "AlertCircle", "AlertTriangle", "ArrowDown", "ArrowRight", "ArrowUp",
    "Award", "BookOpen", "Calendar", "CheckCircle2", "ChevronRight", "Clock", "Crown",
    "Download", "ExternalLink", "FileDown", "FileText", "Filter", "Flame", "Heart",
    "HelpCircle", "Home", "ImageIcon", "Info", "Key", "Lock", "Mail", "MapPin", "Megaphone",
    "Minus", "Palette", "Phone", "Printer", "QrCode", "Radio", "Search", "Shield",
    "ShieldAlert", "ShieldCheck", "Sparkles", "TrendingUp", "Trophy", "User", "Users", "Video", "X"
]

# Provide a manual map for best fit
MAPPING = {
    "Activity": "Activity01Icon",
    "AlertCircle": "Alert01Icon",
    "AlertTriangle": "Alert02Icon",
    "ArrowDown": "ArrowDown01Icon",
    "ArrowRight": "ArrowRight01Icon",
    "ArrowUp": "ArrowUp01Icon",
    "Award": "Award01Icon",
    "BookOpen": "BookOpen01Icon",
    "Calendar": "Calendar01Icon",
    "CheckCircle2": "CheckmarkCircle01Icon",
    "ChevronRight": "ArrowRight01Icon",
    "Clock": "Clock01Icon",
    "Crown": "CrownIcon",
    "Download": "Download01Icon",
    "ExternalLink": "LinkSquare01Icon",
    "FileDown": "FileDownloadIcon",
    "FileText": "File01Icon",
    "Filter": "FilterIcon",
    "Flame": "FireIcon",
    "Heart": "FavouriteIcon",
    "HelpCircle": "HelpCircleIcon",
    "Home": "Home01Icon",
    "ImageIcon": "ImageIcon",
    "Info": "InformationCircleIcon",
    "Key": "Key01Icon",
    "Lock": "LockIcon",
    "Mail": "Mail01Icon",
    "MapPin": "Location01Icon",
    "Megaphone": "Megaphone01Icon",
    "Minus": "MinusSignIcon",
    "Palette": "PaintBoardIcon",
    "Phone": "CallIcon",
    "Printer": "PrinterIcon",
    "QrCode": "QrCodeIcon",
    "Radio": "RadioIcon",
    "Search": "Search01Icon",
    "Shield": "Shield01Icon",
    "ShieldAlert": "ShieldWarningIcon",
    "ShieldCheck": "ShieldTickIcon",
    "Sparkles": "SparklesIcon",
    "TrendingUp": "TrendingUp01Icon",
    "Trophy": "Trophy01Icon",
    "User": "UserIcon",
    "Users": "UserGroupIcon",
    "Video": "Video01Icon",
    "X": "Cancel01Icon"
}

def process_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    # Find lucide imports
    import_pattern = r"import\s+\{([^}]+)\}\s+from\s+['\"]lucide-react['\"]"
    
    def replacer(match):
        imported_items = match.group(1).split(',')
        new_imports = []
        for item in imported_items:
            item = item.strip()
            if not item:
                continue
            
            # Handle aliases like 'Image as ImageIcon'
            alias_match = re.search(r"(\w+)\s+as\s+(\w+)", item)
            if alias_match:
                orig_name = alias_match.group(1)
                alias_name = alias_match.group(2)
                mapped_name = MAPPING.get(orig_name, orig_name + "Icon")
                new_imports.append(f"{mapped_name} as {alias_name}")
            else:
                mapped_name = MAPPING.get(item, item + "Icon")
                new_imports.append(mapped_name)
        
        return "import { " + ", ".join(new_imports) + " } from 'hugeicons-react'"

    new_content = re.sub(import_pattern, replacer, content)

    # Now we need to replace component names in the JSX if they weren't aliased.
    # To do this safely, we should actually change the JSX tags.
    # But wait! If we just change the import names, we need to change the JSX tags too.
    # Actually, it's easier to alias them in the import!
    # import { Activity01Icon as Activity } from 'hugeicons-react'
    
    def aliasing_replacer(match):
        imported_items = match.group(1).split(',')
        new_imports = []
        for item in imported_items:
            item = item.strip()
            if not item:
                continue
            
            alias_match = re.search(r"(\w+)\s+as\s+(\w+)", item)
            if alias_match:
                orig_name = alias_match.group(1)
                alias_name = alias_match.group(2)
                mapped_name = MAPPING.get(orig_name, orig_name + "Icon")
                new_imports.append(f"{mapped_name} as {alias_name}")
            else:
                mapped_name = MAPPING.get(item, item + "Icon")
                new_imports.append(f"{mapped_name} as {item}")
        
        return "import { " + ", ".join(new_imports) + " } from 'hugeicons-react'"
        
    new_content_with_aliases = re.sub(import_pattern, aliasing_replacer, content)
    
    if new_content_with_aliases != content:
        with open(filepath, 'w') as f:
            f.write(new_content_with_aliases)
        print(f"Updated {filepath}")

for root, dirs, files in os.walk('src'):
    for file in files:
        if file.endswith(('.tsx', '.ts', '.jsx', '.js')):
            process_file(os.path.join(root, file))

