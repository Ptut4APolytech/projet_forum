const colors = [
  "#EA5B0C",
  "#0060A1",
  "#EC6084",
  "#5E8C2C",
  "#BF1C39",
  "#1A6550",
  "#9C9661",
  "#D0C900",
  "#951B81",
  "#FDC300",
  "#C0087F",
  "#5CAE7B",
  "#F3997A",
  "#223F78",
  "#952456",
  "#8B7973",
  "#FDCB61",
  "#98A91A",
  "#F39200",
  "#4E4C58",
  "#E40134",
  "#1A5468",
  "#BC5980",
  "#312783",
  "#4E4180",
  "#438456",
  "#662483",
  "#FADBEA",
]

export function getColorByIndex (index) {
  // let h = (index * 127 + 239) % 360
  // let s = 82 // h > 30 && h < 200 ? 85 : 100
  // let l = 65 // h > 30 && h < 200 ? 60 : 65
  return colors[index % colors.length]
  // return hslToHex(h, s, l)
}
/*
function hslToHex (h, s, l) {
  l /= 100
  const a = s * Math.min(l, 1 - l) / 100
  const f = n => {
    const k = (n + h / 30) % 12
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1)
    return Math.round(255 * color).toString(16).padStart(2, '0')   // convert to Hex and prefix "0" if needed
  }
  return `#${f(0)}${f(8)}${f(4)}`
}
*/
