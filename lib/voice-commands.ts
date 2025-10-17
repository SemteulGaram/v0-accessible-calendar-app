export interface VoiceCommand {
  patterns: RegExp[]
  action: string
  description: string
}

export const VOICE_COMMANDS: VoiceCommand[] = [
  {
    patterns: [/일정\s*추가/i, /새\s*일정/i, /이벤트\s*추가/i],
    action: "ADD_EVENT",
    description: "새 일정 추가",
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
    patterns: [/검색/i, /찾기/i],
    action: "SEARCH",
    description: "일정 검색",
  },
]

export function parseVoiceCommand(transcript: string): string | null {
  const normalizedTranscript = transcript.trim().toLowerCase()

  for (const command of VOICE_COMMANDS) {
    for (const pattern of command.patterns) {
      if (pattern.test(normalizedTranscript)) {
        console.log("[v0] Voice command matched:", command.action)
        return command.action
      }
    }
  }

  return null
}
