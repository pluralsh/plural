export function intersectRect(r1, r2) {
  return !(r2.left > r1.right ||
           r2.right < r1.left ||
           r2.top > r1.bottom ||
           r2.bottom < r1.top);
}

export function formatLocation(country, city) {
  if (!country) return ''
  if (!city) return country
  return `${city} / ${country}`
}