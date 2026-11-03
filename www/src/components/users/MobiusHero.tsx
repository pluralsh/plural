import { useEffect, useRef, useState } from 'react'
import { styledThemeDark } from '@pluralsh/design-system'
import styled, { ThemeProvider } from 'styled-components'

import { TESTIMONIALS } from './testimonials'

const QUOTE_INTERVAL_MS = 7000
const LENS_SIZE = 160
const PIXEL_SIZE = 3

// Shading ramp for the strip, from shadow to highlight
const RAMP = [
  '#262A33',
  '#303540',
  '#3D424D',
  '#3A3FB8',
  '#4A51F2',
  '#5D63F4',
  '#747AF6',
  '#9FA3F9',
  '#C5C9D2',
  '#EEF0F1',
]

// The hero is always dark, whatever the app's color mode
const PALETTE = {
  bg: styledThemeDark.colors['fill-one'],
  ramp: RAMP,
  field: '#5D626F',
  haloBack: '#303540',
  haloFront: '#454954',
}

type Particle = {
  // Surface coordinates
  u: number
  s: number
  o: number
  // 3D position and normal
  ux: number
  uy: number
  uz: number
  nx: number
  ny: number
  nz: number
  // Screen position and velocity
  x: number
  y: number
  vx: number
  vy: number
  d: number
  sc: number
  col: number
  sz: number
}

type FieldParticle = {
  fx: number
  fy: number
  ph: number
  x: number
  y: number
  vx: number
  vy: number
}

type Mouse = { x: number; y: number; inside: boolean }

const HALF_W = 0.24
const HALF_H = 0.04
const LINES = 44
const PER_LINE = 96
const HALO_COUNT = 600
const FIELD_COUNT = 320
const CAMERA = 3.4
const TILT = 0.62

function particle(u: number, s: number, o: number): Particle {
  return {
    u,
    s,
    o,
    ux: 0,
    uy: 0,
    uz: 0,
    nx: 0,
    ny: 0,
    nz: 0,
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    d: 0,
    sc: 1,
    col: 0,
    sz: 1,
  }
}

function normalize([x, y, z]: number[]) {
  const l = Math.sqrt(x * x + y * y + z * z)

  return [x / l, y / l, z / l]
}

const LIGHT = normalize([-0.45, 0.65, 0.62])
const HALF_VEC = normalize([LIGHT[0], LIGHT[1], LIGHT[2] + 1])

// Places a particle on a twisting Möbius band whose cross-section is a thin
// ellipse. `e` blends the band between a flat ring and a saddle.
function place(q: Particle, t: number, e: number) {
  const phi = q.u / 2 + 0.6 * t
  const ringR = 0.95 * (1 + 0.28 * e * Math.cos(2 * q.u))
  const ringY = 0.45 * e * Math.sin(2 * q.u)
  const cs = Math.cos(q.s)
  const ss = Math.sin(q.s)
  const lx = HALF_W * cs
  const ly = HALF_H * ss
  let nxs = cs / HALF_W
  let nys = ss / HALF_H
  const nl = Math.sqrt(nxs * nxs + nys * nys)

  nxs /= nl
  nys /= nl

  const cp = Math.cos(phi)
  const sp = Math.sin(phi)
  const rr = lx * cp - ly * sp
  const yy = lx * sp + ly * cp
  const nr = nxs * cp - nys * sp
  const ny = nxs * sp + nys * cp
  const cu = Math.cos(q.u)
  const su = Math.sin(q.u)
  const rad = ringR + rr

  q.ux = (rad + nr * q.o) * cu
  q.uy = ringY + yy + ny * q.o
  q.uz = (rad + nr * q.o) * su
  q.nx = nr * cu
  q.ny = ny
  q.nz = nr * su
}

