import manifest from '../data/episode-videos.json'
import { SectionLabel } from './ui'

/* 이 자리의 길 — 자리 시네마틱(도착의 5컷, scripts/episode-video.mjs).
 *
 * 본문과 같은 규칙으로 **언제나 열려 있다** — 거리가 영상을 여는 열쇠가 되면 안 된다.
 * poster + preload="none": 탭하기 전엔 한 바이트도 안 받는다(러너의 데이터).
 * 무음(이 제품은 소리를 내지 않는다) · 영상이 없는 자리는 이 블록 자체가 없다
 * (episode-videos.json — sync-episode-videos.mjs가 실제 파일에서 생성). */
const HAS = new Set(manifest as string[])

export default function EpisodeFilm({
  journeyId,
  episodeId,
  poster,
}: {
  journeyId: string
  episodeId: string
  poster?: string
}) {
  if (!HAS.has(`${journeyId}:${episodeId}`)) return null
  return (
    <div className="mt-8">
      <SectionLabel>이 자리의 길</SectionLabel>
      <video
        className="mt-2 w-full overflow-hidden rounded-2xl ring-1 ring-line"
        style={{ aspectRatio: '1 / 1', background: '#191108' }}
        src={`${import.meta.env.BASE_URL}media/episodes/${journeyId}/${episodeId}.mp4`}
        poster={poster}
        preload="none"
        controls
        playsInline
        muted
        loop
      />
    </div>
  )
}
