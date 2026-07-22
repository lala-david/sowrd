# 성경 데이터 — PROJECT THE WAY

> 다운로드: 2026-07-21 · 출처: getbible.net v2 (`https://api.getbible.net/v2/`)
> 전권 66권(정통 개신교 정경, 외경 없음) 풀 데이터. 검증 완료.

## 파일

| 파일 | 번역본 | 권/절 | 라이선스 | 비고 |
|---|---|---|---|---|
| `korean_krv.json` | **개역한글**(성경전서 개역한글판) | 66권 · 31,084절 | 경제적 저작권 만료(2011년말) · **인격권 유지** | Gen 1:2 "하나님의 **신**은…" = 개역한글 확인 |
| `english_web.json` | World English Bible (WEB) | 66권 · 31,095절 | **퍼블릭 도메인** | 현대 영어, 저작권 완전 자유 |
| `english_kjv.json` | King James Version (KJV) | 66권 · 31,102절 | 퍼블릭 도메인(미국) | 고전 영어 |

## JSON 구조 (공통)

```
{ translation, abbreviation, lang, ..., books: [
    { nr, name, chapters: [
        { chapter, name, verses: [ { chapter, verse, name, text } ] }
] } ] }
```

## ⚠️ 저작권 / 신학 유의 (반드시 준수)

- **개역개정 아님.** 예장통합(PCK) 공식 번역인 **개역개정판은 대한성서공회 저작권**이라 오픈 데이터셋에 없고, 무단 사용·스크랩 금지. **프로덕션에 개역개정이 필요하면 대한성서공회(KBS)에서 정식 라이선스**를 받아 이 자리에 교체한다. (STATUS.md 착수 전 과제 #2)
- **개역한글 사용 조건(인격권):** ① 원문을 **수정하지 말 것**(동일성유지권) ② **출처 표기**(성명표시권) — 앱 내 표기 예: *"성경전서 개역한글판, ⓒ 대한성서공회"*.
- **이단 번역 배제 확인:** 신세계역·안상홍/하나님의교회·신천지 등 이단 번역 아님. 개역한글은 정통 개신교 번역, 66권 정경.

## 출처

- getbible.net v2 — https://github.com/getbible/v2
- 대한성서공회 저작권 FAQ(개역한글 만료) — https://www.bskorea.or.kr
- WEB(eBible.org, public domain) — https://ebible.org
