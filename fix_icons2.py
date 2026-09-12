import os

REPLACEMENTS = {
    "SettingsIcon": "Settings01Icon",
    "UploadIcon": "Upload01Icon",
    "CopyIcon": "Copy01Icon",
    "CheckIcon": "Tick01Icon",
    "LogOutIcon": "Logout01Icon",
    "EyeOffIcon": "ViewOffIcon",
    "ArrowLeftIcon": "ArrowLeft01Icon",
    "TaskIcon": "ListViewIcon",
    "FolderCheckIcon": "FolderCheck01Icon"
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
