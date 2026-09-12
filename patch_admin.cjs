const fs = require('fs');
const file = 'src/components/admin/AdminDashboard.tsx';
let content = fs.readFileSync(file, 'utf8');

// Add state
content = content.replace(
    "const [festPodiumCategory, setFestPodiumCategory] = useState<'arts' | 'sports'>(",
    "const [festCelebrationMode, setFestCelebrationMode] = useState(Boolean(festConfig?.isCelebrationMode));\n  const [festPodiumCategory, setFestPodiumCategory] = useState<'arts' | 'sports'>("
);

// Sync state
content = content.replace(
    "setFestPodiumCategory(festConfig.podiumCategory === 'sports' ? 'sports' : 'arts');",
    "setFestPodiumCategory(festConfig.podiumCategory === 'sports' ? 'sports' : 'arts');\n      setFestCelebrationMode(Boolean(festConfig.isCelebrationMode));"
);

// Save state
content = content.replace(
    "podiumCategory: festPodiumCategory,",
    "podiumCategory: festPodiumCategory,\n      isCelebrationMode: festCelebrationMode,"
);

// Add UI toggle
const uiToAdd = `
              <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-xl">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Celebration Mode</h3>
                  <p className="text-xs text-slate-500 mt-0.5">When ON, visitors will see a 7-second fireworks celebration.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={festCelebrationMode}
                    onChange={(e) => setFestCelebrationMode(e.target.checked)}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
              </div>
`;

content = content.replace(
    "            <form onSubmit={handleSaveFestSettings} className=\"space-y-5\">",
    "            <form onSubmit={handleSaveFestSettings} className=\"space-y-5\">\n" + uiToAdd
);

fs.writeFileSync(file, content);
console.log('patched admin dashboard');
