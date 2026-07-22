import { useNav, type Screen } from '../store'
import { useRun } from '../state/run'
import { usePilgrim } from '../state/pilgrim'
import { IconPath, IconSeal, IconCompass, IconPilgrim, IconStep } from './icons'

const TABS: { icon: typeof IconPath; label: string; to: Screen }[] = [
  { icon: IconPath, label: '여정', to: 'home' },
  { icon: IconSeal, label: '수집', to: 'collection' },
]
const TABS_R: { icon: typeof IconPath; label: string; to: Screen }[] = [
  { icon: IconCompass, label: '코스', to: 'courses' },
  { icon: IconPilgrim, label: '나', to: 'profile' },
]

export default function TabBar({ active = 'home' }: { active?: Screen }) {
  const go = useNav((s) => s.go)
  const configure = useRun((s) => s.configure)
  const activeCourseId = usePilgrim((s) => s.activeCourseId)

  const startRun = () => {
    configure({ mode: 'guided', courseId: activeCourseId })
    go('setup')
  }

  const Tab = ({ icon: Icon, label, to }: { icon: typeof IconPath; label: string; to: Screen }) => {
    const on = to === active
    return (
      <button key={label} onClick={() => go(to)} className={`flex flex-1 flex-col items-center gap-1.5 py-1 transition active:scale-95 ${on ? 'text-ink' : 'text-muted'}`} aria-label={label} aria-current={on ? 'page' : undefined}>
        <Icon size={21} strokeWidth={on ? 1.9 : 1.5} />
        <span className={`text-[10px] ${on ? 'text-clay-deep' : ''}`}>{label}</span>
      </button>
    )
  }

  return (
    <nav className="relative z-20 mt-6 flex items-end border-t border-line bg-sand px-4 pt-2.5" style={{ paddingBottom: 'max(0.9rem, env(safe-area-inset-bottom))' }}>
      {TABS.map((t) => <Tab key={t.to} {...t} />)}

      {/* 중앙 FAB — 순례 시작(NRC 중앙 러닝 버튼의 순례 버전) */}
      <div className="flex flex-1 justify-center">
        <button
          onClick={startRun}
          aria-label="순례 시작"
          className="-mt-8 flex h-16 w-16 flex-col items-center justify-center rounded-full bg-clay text-sand-raised shadow-[0_1px_2px_rgba(192,90,48,.3),0_14px_30px_-10px_rgba(156,69,34,.6)] ring-[3px] ring-sand transition active:scale-95"
        >
          <IconStep size={26} strokeWidth={1.7} />
        </button>
      </div>

      {TABS_R.map((t) => <Tab key={t.to} {...t} />)}
    </nav>
  )
}
