const fs = require('fs');

const filePath = "app/ScrollCanvas.tsx";
const content = fs.readFileSync(filePath, 'utf8');

const part1Start = content.indexOf("{/* Section: Investment & Ask */}");
const part2Start = content.indexOf('<div ref={(el) => { revealRefs.current[5] = el; }}');
const part2End = content.indexOf("{/* Section 6: The Demo (Bottom CTA) */}");

if (part1Start === -1 || part2Start === -1 || part2End === -1) {
    console.error("Error finding sections");
    process.exit(1);
}

let part1 = content.slice(part1Start, part2Start);
let part2 = content.slice(part2Start, part2End);

// Swap the refs
part1 = part1.replace("revealRefs.current[4]", "revealRefs.current[5]");
part2 = part2.replace("revealRefs.current[5]", "revealRefs.current[4]");

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

// In part2, find where Sanitas block ends
const sanitasEnd = part2.indexOf("Clinical Support\r\n              </span>\r\n            </div>");
if (sanitasEnd === -1) {
    // try \n instead of \r\n
    const sanitasEnd2 = part2.indexOf("Clinical Support\n              </span>\n            </div>");
    if(sanitasEnd2 === -1) {
        console.error("Cannot find end of Sanitas block");
        process.exit(1);
    }
    const insertPos = sanitasEnd2 + "Clinical Support\n              </span>\n            </div>".length;
    part2 = part2.slice(0, insertPos) + "\n" + sponsorHtml + part2.slice(insertPos);
} else {
    const insertPos = sanitasEnd + "Clinical Support\r\n              </span>\r\n            </div>".length;
    part2 = part2.slice(0, insertPos) + "\n" + sponsorHtml + part2.slice(insertPos);
}


// Now reconstruct
const newContent = content.slice(0, part1Start) + part2 + part1 + content.slice(part2End);

fs.writeFileSync(filePath, newContent, 'utf8');
console.log("Swapped successfully");
