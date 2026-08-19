import { usePilgrim } from '../state/pilgrim'
import { IconPath, IconCairn, IconScroll } from '../components/icons'

/* 첫 실행 안내 — 딱 한 번, 한 장.
 *
 * 왜 필요한가: 처음 켠 사람이 보던 화면은 "오늘의 말씀 + 0.0km + 달리기 시작"이었고,
 * 이게 **GPS로 달린 거리를 재는 러닝 앱**이라는 사실을 알려주는 문장이 한 줄도 없었다.
 * 가장 근접한 것이 화면 맨 아래 11.5px 회색 부제였다. 게다가 오늘의 말씀은 날짜로만
 * 고르기 때문에, 앱을 처음 켠 날 겟세마네 체포 장면이 뜨는 일이 실제로 일어난다.
 *
 * 별도 온보딩 '흐름'을 만들지 않은 이유: 화면 수를 늘리면 IA가 흔들리고, 여러 장을
 * 넘기게 하면 읽지 않고 넘긴다. 한 장에 세 줄이면 충분하다.
 *
 * 위치 권한을 여기서 요청하지 않는다 — 맥락 없이 뜨는 권한 팝업은 거절률이 높다.
 * 실제로 필요해지는 순간(달리기 시작)에 묻는 편이 낫다. 대신 무엇에 쓰는지는 미리 밝힌다. */
export default function Intro() {
  const setSeenIntro = usePilgrim((s) => s.setSeenIntro)

  const steps = [
    /* 첫 문장은 "실제 길을 달린다"다. 성경 인물 이름으로 시작하면 비크리스천이 첫 화면에서
       끊긴다(전문가 검토). 무엇을 하는 앱인지 → 어디를 가는지 → 닿으면 무엇을 받는지 순서로. */
    { Icon: IconPath, text: '달립니다. 실제 GPS로 거리를 잽니다.' },
    { Icon: IconCairn, text: '그만큼 지도 위의 내가 앞으로 갑니다 — 갈릴리 호숫가에서 예루살렘까지, 우르에서 가나안까지, 안디옥에서 로마까지. 실제 있었던 길입니다.' },
    { Icon: IconScroll, text: '자리에 닿으면 인장이 찍히고, 그곳에서 있었던 이야기와 말씀을 받습니다.' },
  ]

  return (
    <div
      className="fixed inset-0 z-50 mx-auto flex max-w-[440px] flex-col justify-end bg-sand px-8"
      style={{
        paddingTop: 'max(4rem, env(safe-area-inset-top))',
        paddingBottom: 'max(2.5rem, env(safe-area-inset-bottom))',
      }}
    >
      <span className="font-display text-[17px] tracking-[0.34em] text-clay-deep">THE&nbsp;WAY</span>
      <h1 className="mt-6 font-serif text-[30px] font-bold leading-[1.28] text-ink">
        오늘 달린 만큼,
        <br />
        오래된 길이 열립니다
      </h1>

      <ul className="mt-8 flex flex-col gap-5">
        {steps.map(({ Icon, text }, i) => (
          <li key={i} className="flex items-start gap-3.5">
            <span className="mt-0.5 shrink-0 text-clay-deep">
              <Icon size={19} />
            </span>
            <span className="text-[14.5px] leading-relaxed text-ink-soft">{text}</span>
          </li>
        ))}
      </ul>

      {/* 두 가지를 미리 밝힌다. 하나는 프라이버시, 하나는 신학이다.
          말씀이 거리 뒤에 잠기지 않는다는 것은 이 앱의 설계 원칙이라 첫 화면에서 말해야 한다. */}
      <p className="mt-7 text-[12.5px] leading-relaxed text-muted">
        위치는 거리를 재는 데만 씁니다. 좌표는 이 기기 밖으로 나가지 않습니다.
        <br />
        성경 본문은 달린 거리와 상관없이 언제나 읽을 수 있습니다.
      </p>

      <button
        onClick={() => setSeenIntro(true)}
        className="mt-8 w-full rounded-2xl bg-clay-deep py-4 text-center font-serif text-[17px] text-sand-raised shadow-[0_1px_2px_rgba(192,90,48,.25),0_16px_36px_-18px_rgba(156,69,34,.55)] transition active:scale-[0.99]"
      >
        길을 나섭니다
      </button>
    </div>
  )
}
