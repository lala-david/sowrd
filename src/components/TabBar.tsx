import { Compass, LayoutGrid, Flame } from 'lucide-react'
import { useNav, type Screen } from '../store'

const TABS: { icon: typeof Compass; label: string; to: Screen }[] = [
  { icon: Compass, label: '여정', to: 'home' },
  { icon: LayoutGrid, label: '수집', to: 'collection' },
  { icon: Flame, label: '쉼터', to: 'home' },
]

export default function TabBar({ active = 'home' }: { active?: Screen }) {
  const go = useNav((s) => s.go)
  return (
    <nav className="relative z-10 mt-6 flex items-stretch border-t border-line px-8 pt-3" style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}>
      {TABS.map(({ icon: Icon, label, to }) => {
        const on = to === active
        return (
          <button key={label} onClick={() => go(to)} className={`flex flex-1 flex-col items-center gap-1.5 py-1 transition active:scale-95 ${on ? 'text-ink' : 'text-muted'}`} aria-label={label} aria-current={on ? 'page' : undefined}>
            <Icon size={20} strokeWidth={on ? 2 : 1.6} />
            <span className={`text-[10px] ${on ? 'text-gold-deep' : ''}`}>{label}</span>
          </button>
        )
      })}
    </nav>
  )
}
