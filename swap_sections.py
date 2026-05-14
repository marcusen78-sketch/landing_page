import sys

file_path = r"c:\Users\USUARIO\Desktop\Lading_page\app\ScrollCanvas.tsx"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

part1_start = content.find("{/* Section: Investment & Ask */}")
part2_start = content.find("<div ref={(el) => { revealRefs.current[5] = el; }} className=\"reveal w-full max-w-6xl px-6 py-24 text-center border-b border-white/5\">")
part2_end = content.find("{/* Section 6: The Demo (Bottom CTA) */}")

if part1_start == -1 or part2_start == -1 or part2_end == -1:
    print("Error finding sections")
    sys.exit(1)

part1 = content[part1_start:part2_start]
part2 = content[part2_start:part2_end]

# Update reveal refs
part1 = part1.replace("revealRefs.current[4]", "revealRefs.current[5]")
part2 = part2.replace("revealRefs.current[5]", "revealRefs.current[4]")

# Add new sponsor to part2
sponsor_html = """
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
"""

insert_pos = part2.rfind("          </div>\n        </div>")
if insert_pos == -1:
    print("Error finding sponsor insert position. Fallback to trying another.")
    insert_pos = part2.rfind("</div>\n        </div>")
    if insert_pos == -1:
        print("Still error finding sponsor insert pos")
        sys.exit(1)

part2 = part2[:insert_pos] + sponsor_html + part2[insert_pos:]

new_content = content[:part1_start] + part2 + part1 + content[part2_end:]

with open(file_path, "w", encoding="utf-8") as f:
    f.write(new_content)

print("Swapped successfully")
