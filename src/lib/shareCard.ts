/* ── 공유 카드 렌더러 (Canvas → PNG) ──────────────────────────────────────
 * "The Illuminated Path" 결을 그대로 카드로: 따뜻한 샌드 + 얼굴 없는 아트 +
 * Versal 성구 + 거대 거리 숫자. 인스타/스레드 4:5 세로 카드.
 *
 * 프라이버시(문서 SOCIAL-SHARE §프라이버시 · PLANNING §11):
 *   GPS 경로·좌표·기도 대상은 절대 카드에 넣지 않는다. 자리·성구·거리만.
 * 렌더는 CSS와 독립이라 팔레트/폰트를 여기서 고정한다(라이트 토큰과 일치). */

const PAL = {
  sand: '#f4ead7',
  sandRaised: '#fbf4e7',
  sandSunk: '#ebe0cd',
  ink: '#2c2118',
  inkSoft: '#5f4f3f',
  muted: '#978878',
  line: '#e6d9c2',
  clay: '#c05a30',
  clayDeep: '#9c4522',
  sunDeep: '#a5731c',
} as const

const SERIF = "'Gowun Batang', 'Nanum Myeongjo', serif"
const DISPLAY = "'Newsreader', 'Gowun Batang', Georgia, serif"

export interface ShareCardData {
  place: string
  title: string
  verseText?: string
  verseRef?: string
  distanceLabel: string // 이미 단위 변환된 숫자 문자열 (예: "3.24")
  unit: string // "KM" / "MI"
  ordinal?: number // 닿은 자리 순번 (celebrate일 때만)
  courseName: string
  heroSrc: string
  accent?: string // tone.accent (없으면 clay)
  celebrate: boolean
  attribution: string
  /** "여기서 함께 걷기" 설치 링크(스킴 없는 짧은 표기). 카드 하단에 새겨 넣어
   *  공유 이미지가 캡션 없이 재공유돼도 설치 경로가 따라간다(바이럴 고리 유지). */
  url?: string
}

const W = 1080
const H = 1350

