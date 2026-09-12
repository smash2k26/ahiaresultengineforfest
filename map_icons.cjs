const fs = require('fs');
const dts = fs.readFileSync('node_modules/@hugeicons/react/dist/types/HugeiconsIcon.d.ts', 'utf8').catch(() => fs.readFileSync('node_modules/hugeicons-react/dist/hugeicons-react.d.ts', 'utf8'));

// we can just read hugeicons-react.d.ts
const text = fs.readFileSync('node_modules/hugeicons-react/dist/hugeicons-react.d.ts', 'utf8');
const regex = /declare const ([A-Za-z0-9_]+Icon):/g;
const icons = [];
let match;
while ((match = regex.exec(text)) !== null) {
  icons.push(match[1]);
}
fs.writeFileSync('hugeicons_list.json', JSON.stringify(icons));
