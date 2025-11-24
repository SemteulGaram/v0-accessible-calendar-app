export interface VoiceCommand {
  patterns: RegExp[]
  action: string
  description: string
}

export const VOICE_COMMANDS: VoiceCommand[] = [
  {
    patterns: [/일정\s*추가/i, /새\s*일정/i, /이벤트\s*추가/i],
    action: "ADD_EVENT",
    description: "새 일정 추가 (AI 대화형)",
  },
  {
    patterns: [/일정\s*수정/i, /일정\s*변경/i, /일정\s*편집/i, /이벤트\s*수정/i],
    action: "UPDATE_EVENT",
    description: "일정 수정 (AI 대화형)",
  },
  {
    patterns: [/오늘/i, /투데이/i],
    action: "GO_TO_TODAY",
    description: "오늘 날짜로 이동",
  },
  {
    patterns: [/다음\s*달/i, /다음\s*월/i],
    action: "NEXT_MONTH",
    description: "다음 달로 이동",
  },
  {
    patterns: [/이전\s*달/i, /이전\s*월/i, /지난\s*달/i],
    action: "PREVIOUS_MONTH",
    description: "이전 달로 이동",
  },
  {
    patterns: [/월간\s*보기/i, /월\s*보기/i],
    action: "VIEW_MONTH",
    description: "월간 보기로 전환",
  },
  {
    patterns: [/주간\s*보기/i, /주\s*보기/i],
    action: "VIEW_WEEK",
    description: "주간 보기로 전환",
  },
  {
    patterns: [/일간\s*보기/i, /일\s*보기/i],
    action: "VIEW_DAY",
    description: "일간 보기로 전환",
  },
  {
    patterns: [/검색/i, /찾기/i, /찾아\s*줘/i],
    action: "SEARCH",
    description: "일정 검색 (AI 자연어 검색)",
  },
  {
    patterns: [/일정\s*요약/i, /오늘\s*일정/i, /이번\s*주\s*일정/i, /앞으로/i, /다가오는\s*일정/i],
    action: "SUMMARIZE_EVENTS",
    description: "일정 요약 (AI 지능형 요약)",
  },
]

/**
 * 기본 음성 명령 패턴 매칭 (간단한 명령어용)
 * AI가 필요 없는 단순 명령어는 패턴 매칭으로 처리합니다.
 */
export function parseSimpleVoiceCommand(transcript: string): string | null {
  const normalizedTranscript = transcript.trim().toLowerCase()

  for (const command of VOICE_COMMANDS) {
    for (const pattern of command.patterns) {
      if (pattern.test(normalizedTranscript)) {
        console.log("[Voice Command] Pattern matched:", command.action)
        return command.action
      }
    }
  }

  return null
}

/**
 * 일정 추가 명령인지 확인합니다.
 */
export function isAddEventCommand(transcript: string): boolean {
  const normalizedTranscript = transcript.trim().toLowerCase()
  const addEventPatterns = [/일정\s*추가/i, /새\s*일정/i, /이벤트\s*추가/i]

  return addEventPatterns.some(pattern => pattern.test(normalizedTranscript))
}
