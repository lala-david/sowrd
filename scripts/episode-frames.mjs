/* 자리 시네마틱 키프레임 배치 생성기 — episode-scenes.mjs의 gen 컷을 전부 만든다.
 *   node scripts/episode-frames.mjs              (없는 것만)
 *   node scripts/episode-frames.mjs --force jesus-baptism-1
 * 키는 .env의 RECRAFT_KEY(절대 커밋 금지 — .gitignore). 있는 파일은 건너뛰므로
 * 중단돼도 다시 돌리면 이어서 만든다. 실패는 목록으로 모아 마지막에 보고. */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'
import { SCENES, SCAFFOLD } from './episode-scenes-index.mjs'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const OUT = path.join(ROOT, 'scripts/video-frames/ep')
const API = 'https://external.api.recraft.ai/v1'

// .env 로더 — 의존성 없이 5줄
const envPath = path.join(ROOT, '.env')
if (fs.existsSync(envPath)) {
  // PowerShell이 utf8로 쓰면 BOM이 붙는다 — 벗기지 않으면 첫 키가 조용히 무시된다(실측)
  for (const line of fs.readFileSync(envPath, 'utf8').replace(/^﻿/, '').split(/\r?\n/)) {
    const m = line.match(/^([A-Z_]+)=(.*)$/)
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2]
  }
}
const KEY = process.env.RECRAFT_KEY
if (!KEY) { console.error('RECRAFT_KEY 없음(.env)'); process.exit(1) }

fs.mkdirSync(OUT, { recursive: true })
const args = process.argv.slice(2)
const force = args.includes('--force')
const only = args.filter((a) => !a.startsWith('--'))

const jobs = []
for (const s of SCENES) for (const c of s.cuts) if (c.gen) jobs.push(c)
const todo = jobs.filter((c) => (!only.length || only.includes(c.gen)) && (force || !fs.existsSync(path.join(OUT, `${c.gen}.webp`))))
console.log(`생성 대상 ${todo.length} / 전체 gen ${jobs.length}`)

const credits = async () => (await (await fetch(`${API}/users/me`, { headers: { Authorization: `Bearer ${KEY}` } })).json()).credits
console.log(`크레딧: ${await credits()}`)

const failed = []
for (const [i, c] of todo.entries()) {
  try {
    const res = await fetch(`${API}/images/generations`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: SCAFFOLD + c.prompt, model: 'recraftv4_1', size: '1:1', n: 1 }),
    })
    if (!res.ok) throw new Error(`${res.status} ${(await res.text()).slice(0, 160)}`)
    const url = (await res.json())?.data?.[0]?.url
    if (!url) throw new Error('URL 없음')
    const buf = Buffer.from(await (await fetch(url)).arrayBuffer())
    await sharp(buf).resize({ width: 1024 }).webp({ quality: 80 }).toFile(path.join(OUT, `${c.gen}.webp`))
    const kb = (fs.statSync(path.join(OUT, `${c.gen}.webp`)).size / 1024).toFixed(0)
    console.log(`[${i + 1}/${todo.length}] ok   ${c.gen}  ${kb}KB`)
  } catch (e) {
    failed.push(c.gen)
    console.error(`[${i + 1}/${todo.length}] FAIL ${c.gen}  ${e.message}`)
  }
}
console.log(`\n완료 — 실패 ${failed.length}${failed.length ? ': ' + failed.join(', ') : ''} · 잔여 크레딧 ${await credits()}`)
