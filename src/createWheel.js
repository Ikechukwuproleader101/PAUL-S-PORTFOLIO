const NS = "http://www.w3.org/2000/svg";
const el = (name, attrs = {}) => {
  const n = document.createElementNS(NS, name);
  for (const k in attrs) n.setAttribute(k, attrs[k]);
  return n;
};

// FLAT colors only. No gradients. Sample the real tones from the camera photo
// next to the wheel and pick the closest palette.
export const WHEEL_PALETTES = {
  chrome: { edge: "#8c8c8c", face: "#d9d9d9", mark: "#1f1f1f", hubRing: "#6b6b6b", hub: "#f2f2f2", accent: "#b50d0d" },
  black:  { edge: "#1f1f1f", face: "#3a3a3a", mark: "#ffffff", hubRing: "#1f1f1f", hub: "#d9d9d9", accent: "#b50d0d" },
};

export function createWheel({ teeth = 48, ticks = 60, numerals = [], palette = "chrome" } = {}) {
  const c = WHEEL_PALETTES[palette] || WHEEL_PALETTES.chrome;
  const svg = el("svg", { viewBox: "-100 -100 200 200", "aria-hidden": "true", focusable: "false" });

  // 1. Knurled edge: alternating outer / inner radius forms the teeth
  const R1 = 99, R2 = 93;
  let d = "";
  for (let i = 0; i < teeth * 2; i++) {
    const r = i % 2 ? R2 : R1;
    const a = (i / (teeth * 2)) * Math.PI * 2;
    d += (i ? "L" : "M") + (Math.sin(a) * r).toFixed(2) + " " + (-Math.cos(a) * r).toFixed(2);
  }
  svg.appendChild(el("path", { d: d + "Z", fill: c.edge }));

  // 2. Face
  svg.appendChild(el("circle", { r: 88, fill: c.face }));

  // 3. Tick ring: a longer tick every 5th mark
  for (let i = 0; i < ticks; i++) {
    const major = i % 5 === 0;
    svg.appendChild(el("line", {
      x1: 0, y1: major ? -62 : -66, x2: 0, y2: -74,
      stroke: c.mark, "stroke-width": major ? 2 : 1,
      transform: `rotate(${(i / ticks) * 360})`,
    }));
  }

  // 4. Numerals (optional), set tangent to the ring so they turn with the wheel
  numerals.forEach((txt, i) => {
    const a = (i / numerals.length) * Math.PI * 2;
    const x = Math.sin(a) * 52, y = -Math.cos(a) * 52;
    const t = el("text", {
      x: x.toFixed(2), y: (y + 3.5).toFixed(2), "text-anchor": "middle",
      fill: c.mark, "font-size": 10, "font-family": "inherit",
      transform: `rotate(${(a * 180) / Math.PI} ${x.toFixed(2)} ${y.toFixed(2)})`,
    });
    t.textContent = txt;
    svg.appendChild(t);
  });

  // 5. Hub, with a screw slot
  svg.appendChild(el("circle", { r: 36, fill: c.hubRing }));
  svg.appendChild(el("circle", { r: 26, fill: c.hub }));
  svg.appendChild(el("rect", { x: -16, y: -2.5, width: 32, height: 5, fill: c.mark }));

  // 6. Red index dot: this is what makes the rotation readable
  svg.appendChild(el("circle", { cx: 0, cy: -81, r: 4, fill: c.accent }));

  return svg;
}
