export const alpha = (hex, alph) => `${hex}${Math.floor(alph * 255).toString(16).padStart(2, 0)}` 

const coerce = (color) => (color < 255 ? (color < 1 ? 0 : color) : 255)

export function shadeColor(color, percent) {
  var num = parseInt(color.replace("#",""),16),
  amt = Math.round(2.55 * percent),
  R = (num >> 16) + amt,
  B = (num >> 8 & 0x00FF) + amt,
  G = (num & 0x0000FF) + amt;

  return "#" + (0x1000000 + coerce(R) * 0x10000 + coerce(B) * 0x100 + coerce(G)).toString(16).slice(1);
}