/** 카드를 그려 PNG Blob으로 반환. 폰트 로드를 보장한 뒤 렌더한다. */
export async function renderShareCard(data: ShareCardData): Promise<Blob> {
  await ensureFonts()
  const hero = await loadImage(data.heroSrc).catch(() => null)

  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('canvas 2d context 없음')

  const accent = data.accent ?? PAL.clay

  // 배경
  ctx.fillStyle = PAL.sand
  ctx.fillRect(0, 0, W, H)

  // 히어로 아트 (상단 커버) + 샌드로의 페이드
  const heroH = 660
  if (hero) drawCover(ctx, hero, 0, 0, W, heroH, data.celebrate ? 1 : 0.72)
  else {
    ctx.fillStyle = PAL.sandSunk
    ctx.fillRect(0, 0, W, heroH)
  }
  // 하단 페이드 → 샌드
  const fade = ctx.createLinearGradient(0, heroH - 220, 0, heroH)
  fade.addColorStop(0, 'rgba(244,234,215,0)')
  fade.addColorStop(1, PAL.sand)
  ctx.fillStyle = fade
  ctx.fillRect(0, heroH - 220, W, 220)
  if (data.celebrate) {
    const glow = ctx.createRadialGradient(W * 0.5, heroH * 0.42, 40, W * 0.5, heroH * 0.42, W * 0.5)
    glow.addColorStop(0, 'rgba(224,165,63,0.22)')
    glow.addColorStop(1, 'rgba(224,165,63,0)')
    ctx.fillStyle = glow
    ctx.fillRect(0, 0, W, heroH)
  }

  const padX = 88
  let y = heroH + 24

  // 키커 — 순번 · 닿았습니다 / 이 자리를 지나며
  ctx.textBaseline = 'alphabetic'
  ctx.fillStyle = accent
  ctx.font = `500 26px ${DISPLAY}`
  const kicker = data.celebrate && data.ordinal
    ? `${data.ordinal}번째 자리 · 닿았습니다`
    : '이 자리를 지나며'
  drawTracked(ctx, kicker.toUpperCase(), padX, (y += 34), 4)

  // 자리 이름 (세리프 볼드, 큼)
  ctx.fillStyle = PAL.ink
  ctx.font = `700 78px ${SERIF}`
  y += 92
  ctx.fillText(data.place, padX, y)

  // 부제
  ctx.fillStyle = PAL.inkSoft
  ctx.font = `400 34px ${SERIF}`
  y += 50
  ctx.fillText(data.title, padX, y)

  // 성구 — Versal 드롭캡 + 본문 랩
  if (data.verseText) {
    y += 78
    const maxW = W - padX * 2
    const first = data.verseText.slice(0, 1)
    const rest = data.verseText.slice(1)

    // 드롭캡
    ctx.fillStyle = accent
    ctx.font = `500 96px ${DISPLAY}`
    const capW = ctx.measureText(first).width
    ctx.fillText(first, padX, y + 30)

    // 본문 (첫 줄은 드롭캡 폭만큼 들여쓰기)
    ctx.fillStyle = PAL.ink
    ctx.font = `400 40px ${SERIF}`
    const lineH = 62
    const lines = wrapText(ctx, rest, maxW, capW + 16, maxW)
    lines.forEach((ln, i) => {
      const x = i === 0 ? padX + capW + 16 : padX
      ctx.fillText(ln.text, x, y + 30 + i * lineH)
    })
    y += 30 + (lines.length - 1) * lineH

    // 출처 (라틴 레퍼런스)
    if (data.verseRef) {
      ctx.fillStyle = PAL.clayDeep
      ctx.font = `500 26px ${DISPLAY}`
      y += 56
      drawTracked(ctx, data.verseRef.toUpperCase(), padX, y, 4)
    }
  }

  // 하단 앵커: 구분선 + 거리 + 워드마크
  const footY = H - 200
  ctx.strokeStyle = PAL.line
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(padX, footY)
  ctx.lineTo(W - padX, footY)
  ctx.stroke()

  // 거리 (거대 숫자 · 왼쪽)
  ctx.fillStyle = PAL.clayDeep
  ctx.font = `500 88px ${DISPLAY}`
  ctx.textBaseline = 'alphabetic'
  const distX = padX
  const distBaseline = footY + 96
  ctx.fillText(data.distanceLabel, distX, distBaseline)
  const distW = ctx.measureText(data.distanceLabel).width
  ctx.fillStyle = PAL.sunDeep
  ctx.font = `500 34px ${DISPLAY}`
  ctx.fillText(data.unit, distX + distW + 14, distBaseline)
  ctx.fillStyle = PAL.muted
  ctx.font = `400 22px ${SERIF}`
  ctx.fillText('오늘 걸은 거리', distX + 2, footY + 132)

  // 워드마크 THE WAY (오른쪽 정렬)
  ctx.textAlign = 'right'
  ctx.fillStyle = PAL.ink
  ctx.font = `500 40px ${DISPLAY}`
  drawTrackedRight(ctx, 'THE WAY', W - padX, footY + 60, 6)
  ctx.fillStyle = PAL.muted
  ctx.font = `400 22px ${SERIF}`
  ctx.fillText(data.courseName, W - padX, footY + 100)
  ctx.textAlign = 'left'

  // 설치 링크 — 왼쪽 "오늘 걸은 거리"와 같은 높이에 두어 CTA로 균형을 잡는다.
  // 이게 없으면 카드를 본 사람이 앱을 찾을 방법이 없다(그로스 §4 K=0의 원인).
  if (data.url) {
    ctx.textAlign = 'right'
    ctx.fillStyle = PAL.clayDeep
    ctx.font = `500 24px ${DISPLAY}`
    ctx.fillText(data.url, W - padX, footY + 134)
    ctx.textAlign = 'left'
  }

  // 성경 출처 표기 (맨 아래, 아주 작게)
  ctx.fillStyle = PAL.muted
  ctx.font = `400 18px ${SERIF}`
  ctx.fillText(data.attribution, padX, H - 42)

  // 미세 그레인 (플랫/AI 느낌 제거)
  applyGrain(ctx)

  return await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('toBlob 실패'))), 'image/png')
  })
}

/** 카드를 공유(가능하면 이미지 파일)하거나, 불가하면 PNG로 저장한다.
 *  caption을 주면 공유 시트의 텍스트로 함께 실어 설치 링크가 캡션에도 남게 한다. */
export async function shareCardBlob(blob: Blob, filenameHint: string, caption?: string): Promise<'shared' | 'saved'> {
  const file = new File([blob], `${filenameHint}.png`, { type: 'image/png' })
  const nav = navigator as Navigator & { canShare?: (d: ShareData) => boolean }
  if (typeof nav.share === 'function' && nav.canShare?.({ files: [file] })) {
    try {
      await nav.share({ files: [file], title: 'THE WAY', ...(caption ? { text: caption } : {}) })
      return 'shared'
    } catch (e) {
      // 사용자 취소 → 저장으로 폴백하지 않고 그대로 종료
      if (e instanceof DOMException && e.name === 'AbortError') return 'shared'
    }
  }
  // 폴백: 다운로드
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = file.name
  document.body.appendChild(a)
  a.click()
  a.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 4000)
  return 'saved'
}

/* ── 내부 헬퍼 ─────────────────────────────────────────────────────────── */

