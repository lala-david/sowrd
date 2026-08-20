/* 스크린샷 인상 측정 — CLAUDE.md: "화면 인상을 바꿨으면 평균 채도·명도 폭·찬 색 비율을 전후로 비교"
 * 사용: node analyze-shot.mjs <png> [<png> ...]  (프로젝트의 sharp 사용) */
import sharp from 'sharp'

for (const file of process.argv.slice(2)) {
  const { data, info } = await sharp(file).resize({ width: 400 }).raw().toBuffer({ resolveWithObject: true })
  const n = info.width * info.height
  let satSum = 0
  let coolChromatic = 0
  let chromatic = 0
  const lum = new Float64Array(n)
  for (let i = 0; i < n; i++) {
    const r = data[i * info.channels] / 255
    const g = data[i * info.channels + 1] / 255
    const b = data[i * info.channels + 2] / 255
    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)
    const l = (max + min) / 2
    lum[i] = l
    const d = max - min
    /* HSV 채도(d/max) — HSL은 밝은 따뜻한 색(양피지)을 과대측정한다.
     * 실측: sand(#f7ecd5)가 HSL로 0.68, HSV로 0.14 — 앱 화면들의 기존 측정치(0.12~0.15)는 HSV다. */
    const s = max === 0 ? 0 : d / max
    satSum += s
    if (d > 0.04) {
      chromatic++
      let h = 0
      if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6
      else if (max === g) h = ((b - r) / d + 2) / 6
      else h = ((r - g) / d + 4) / 6
      const deg = h * 360
      if (deg >= 90 && deg <= 330) coolChromatic++ // 초록~파랑~보라
    }
  }
  const sorted = Float64Array.from(lum).sort()
  const p = (q) => sorted[Math.min(n - 1, Math.floor(q * n))]
  const width = Math.round((p(0.95) - p(0.05)) * 255)
  console.log(
    `${file}\n  평균 채도 ${(satSum / n).toFixed(3)} · 명도 폭(p5~p95) ${width} · ` +
      `유채색 중 찬 색 ${chromatic ? ((coolChromatic / chromatic) * 100).toFixed(1) : '0'}% (유채색 ${((chromatic / n) * 100).toFixed(1)}%)`,
  )
}
