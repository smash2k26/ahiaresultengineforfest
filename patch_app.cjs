const fs = require('fs');
const file = 'src/App.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
    "import { ToastContainer } from './components/ui/ToastContainer';",
    "import { ToastContainer } from './components/ui/ToastContainer';\nimport { CelebrationFireworks } from './components/ui/CelebrationFireworks';"
);

content = content.replace(
    "      {/* Toast Notifications */}",
    "      <CelebrationFireworks />\n      {/* Toast Notifications */}"
);

fs.writeFileSync(file, content);
console.log('patched app');
