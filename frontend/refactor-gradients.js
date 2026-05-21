const fs = require('fs');
const file = 'c:/laragon/www/Pastil ni Liling/frontend/components/admin/analytics/SpokesAndFlavors.tsx';

if (fs.existsSync(file)) {
  let content = fs.readFileSync(file, 'utf8');
  
  // 1. Remove bubble gradients
  content = content.replace(
    /'bg-gradient-to-br from-emerald-400 to-teal-600 text-white shadow-emerald-500\/25 border-emerald-300'/g,
    "'bg-emerald-50 text-emerald-700 shadow-sm border-emerald-200'"
  );
  content = content.replace(
    /'bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-orange-500\/25 border-orange-300'/g,
    "'bg-amber-50 text-amber-700 shadow-sm border-amber-200'"
  );
  content = content.replace(
    /'bg-gradient-to-br from-rose-400 to-red-600 text-white shadow-red-500\/25 border-red-300'/g,
    "'bg-rose-50 text-rose-700 shadow-sm border-rose-200'"
  );

  // 2. Remove card gradients
  content = content.replace(
    /bg-gradient-to-br from-gray-50\/50 to-white shadow-inner/g,
    "bg-white shadow-sm"
  );
  
  content = content.replace(
    /bg-gradient-to-br from-gray-50\/50 to-white/g,
    "bg-white"
  );

  // 3. Remove progress bar gradient
  content = content.replace(
    /bg-gradient-to-r from-brand-yellow\/80 to-brand-green/g,
    "bg-brand-green"
  );

  fs.writeFileSync(file, content);
  console.log('Gradients refactored successfully.');
} else {
  console.log('File not found.');
}
