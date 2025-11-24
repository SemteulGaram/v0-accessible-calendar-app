/**
 * 음성 일정 수정을 위한 대화 관리 클래스
 */

import type { CalendarEvent } from "@/types/calendar"
import { parseEventUpdateCommand, type EventUpdateResult, type ConversationMessage } from "./api-client"

export class VoiceEditConversationManager {
  private conversationHistory: ConversationMessage[] = []
  private eventIdentifier: string | null = null
  private updateFields: {
    date?: string | null
    time?: string | null
    title?: string | null
  } = {}

  start() {
    this.conversationHistory = []
    this.eventIdentifier = null
    this.updateFields = {}
  }

  reset() {
    this.start()
  }

  async processVoiceInput(
    userInput: string,
    events: CalendarEvent[]
  ): Promise<{
    complete: boolean
    question?: string
    error?: string
    targetEvent?: CalendarEvent
    updates?: Partial<CalendarEvent>
  }> {
    try {
      // API 호출하여 수정 정보 추출
      const result: EventUpdateResult = await parseEventUpdateCommand(
        userInput,
        this.conversationHistory
      )

      // 대화 히스토리에 추가
      this.conversationHistory.push({
        role: 'user',
        content: userInput,
      })

      if (result.question) {
        this.conversationHistory.push({
          role: 'assistant',
          content: result.question,
        })
      }

      // eventIdentifier 저장
      if (result.eventIdentifier) {
        this.eventIdentifier = result.eventIdentifier
      }

      // updateFields 저장
      if (result.updateFields) {
        this.updateFields = {
          ...this.updateFields,
          ...result.updateFields,
        }
      }

      // 완료되지 않았으면 다음 질문 반환
      if (!result.complete) {
        return {
          complete: false,
          question: result.question || undefined,
        }
      }

      // 완료되었으면 일정 찾기 및 수정사항 적용
      if (!this.eventIdentifier) {
        return {
          complete: false,
          error: "수정할 일정을 찾을 수 없습니다.",
        }
      }

      // 일정 찾기
      const targetEvent = this.findEvent(this.eventIdentifier, events)
      if (!targetEvent) {
        return {
          complete: false,
          error: `"${this.eventIdentifier}" 일정을 찾을 수 없습니다.`,
        }
      }

      // 수정사항 적용
      const updates = this.applyUpdates(targetEvent)

      return {
        complete: true,
        targetEvent,
        updates,
      }
    } catch (error) {
      console.error("[VoiceEditConversationManager] Error:", error)
      return {
        complete: false,
        error: error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다",
      }
    }
  }

  /**
   * 일정 찾기 (최근 일정 또는 이름으로)
   */
  private findEvent(identifier: string, events: CalendarEvent[]): CalendarEvent | null {
    const normalizedIdentifier = identifier.trim().toLowerCase()

    // 최근 일정
    if (normalizedIdentifier === "최근" || normalizedIdentifier === "마지막" || normalizedIdentifier === "방금") {
      if (events.length === 0) return null
      // 가장 최근에 추가된 일정 (배열의 마지막)
      return events[events.length - 1]
    }

    // 이름으로 찾기 (부분 일치)
    const matchedEvent = events.find((event) =>
      event.title.toLowerCase().includes(normalizedIdentifier)
    )

    return matchedEvent || null
  }

  /**
   * 수정사항을 CalendarEvent 형태로 변환
   */
  private applyUpdates(originalEvent: CalendarEvent): Partial<CalendarEvent> {
    const updates: Partial<CalendarEvent> = {}

    // 제목 변경
    if (this.updateFields.title) {
      updates.title = this.updateFields.title
    }

    // 날짜/시간 변경
    const newStartDate = new Date(originalEvent.startDate)
    const newEndDate = new Date(originalEvent.endDate)
    let dateChanged = false

    if (this.updateFields.date) {
      // YYYY-MM-DD → Date
      const [year, month, day] = this.updateFields.date.split('-').map(Number)
      newStartDate.setFullYear(year, month - 1, day)
      newEndDate.setFullYear(year, month - 1, day)
      dateChanged = true
    }

    if (this.updateFields.time) {
      // HH:MM → Date
      const [hours, minutes] = this.updateFields.time.split(':').map(Number)
      newStartDate.setHours(hours, minutes)

      // endDate는 startDate로부터의 duration 유지
      const duration = originalEvent.endDate.getTime() - originalEvent.startDate.getTime()
      newEndDate.setTime(newStartDate.getTime() + duration)
      dateChanged = true
    }

    if (dateChanged) {
      updates.startDate = newStartDate
      updates.endDate = newEndDate
    }

    return updates
  }
}
