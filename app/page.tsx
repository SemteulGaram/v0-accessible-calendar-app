"use client"

import { CalendarHeader } from "@/components/calendar-header"
import { CalendarSidebar } from "@/components/calendar-sidebar"
import { CalendarGrid } from "@/components/calendar-grid"
import { AccessibilityProvider } from "@/components/accessibility-provider"
import { useState, useCallback } from "react"
import type { CalendarEvent } from "@/types/calendar"

export default function Home() {
  const [viewMode, setViewMode] = useState("month")
  const [events, setEvents] = useState<CalendarEvent[]>([
  
  ])

  const handleAddEvent = useCallback((event: Omit<CalendarEvent, "id">) => {
    const newEvent: CalendarEvent = {
      ...event,
      id: `event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    }
    setEvents((prev) => [...prev, newEvent])
  }, [])

  const handleVoiceCommand = useCallback((command: string) => {
    switch (command) {
      case "ADD_EVENT":
        alert("일정 추가 기능이 실행됩니다")
        break
      case "GO_TO_TODAY":
        alert("오늘 날짜로 이동합니다")
        break
      case "NEXT_MONTH":
        alert("다음 달로 이동합니다")
        break
      case "PREVIOUS_MONTH":
        alert("이전 달로 이동합니다")
        break
      case "VIEW_MONTH":
        setViewMode("month")
        break
      case "VIEW_WEEK":
        setViewMode("week")
        break
      case "VIEW_DAY":
        setViewMode("day")
        break
      case "SEARCH":
        alert("검색 기능이 실행됩니다")
        break
    }
  }, [])

  const sidebarContent = (
    <CalendarSidebar onViewChange={setViewMode} onCommand={handleVoiceCommand} onAddEvent={handleAddEvent} />
  )

  return (
    <AccessibilityProvider>
      <div className="flex min-h-screen flex-col">
        <CalendarHeader onVoiceCommand={handleVoiceCommand} sidebarContent={sidebarContent} />

        <main className="flex flex-1">
          <aside className="hidden w-64 border-r border-border bg-sidebar p-4 md:block">{sidebarContent}</aside>
          <CalendarGrid events={events} />
        </main>
      </div>
    </AccessibilityProvider>
  )
}
