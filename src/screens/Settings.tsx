import { useNav } from '../store'
import { usePilgrim } from '../state/pilgrim'
import { SectionLabel, SettingSwitch } from '../components/ui'
import { IconArrow, IconSettings, IconLamp } from '../components/icons'

/* ── 설정 ───────────────────────────────────────────────────────────────────
 * 프로필("나의 순례")에서 분리했다 — 설정이 화면 절반을 먹어 '나'가 설정 목록이 되어 있었다.
 * 단위·글자·화면 / 러닝 중(음성·자동 멈춤·경로 기록) / 기록 초기화 / 시연 도구(접힘). */
export default function Settings() {
  const go = useNav((s) => s.go)
  const pilgrim = usePilgrim()
  const { units, setUnits, textScale, setTextScale, theme, setTheme, resetAll } = pilgrim

  const back = () => {
    if (window.history.length > 1) window.history.back()
    else go('profile')
  }

  const Row = ({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) => (
    <div className="mt-3 flex items-center justify-between rounded-xl border border-line bg-sand-raised/30 px-4 py-3">
      <span className="flex items-center gap-2.5 text-[14px] text-ink-soft">
        <span className="text-muted">{icon}</span> {label}
      </span>
      <div className="flex overflow-hidden rounded-lg border border-line-strong">{children}</div>
    </div>
  )
  const Seg = ({ on, onClick, children }: { on: boolean; onClick: () => void; children: React.ReactNode }) => (
    <button onClick={onClick} aria-pressed={on} className={`min-h-[44px] min-w-[52px] px-3 text-[13px] ${on ? 'bg-clay-deep text-sand-raised' : 'text-muted'}`}>
      {children}
    </button>
  )

  return (
    <div className="relative flex flex-1 flex-col">
      <header className="flex items-center gap-2 px-3" style={{ paddingTop: 'max(2.2rem, env(safe-area-inset-top))' }}>
        <button onClick={back} aria-label="뒤로" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-ink-soft transition active:scale-90">
          <IconArrow size={17} className="rotate-180" />
        </button>
        <h1 className="font-serif text-[22px] font-bold leading-tight text-ink">설정</h1>
      </header>

      <div className="mt-4 px-6" style={{ paddingBottom: 'max(2.5rem, env(safe-area-inset-bottom))' }}>
        <SectionLabel>보기</SectionLabel>
        <Row icon={<IconSettings size={18} />} label="거리 단위">
          {(['km', 'mi'] as const).map((u) => (
            <Seg key={u} on={units === u} onClick={() => setUnits(u)}>
              <span className="uppercase">{u}</span>
            </Seg>
          ))}
        </Row>
        <Row icon={<IconSettings size={18} />} label="글자 크기">
          {([['normal', '보통'], ['large', '크게'], ['xlarge', '더 크게']] as const).map(([v, label]) => (
            <Seg key={v} on={textScale === v} onClick={() => setTextScale(v)}>
              {label}
            </Seg>
          ))}
        </Row>
        <Row icon={<IconLamp size={18} />} label="화면">
          {([['system', '기기'], ['light', '낮'], ['dark', '밤']] as const).map(([v, label]) => (
            <Seg key={v} on={theme === v} onClick={() => setTheme(v)}>
              {label}
            </Seg>
          ))}
        </Row>

        <div className="mt-7">
          <SectionLabel>달리는 중</SectionLabel>
        </div>
        <SettingSwitch
          label="음성 안내"
          hint="1km마다 거리와 페이스를, 자리에 닿으면 그 자리 이름을 한 마디로 읽어 줍니다. 화면을 보지 않아도 길이 말을 겁니다."
          checked={pilgrim.voiceCue}
          onChange={pilgrim.setVoiceCue}
        />
        <SettingSwitch
          label="자동 멈춤"
          hint="신호등 앞처럼 20초 넘게 멈춰 있으면 시간을 세지 않고, 다시 움직이면 이어 갑니다. 평균 페이스가 기다린 시간에 망가지지 않습니다."
          checked={pilgrim.autoPause}
          onChange={pilgrim.setAutoPause}
        />
        <SettingSwitch
          label="경로 기록"
          hint="달린 길을 지도에 그립니다. 시작·끝 200m는 잘라내 집 위치가 드러나지 않고, 좌표는 이 기기에만 남습니다."
          checked={pilgrim.traceRoute}
          onChange={pilgrim.setTraceRoute}
        />

        <button onClick={() => { if (confirm('모든 순례 기록을 지울까요?')) resetAll() }} className="mt-8 w-full rounded-xl border border-line py-3.5 text-center text-[13px] text-muted transition active:scale-[0.99]">
          기록 초기화
        </button>

        <details className="mt-6 rounded-xl border border-dashed border-line px-4 py-2">
          <summary className="cursor-pointer py-1.5 text-[12px] text-muted">시연·개발 도구</summary>
          <div className="pb-2">
            <SettingSwitch label="전체 해금" hint="모든 자리를 도달한 것으로 봅니다(개발·시연용)." checked={pilgrim.admin} onChange={pilgrim.setAdmin} />
            <button onClick={() => { if (confirm('다섯 여정과 예수 사역의 모든 자리를 완주한 상태로 채웁니다(시연용). 실제 러닝 기록은 만들지 않아요. 계속할까요?')) pilgrim.completeAll() }} className="mt-3 w-full rounded-xl border border-line-strong bg-sand-raised/50 py-3 text-center text-[13px] text-ink-soft transition active:scale-[0.99]">
              모든 여정 완주 처리 (시연)
            </button>
            <button onClick={() => { if (confirm('지금까지의 기록이 데모 데이터로 바뀝니다. 되돌릴 수 없어요. 계속할까요?')) pilgrim.loadDemo() }} className="mt-2 w-full rounded-xl border border-line py-3 text-center text-[13px] text-muted transition active:scale-[0.99]">
              데모 데이터 넣기
            </button>
          </div>
        </details>
      </div>
    </div>
  )
}