let fontsReady: Promise<void> | null = null
function ensureFonts(): Promise<void> {
  if (fontsReady) return fontsReady
  const anyDoc = document as Document & { fonts?: FontFaceSet }
  if (!anyDoc.fonts) return (fontsReady = Promise.resolve())
  const specs = [
    `700 78px 'Gowun Batang'`,
    `400 40px 'Gowun Batang'`,
    `500 88px 'Newsreader'`,
    `500 40px 'Newsreader'`,
  ]
  fontsReady = Promise.all(specs.map((s) => anyDoc.fonts!.load(s).catch(() => undefined)))
    .then(() => anyDoc.fonts!.ready)
    .then(() => undefined)
  return fontsReady
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

function drawCover(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  dx: number, dy: number, dw: number, dh: number,
  saturate: number,
) {
  const ir = img.width / img.height
  const dr = dw / dh
  let sw = img.width
  let sh = img.height
  let sx = 0
  let sy = 0
  if (ir > dr) {
    sw = img.height * dr
    sx = (img.width - sw) / 2
  } else {
    sh = img.width / dr
    sy = (img.height - sh) / 2
  }
  ctx.save()
  if (saturate < 1) ctx.filter = `saturate(${saturate})`
  ctx.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh)
  ctx.restore()
}

/** 문자 간격(letter-spacing)을 준 텍스트를 왼쪽부터 그린다. */
function drawTracked(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, spacing: number) {
  let cx = x
  for (const ch of text) {
    ctx.fillText(ch, cx, y)
    cx += ctx.measureText(ch).width + spacing
  }
}

/** 오른쪽 정렬 + 문자 간격. (textAlign은 'right' 상태여야 함) */
function drawTrackedRight(ctx: CanvasRenderingContext2D, text: string, xRight: number, y: number, spacing: number) {
  const prev = ctx.textAlign
  ctx.textAlign = 'left'
  const total = [...text].reduce((a, ch) => a + ctx.measureText(ch).width + spacing, -spacing)
  drawTracked(ctx, text, xRight - total, y, spacing)
  ctx.textAlign = prev
}

interface WrapLine { text: string }
/** 공백 우선, 넘치면 글자 단위로 줄바꿈(한글 keep-all 대응). firstMax는 드롭캡 옆 첫 줄 폭. */
function wrapText(ctx: CanvasRenderingContext2D, text: string, firstMax: number, firstIndent: number, restMax: number): WrapLine[] {
  const lines: WrapLine[] = []
  let line = ''
  let lineIdx = 0
  const avail = () => (lineIdx === 0 ? restMax - firstIndent : restMax)
  const push = () => { lines.push({ text: line }); line = ''; lineIdx++ }

  const tokens = text.split(/(\s+)/) // 공백 유지
  for (const tok of tokens) {
    if (tok === '') continue
    const trial = line + tok
    if (ctx.measureText(trial).width <= avail() || line === '') {
      if (ctx.measureText(trial).width <= avail()) { line = trial; continue }
      // 첫 토큰이 이미 너무 김 → 글자 단위 분해
      for (const ch of tok) {
        if (ctx.measureText(line + ch).width > avail() && line !== '') push()
        line += ch
      }
    } else {
      push()
      // 새 줄 시작에서 앞 공백 제거
      const t = tok.replace(/^\s+/, '')
      for (const ch of t) {
        if (ctx.measureText(line + ch).width > avail() && line !== '') push()
        line += ch
      }
    }
  }
  if (line.trim() !== '') push()
  void firstMax
  return lines.length ? lines : [{ text: '' }]
}

/** 아주 옅은 노이즈 그레인을 곱하기로 얹는다. */
function applyGrain(ctx: CanvasRenderingContext2D) {
  const g = document.createElement('canvas')
  const size = 140
  g.width = size
  g.height = size
  const gc = g.getContext('2d')
  if (!gc) return
  const imgData = gc.createImageData(size, size)
  // 결정적 의사난수(세션마다 흔들리지 않게 고정 시드) — Math.random 미사용
  let s = 1234567
  const rnd = () => ((s = (s * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff)
  for (let i = 0; i < imgData.data.length; i += 4) {
    const v = 200 + Math.floor(rnd() * 55)
    imgData.data[i] = imgData.data[i + 1] = imgData.data[i + 2] = v
    imgData.data[i + 3] = 255
  }
  gc.putImageData(imgData, 0, 0)
  const pattern = ctx.createPattern(g, 'repeat')
  if (!pattern) return
  ctx.save()
  ctx.globalAlpha = 0.05
  ctx.globalCompositeOperation = 'multiply'
  ctx.fillStyle = pattern
  ctx.fillRect(0, 0, W, H)
  ctx.restore()
}
