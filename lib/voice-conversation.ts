import { parseVoiceCommand, type ConversationMessage, type EventParseResult } from './api-client'
import type { CalendarEvent } from '@/types/calendar'

export type ConversationStage = 'idle' | 'collecting' | 'complete' | 'error'

export interface ConversationState {
  stage: ConversationStage
  event: Partial<CalendarEvent>
  missing: ('date' | 'time' | 'title')[]
  history: ConversationMessage[]
  currentQuestion: string | null
  error: string | null
}

/**
 * 음성 대화를 관리하여 일정 정보를 수집하는 클래스
 */
export class VoiceConversationManager {
  private state: ConversationState = {
    stage: 'idle',
    event: {},
    missing: [],
    history: [],
    currentQuestion: null,
    error: null,
  }

  /**
   * 현재 대화 상태를 반환합니다.
   */
  getState(): ConversationState {
    return { ...this.state }
  }

  /**
   * 대화가 진행 중인지 확인합니다.
   */
  isActive(): boolean {
    return this.state.stage === 'collecting'
  }

  /**
   * 대화가 완료되었는지 확인합니다.
   */
  isComplete(): boolean {
    return this.state.stage === 'complete'
  }

  /**
   * 음성 입력을 처리하고 일정 정보를 추출합니다.
   */
  async processVoiceInput(transcript: string): Promise<{
    complete: boolean
    question?: string
    event?: CalendarEvent
    error?: string
  }> {
    try {
      // API 호출하여 일정 정보 추출
      const result: EventParseResult = await parseVoiceCommand(transcript, this.state.history)

      // 대화 히스토리 업데이트
      this.state.history.push(
        { role: 'user', content: transcript },
        { role: 'assistant', content: result.question || '' }
      )

      // 추출된 정보로 이벤트 업데이트
      if (result.date) {
        const [year, month, day] = result.date.split('-').map(Number)
        this.state.event.startDate = new Date(year, month - 1, day)
        this.state.event.endDate = new Date(year, month - 1, day)
      }

      if (result.time) {
        const [hours, minutes] = result.time.split(':').map(Number)
        if (this.state.event.startDate) {
          this.state.event.startDate.setHours(hours, minutes, 0, 0)
          // 기본적으로 1시간 후를 종료 시간으로 설정
          this.state.event.endDate = new Date(this.state.event.startDate)
          this.state.event.endDate.setHours(hours + 1, minutes, 0, 0)
        }
      }

      if (result.title) {
        this.state.event.title = result.title
      }

      // 상태 업데이트
      this.state.missing = result.missing
      this.state.currentQuestion = result.question
      this.state.error = null

      // 완료 여부 확인
      if (result.complete) {
        this.state.stage = 'complete'

        // 완전한 CalendarEvent 객체 생성
        const completeEvent: CalendarEvent = {
          id: '', // ID는 나중에 생성
          title: this.state.event.title || '제목 없음',
          startDate: this.state.event.startDate || new Date(),
          endDate: this.state.event.endDate || new Date(),
          description: this.state.event.description,
          color: this.state.event.color,
        }

        return {
          complete: true,
          event: completeEvent,
        }
      }

      // 정보 수집 중
      this.state.stage = 'collecting'
      return {
        complete: false,
        question: result.question || undefined,
      }
    } catch (error) {
      console.error('Voice conversation error:', error)
      this.state.stage = 'error'
      this.state.error = error instanceof Error ? error.message : 'Unknown error'

      return {
        complete: false,
        error: this.state.error,
      }
    }
  }

  /**
   * 대화 상태를 초기화합니다.
   */
  reset(): void {
    this.state = {
      stage: 'idle',
      event: {},
      missing: [],
      history: [],
      currentQuestion: null,
      error: null,
    }
  }

  /**
   * 새로운 대화를 시작합니다.
   */
  start(): void {
    this.reset()
    this.state.stage = 'collecting'
  }
}
