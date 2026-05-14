const fs = require('fs');
const filePath = 'app/ScrollCanvas.tsx';
let c = fs.readFileSync(filePath, 'utf8');

const p1 = c.indexOf('{/* Section: Investment & Ask */}');
const p2 = c.indexOf('<div ref={(el) => { revealRefs.current[5] = el; }}');
const p2End = c.indexOf('{/* Section 6: The Demo (Bottom CTA) */}');

if (p1 === -1 || p2 === -1 || p2End === -1) {
    console.error("Error finding sections");
    process.exit(1);
}

let part1 = c.slice(p1, p2);
let part2 = c.slice(p2, p2End);

part1 = part1.replace('revealRefs.current[4]', 'revealRefs.current[5]');
part2 = part2.replace('revealRefs.current[5]', 'revealRefs.current[4]');

const sponsorHtml = `
            {/* Partner 5: Oakley Capital Limited (NEW) */}
            <div className="flex flex-col items-center justify-center p-8 border border-white/10 rounded-2xl bg-white/5 hover:bg-white/8 hover:border-amber-500/40 transition-all duration-500 group">
              <div className="h-24 w-full flex items-center justify-center mb-6">
                <img src="/oakley.png" alt="Oakley Capital Limited" className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300" />
              </div>
              <h4 className="text-white font-semibold text-base text-center mb-2">Oakley Capital Limited</h4>
              <span className="text-xs md:text-sm text-amber-400 font-semibold tracking-wider uppercase">
                Entrepreneurship Support
              </span>
            </div>
`;

// Replace Sanitas with Bupa
part2 = part2.replace('img src="/sanitas.png" alt="Sanitas"', 'img src="/bupa.png" alt="Bupa Group"');
part2 = part2.replace('<h4 className="text-white font-semibold text-base text-center mb-2">Sanitas</h4>', '<h4 className="text-white font-semibold text-base text-center mb-2">Bupa Group</h4>');
part2 = part2.replace('{/* Partner 4: Sanitas (NEW) */}', '{/* Partner 4: Bupa Group (NEW) */}');

// Insert Oakley after Bupa block.
// Bupa block ends with </div> just before the closing tag of the grid.
const insertIdx = part2.lastIndexOf('          </div>\r\n        </div>');
if (insertIdx !== -1) {
    part2 = part2.slice(0, insertIdx) + sponsorHtml + part2.slice(insertIdx);
} else {
    const insertIdx2 = part2.lastIndexOf('          </div>\n        </div>');
    if (insertIdx2 !== -1) {
        part2 = part2.slice(0, insertIdx2) + sponsorHtml + part2.slice(insertIdx2);
    } else {
        console.error("Failed to find insertion point");
        process.exit(1);
    }
}

c = c.slice(0, p1) + part2 + part1 + c.slice(p2End);
fs.writeFileSync(filePath, c, 'utf8');
console.log("Successfully swapped sections, added Oakley, and replaced Sanitas with Bupa.");
