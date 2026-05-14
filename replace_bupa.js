const fs = require('fs');
const file = 'app/ScrollCanvas.tsx';
let c = fs.readFileSync(file, 'utf8');

c = c.replace(
  'img src="/sanitas.png" alt="Sanitas"',
  'img src="/bupa.png" alt="Bupa Group"'
);

c = c.replace(
  '<h4 className="text-white font-semibold text-base text-center mb-2">Sanitas</h4>',
  '<h4 className="text-white font-semibold text-base text-center mb-2">Bupa Group</h4>'
);

c = c.replace(
  '{/* Partner 4: Sanitas (NEW) */}',
  '{/* Partner 4: Bupa Group (NEW) */}'
);

fs.writeFileSync(file, c);
