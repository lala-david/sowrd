import { useNav, type Screen } from '../store'
import { useRun } from '../state/run'
import { primeVoice } from '../lib/voice'
import { usePilgrim } from '../state/pilgrim'
import { IconPath, IconSeal, IconCompass, IconPilgrim, IconStep } from './icons'

const TABS: { icon: typeof IconPath; label: string; to: Screen }[] = [
  { icon: IconPath, label: '오늘', to: 'home' },
  { icon: IconCompass, label: '여정', to: 'journeys' }, // 나침반 = 길을 고른다
]
/* 코스 탭을 뺐다 — 화면 스스로 "실제 GPS 주행 연동은 아직입니다"라고 밝히는 미구현
 * 콘텐츠가 하단 탭의 1/4을 차지하고 있었고, 여정과 역할도 겹친다(여정 목록에서 계속 갈 수 있다).
 * 대신 수집을 정식 탭으로 올린다 — 진입로가 두 곳뿐인 고아 화면이면서 자기 탭바에는
 * 남의 탭(journeys)을 켜 놓아, 사용자가 자기 위치를 알 수 없었다. */
const TABS_R: { icon: typeof IconPath; label: string; to: Screen }[] = [
  { icon: IconSeal, label: '인장', to: 'collection' }, // 인장 = 모은 것
  { icon: IconPilgrim, label: '나', to: 'profile' },
]

export default function TabBar({ active = 'home' }: { active?: Screen }) {
  const go = useNav((s) => s.go)
  const configure = useRun((s) => s.configure)
  const activeCourseId = usePilgrim((s) => s.activeCourseId)
  const activeJourneyId = usePilgrim((s) => s.activeJourneyId)

  /* 홈의 "바로 달리기"와 같은 동작이어야 한다 — 같은 아이콘이 다른 곳으로 가면 라벨이 거짓이 된다.
     고르고 시작하는 길(Setup)은 홈의 작은 링크로 남아 있다. */
  const startRun = () => {
    primeVoice()
    configure({ mode: 'guided', courseId: activeCourseId, journeyId: activeJourneyId })
    go('run')
  }

  const Tab = ({ icon: Icon, label, to }: { icon: typeof IconPath; label: string; to: Screen }) => {
    const on = to === active
    return (
      <button key={label} onClick={() => go(to)} className={`flex flex-1 flex-col items-center gap-1.5 py-1 transition active:scale-95 ${on ? 'text-ink' : 'text-muted'}`} aria-label={label} aria-current={on ? 'page' : undefined}>
        <Icon size={21} strokeWidth={on ? 1.9 : 1.5} />
        <span className={`text-[10.5px] ${on ? 'text-clay-deep' : ''}`}>{label}</span>
      </button>
    )
  }

  return (
    /* 화면이 길어지면 탭이 첫 화면 밖으로 밀려나므로 아래에 고정한다.
       mt-auto로 짧은 화면에서도 바닥에 붙고, sticky로 긴 화면에서 따라온다. */
    <nav
      className="sticky bottom-0 z-20 mt-auto flex items-end border-t border-line bg-sand px-4 pt-2.5"
      style={{ paddingBottom: 'max(0.9rem, env(safe-area-inset-bottom))' }}
    >
      {/* 여정 탭은 심플 모드에서도 보인다.
          감췄더니 탭이 '오늘 · 나' 둘뿐이 되었고, 에피소드는 여정 안에만 있으므로
          **에피소드에 들어갈 길이 통째로 막혔다**. 심플 모드의 목적은 홈 화면의 소음을
          줄이는 것이지 여정 시스템을 앱에서 지우는 것이 아니다.
          코스 탭은 계속 감춘다 — 여정과 역할이 겹치고 "GPS 연동은 아직"이라고 밝히는 화면이다. */}
      {TABS.map((t) => <Tab key={t.to} {...t} />)}

      {/* 중앙 FAB — 순례 시작(NRC 중앙 러닝 버튼의 순례 버전) */}
      <div className="flex flex-1 justify-center">
        <button
          onClick={startRun}
          aria-label="순례 시작"
          className="-mt-7 flex h-16 w-16 flex-col items-center justify-center rounded-full bg-clay text-sand-raised shadow-[0_1px_2px_rgba(192,90,48,.3),0_14px_30px_-10px_rgba(156,69,34,.6)] ring-[3px] ring-sand transition active:scale-95"
        >
          <IconStep size={26} strokeWidth={1.7} />
        </button>
      </div>

      {TABS_R.map((t) => <Tab key={t.to} {...t} />)}
    </nav>
  )
}