function startMobius(canvas: HTMLCanvasElement, mouse: Mouse) {
  const ctx = canvas.getContext('2d')

  if (!ctx) return null

  const motionQuery = window.matchMedia?.('(prefers-reduced-motion: reduce)')
  // With reduced motion the scene is drawn as a still frame, without pointer
  // or jitter movement
  let still = !!motionQuery?.matches
  const strip: Particle[] = []
  const halo: Particle[] = []
  const field: FieldParticle[] = []

  for (let i = 0; i < LINES; i++) {
    const sAng = (i / LINES) * Math.PI * 2

    for (let j = 0; j < PER_LINE; j++) {
      strip.push(
        particle(
          ((j + Math.random() * 0.8) / PER_LINE) * Math.PI * 2,
          sAng + (Math.random() - 0.5) * 0.04,
          0
        )
      )
    }
  }
  for (let i = 0; i < HALO_COUNT; i++) {
    halo.push(
      particle(
        Math.random() * Math.PI * 2,
        Math.random() * Math.PI * 2,
        0.08 + Math.pow(Math.random(), 1.6) * 0.4
      )
    )
  }
  for (let i = 0; i < FIELD_COUNT; i++) {
    field.push({
      fx: Math.random(),
      fy: Math.random(),
      ph: Math.random() * Math.PI * 2,
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
    })
  }

  let dpr = 1
  let placed = false
  // False while the hero is hidden (e.g. display: none on narrow screens)
  let shown = false

  const resize = () => {
    shown = canvas.clientWidth > 0 && canvas.clientHeight > 0
    dpr = Math.min(window.devicePixelRatio || 1, 2)
    const w = Math.max(1, Math.round(canvas.clientWidth * dpr))
    const h = Math.max(1, Math.round(canvas.clientHeight * dpr))

    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w
      canvas.height = h
      placed = false
    }
  }

  // Springs a particle toward its home position and pushes it away from the
  // pointer with a slight swirl
  const physics = (
    q: { x: number; y: number; vx: number; vy: number },
    hx: number,
    hy: number,
    spring: number,
    rad: number
  ) => {
    if (!placed || still) {
      q.x = hx
      q.y = hy
      q.vx = 0
      q.vy = 0

      return
    }
    q.vx += (hx - q.x) * spring
    q.vy += (hy - q.y) * spring
    if (mouse.inside) {
      const dx = q.x - mouse.x
      const dy = q.y - mouse.y
      const d2 = dx * dx + dy * dy

      if (d2 < rad * rad && d2 > 0.01) {
        const d = Math.sqrt(d2)
        let f = 1 - d / rad

        f = f * f * 6 * dpr
        q.vx += (dx / d) * f - (dy / d) * f * 0.35
        q.vy += (dy / d) * f + (dx / d) * f * 0.35
      }
    }
    q.vx += (Math.random() - 0.5) * 0.18 * dpr
    q.vy += (Math.random() - 0.5) * 0.18 * dpr
    q.vx *= 0.84
    q.vy *= 0.84
    q.x += q.vx
    q.y += q.vy
  }

  let ang = 0
  let t = 0
  let last = performance.now()
  let raf = 0
  const visible: Particle[] = []

  const draw = (now: number) => {
    const dt = Math.min(now - last, 50) / 1000
    const { bg, ramp, field: fieldColor, haloBack, haloFront } = PALETTE

    last = now
    if (!still) {
      ang += dt * 0.3
      t += dt
    }

    // Rolls between a flat band and a saddle every 10 seconds
    const e = 0.5 - 0.5 * Math.cos((t * 2 * Math.PI) / 10)

    strip.forEach((q) => place(q, t, e))
    halo.forEach((q) => place(q, t, e))

    const W = canvas.width
    const H = canvas.height
    const cx = W * 0.5
    const cy = H * 0.6
    const R = Math.min(W, H) * 0.25
    const ca = Math.cos(ang)
    const sa = Math.sin(ang)
    const ct = Math.cos(TILT)
    const st = Math.sin(TILT)
    const rad = LENS_SIZE * dpr
    const base = Math.max(1, PIXEL_SIZE * dpr * 0.6)

    const project = (q: Particle) => {
      const rx = q.ux * ca + q.uz * sa
      const rz = -q.ux * sa + q.uz * ca
      const ry = q.uy * ct - rz * st
      const rz2 = q.uy * st + rz * ct
      const sc = CAMERA / (CAMERA - rz2)

      q.d = rz2
      q.sc = sc

      return [cx + rx * R * sc, cy - ry * R * sc]
    }

    ctx.fillStyle = bg
    ctx.fillRect(0, 0, W, H)

    ctx.fillStyle = fieldColor
    field.forEach((q) => {
      physics(
        q,
        q.fx * W + Math.sin(t * 0.4 + q.ph) * 14 * dpr,
        q.fy * H + Math.cos(t * 0.33 + q.ph * 1.3) * 14 * dpr,
        0.03,
        rad
      )
      ctx.fillRect(q.x, q.y, base, base)
    })

    halo.forEach((q) => {
      const [hx, hy] = project(q)

      physics(q, hx, hy, 0.045, rad)
      ctx.fillStyle = q.d < 0 ? haloBack : haloFront
      ctx.fillRect(q.x, q.y, base * q.sc, base * q.sc)
    })

    visible.length = 0
    strip.forEach((q) => {
      const [sx, sy] = project(q)

      physics(q, sx, sy, 0.07, rad)

      const nrx = q.nx * ca + q.nz * sa
      const nrz = -q.nx * sa + q.nz * ca
      const nry = q.ny * ct - nrz * st
      const nrz2 = q.ny * st + nrz * ct

      // Skip particles facing away from the camera
      if (nrz2 < -0.08) return

      const dif = Math.max(0, nrx * LIGHT[0] + nry * LIGHT[1] + nrz2 * LIGHT[2])
      const spec = Math.pow(
        Math.max(0, nrx * HALF_VEC[0] + nry * HALF_VEC[1] + nrz2 * HALF_VEC[2]),
        30
      )
      const rim = Math.pow(1 - Math.max(0, nrz2), 3) * 0.15
      const fog = 0.75 + 0.25 * ((q.d + 1.3) / 2.6)
      const val = Math.min(1, (0.08 + 0.72 * dif + rim) * fog + 0.55 * spec)

      q.col = Math.min(ramp.length - 1, Math.floor(val * ramp.length))
      q.sz = base * q.sc * (0.85 + 0.3 * val)
      visible.push(q)
    })

    visible.sort((a, b) => a.d - b.d)
    let color = -1

    visible.forEach((q) => {
      if (q.col !== color) {
        color = q.col
        ctx.fillStyle = ramp[color]
      }
      ctx.fillRect(q.x - q.sz * 0.5, q.y - q.sz * 0.5, q.sz, q.sz)
    })
    placed = true
  }

  const tick = (now: number) => {
    raf = requestAnimationFrame(tick)
    draw(now)
  }

  // Runs the frame loop only while the hero is visible and motion is allowed;
  // otherwise draws at most a single still frame
  const update = () => {
    cancelAnimationFrame(raf)
    if (shown && !still) {
      last = performance.now()
      raf = requestAnimationFrame(tick)
    } else if (shown) {
      raf = requestAnimationFrame(draw)
    }
  }

  const onResize = () => {
    const wasShown = shown

    resize()
    if (shown !== wasShown || (shown && still)) update()
  }

  const onMotionChange = (e: MediaQueryListEvent) => {
    still = e.matches
    placed = false
    update()
  }

  resize()
  update()

  const observer =
    typeof ResizeObserver !== 'undefined' ? new ResizeObserver(onResize) : null

  observer?.observe(canvas)
  motionQuery?.addEventListener?.('change', onMotionChange)

  return () => {
    cancelAnimationFrame(raf)
    observer?.disconnect()
    motionQuery?.removeEventListener?.('change', onMotionChange)
  }
}

