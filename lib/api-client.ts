/**
 * API 클라이언트 - 백엔드 서버와 통신
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface ConversationMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

export interface EventParseResult {
  date: string | null // YYYY-MM-DD 형식
  time: string | null // HH:MM 형식 (24시간)
  title: string | null
  missing: ('date' | 'time' | 'title')[]
  question: string | null
  complete: boolean
}

export interface VoiceParseRequest {
  transcript: string
  conversationHistory?: ConversationMessage[]
}

export interface IntentClassificationResult {
  intent: 'ADD_EVENT' | 'UPDATE_EVENT' | 'SEARCH' | 'SUMMARIZE_EVENTS' |
          'GO_TO_TODAY' | 'NEXT_MONTH' | 'PREVIOUS_MONTH' |
          'VIEW_MONTH' | 'VIEW_WEEK' | 'VIEW_DAY' | 'UNKNOWN'
  confidence: number
  isEventData: boolean
}

export interface EventUpdateResult {
  eventIdentifier: string | null
  updateFields: {
    date?: string | null
    time?: string | null
    title?: string | null
  }
  missing: string[]
  question: string | null
  complete: boolean
}

export interface SearchEventsResult {
  results: Array<{
    id: string
    title: string
    startDate: string
    endDate: string
    description?: string
    relevanceScore: number
    reason: string
  }>
  message: string
}

export interface SummarizeEventsResult {
  summary: string
  highlights: string[]
  eventCount: number
  timeRange: string
}

/**
 * 음성 명령을 서버로 전송하여 일정 정보를 추출합니다.
 */
export async function parseVoiceCommand(
  transcript: string,
  conversationHistory: ConversationMessage[] = []
): Promise<EventParseResult> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/voice/parse`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        transcript,
        conversationHistory,
      } as VoiceParseRequest),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error || `HTTP error ${response.status}`)
    }

    const result: ApiResponse<EventParseResult> = await response.json()

    if (!result.success || !result.data) {
      throw new Error(result.error || 'Failed to parse voice command')
    }

    return result.data
  } catch (error) {
    console.error('API Error:', error)
    throw error
  }
}

/**
 * 서버 상태를 확인합니다.
 */
export async function checkServerHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/health`, {
      method: 'GET',
    })

    if (!response.ok) {
      return false
    }

    const result = await response.json()
    return result.success === true
  } catch (error) {
    console.error('Health check failed:', error)
    return false
  }
}

/**
 * 음성 입력의 의도를 AI로 분류합니다.
 * "15일 치과 예약" 같은 입력이 일정 추가 명령인지 판별합니다.
 */
export async function classifyIntent(transcript: string): Promise<IntentClassificationResult> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/voice/classify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ transcript }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error || `HTTP error ${response.status}`)
    }

    const result: ApiResponse<IntentClassificationResult> = await response.json()

    if (!result.success || !result.data) {
      throw new Error(result.error || 'Failed to classify intent')
    }

    return result.data
  } catch (error) {
    console.error('Intent classification error:', error)
    // 에러 시 기본값 반환
    return {
      intent: 'UNKNOWN',
      confidence: 0,
      isEventData: false
    }
  }
}

/**
 * 음성 명령을 서버로 전송하여 일정 수정 정보를 추출합니다.
 */
export async function parseEventUpdateCommand(
  transcript: string,
  conversationHistory: ConversationMessage[] = []
): Promise<EventUpdateResult> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/voice/parse-update`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        transcript,
        conversationHistory,
      } as VoiceParseRequest),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error || `HTTP error ${response.status}`)
    }

    const result: ApiResponse<EventUpdateResult> = await response.json()

    if (!result.success || !result.data) {
      throw new Error(result.error || 'Failed to parse event update command')
    }

    return result.data
  } catch (error) {
    console.error('API Error:', error)
    throw error
  }
}

/**
 * 일정 검색 (AI 기반 자연어 검색)
 */
export async function searchEventsAI(
  query: string,
  events: Array<{
    id: string
    title: string
    startDate: Date
    endDate: Date
    description?: string
  }>
): Promise<SearchEventsResult> {
  try {
    // Date를 ISO string으로 변환
    const eventsData = events.map(event => ({
      id: event.id,
      title: event.title,
      startDate: event.startDate.toISOString(),
      endDate: event.endDate.toISOString(),
      description: event.description,
    }))

    const response = await fetch(`${API_BASE_URL}/api/voice/search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        events: eventsData,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error || `HTTP error ${response.status}`)
    }

    const result: ApiResponse<SearchEventsResult> = await response.json()

    if (!result.success || !result.data) {
      throw new Error(result.error || 'Failed to search events')
    }

    return result.data
  } catch (error) {
    console.error('Search events error:', error)
    throw error
  }
}

/**
 * 일정 요약 (AI 기반 지능형 요약)
 */
export async function summarizeEventsAI(
  query: string,
  events: Array<{
    id: string
    title: string
    startDate: Date
    endDate: Date
    description?: string
  }>
): Promise<SummarizeEventsResult> {
  try {
    // Date를 ISO string으로 변환
    const eventsData = events.map(event => ({
      id: event.id,
      title: event.title,
      startDate: event.startDate.toISOString(),
      endDate: event.endDate.toISOString(),
      description: event.description,
    }))

    const response = await fetch(`${API_BASE_URL}/api/voice/summarize`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        events: eventsData,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error || `HTTP error ${response.status}`)
    }

    const result: ApiResponse<SummarizeEventsResult> = await response.json()

    if (!result.success || !result.data) {
      throw new Error(result.error || 'Failed to summarize events')
    }

    return result.data
  } catch (error) {
    console.error('Summarize events error:', error)
    throw error
  }
}

/**
 * OpenAI API 연결을 테스트합니다.
 */
export async function testOpenAIConnection(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/voice/test`, {
      method: 'GET',
    })

    if (!response.ok) {
      return false
    }

    const result = await response.json()
    return result.success === true
  } catch (error) {
    console.error('OpenAI connection test failed:', error)
    return false
  }
}
