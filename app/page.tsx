"use client"

import { CalendarHeader } from "@/components/calendar-header"
import { CalendarSidebar } from "@/components/calendar-sidebar"
import { CalendarGrid } from "@/components/calendar-grid"
import { AccessibilityProvider } from "@/components/accessibility-provider"
import { useState, useCallback } from "react"
import type { CalendarEvent } from "@/types/calendar"

export default function Home() {
  const [viewMode, setViewMode] = useState("month")
  const isDev = process.env.NODE_ENV === 'development';
  const [events, setEvents] = useState<CalendarEvent[]>(isDev ? [
    {
      id: "1",
      title: "팀 미팅",
      startDate: new Date(),
      endDate: new Date(new Date().getTime() + 60 * 60 * 1000),
      description: "매주 월요일 오전 10시 팀 미팅",
    },
    {
      id: "2",
      title: "팀 미팅2",
      startDate: new Date(),
      endDate: new Date(new Date().getTime() + 60 * 60 * 1000),
      description: "매주 월요일 오전 10시 팀 미팅",
    },
    {
      id: "3",
      title: "팀 미팅3",
      startDate: new Date(),
      endDate: new Date(new Date().getTime() + 60 * 60 * 1000),
      description: "매주 월요일 오전 10시 팀 미팅",
    },
    {
      id: "4",
      title: "팀 미팅4",
      startDate: new Date(),
      endDate: new Date(new Date().getTime() + 60 * 60 * 1000),
      description: "매주 월요일 오전 10시 팀 미팅",
    },
    {
      id: "5",
      title: "프로젝트 마감이 얼마 남지 않았으므로 더 열심히 해야 합니다",
      startDate: new Date(new Date().getTime() + 3 * 24 * 60 * 60 * 1000),
      endDate: new Date(new Date().getTime() + 3 * 24 * 60 * 60 * 1000),
      description: "프로젝트 최종 마감일",
    },
    {
      id: "6",
      title: "워크숍",
      startDate: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000),
      endDate: new Date(new Date().getTime() + 10 * 24 * 60 * 60 * 1000),
      description: "팀 빌딩 워크숍",
    },
  ] : [])

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