function useQuoteIndex(count: number) {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    if (count < 2) return

    const interval = setInterval(
      () => setIndex((i) => (i + 1) % count),
      QUOTE_INTERVAL_MS
    )

    return () => clearInterval(interval)
  }, [count])

  return index
}

export function MobiusHero() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const mouse = useRef<Mouse>({ x: -9999, y: -9999, inside: false })
  const quote = TESTIMONIALS[useQuoteIndex(TESTIMONIALS.length)]

  useEffect(() => {
    const canvas = canvasRef.current

    if (!canvas) return

    return startMobius(canvas, mouse.current) ?? undefined
  }, [])

  const onPointerMove = (e: React.PointerEvent) => {
    const canvas = canvasRef.current

    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const dpr = canvas.width / Math.max(1, rect.width)

    mouse.current.x = (e.clientX - rect.left) * dpr
    mouse.current.y = (e.clientY - rect.top) * dpr
    mouse.current.inside = true
  }

  return (
    <ThemeProvider theme={styledThemeDark}>
      <HeroSC aria-label="Customer stories">
        <CardSC
          onPointerMove={onPointerMove}
          onPointerEnter={onPointerMove}
          onPointerLeave={() => {
            mouse.current.inside = false
          }}
        >
          <canvas
            ref={canvasRef}
            aria-hidden="true"
          />
          {quote && (
            <figure aria-live="polite">
              <blockquote>“{quote.text}”</blockquote>
              <figcaption>
                <span className="role">{quote.role}</span>
                <span className="company">{quote.company}</span>
              </figcaption>
            </figure>
          )}
        </CardSC>
      </HeroSC>
    </ThemeProvider>
  )
}

const HeroSC = styled.section(({ theme }) => ({
  display: 'flex',
  flex: '1.25 1 520px',
  minWidth: 0,
  padding: theme.spacing.medium,
}))

const CardSC = styled.div(({ theme }) => ({
  position: 'relative',
  flexGrow: 1,
  overflow: 'hidden',
  borderRadius: theme.borderRadiuses.large,
  border: theme.borders.default,
  background: theme.colors['fill-one'],
  canvas: {
    position: 'absolute',
    inset: 0,
    width: '100%',
    height: '100%',
    display: 'block',
  },
  figure: {
    position: 'absolute',
    top: theme.spacing.xxxlarge,
    left: theme.spacing.xxxlarge,
    right: theme.spacing.xxxlarge,
    maxWidth: 600,
    margin: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing.large,
    pointerEvents: 'none',
  },
  blockquote: {
    margin: 0,
    fontFamily: theme.fontFamilies.semi,
    fontSize: 24,
    lineHeight: 1.4,
    color: theme.colors.text,
  },
  figcaption: {
    ...theme.partials.text.body2,
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing.xxxsmall,
  },
  '.role': { color: theme.colors['text-light'] },
  '.company': { ...theme.partials.text.body2Bold, color: theme.colors.text },
}))
