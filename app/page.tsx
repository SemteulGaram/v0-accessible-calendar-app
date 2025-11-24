"use client"

import { CalendarHeader } from "@/components/calendar-header"
import { CalendarSidebar } from "@/components/calendar-sidebar"
import { CalendarGrid } from "@/components/calendar-grid"
import { AccessibilityProvider } from "@/components/accessibility-provider"
import { VoiceConversationDialog } from "@/components/voice-conversation-dialog"
import { VoiceEditDialog } from "@/components/voice-edit-dialog"
import { VoiceSearchDialog } from "@/components/voice-search-dialog"
import { SearchResultDialog } from "@/components/search-result-dialog"
import { MobileVoiceButton } from "@/components/mobile-voice-button"
import { searchEventsAI, summarizeEventsAI, type SearchEventsResult, type SummarizeEventsResult } from "@/lib/api-client"
import { useState, useCallback } from "react"
import type { CalendarEvent } from "@/types/calendar"

export default function Home() {
  const [viewMode, setViewMode] = useState("month")
  const [conversationDialogOpen, setConversationDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [searchDialogOpen, setSearchDialogOpen] = useState(false)
  const [searchResultDialogOpen, setSearchResultDialogOpen] = useState(false)
  const [searchType, setSearchType] = useState<'search' | 'summary'>('search')
  const [searchResult, setSearchResult] = useState<SearchEventsResult | null>(null)
  const [summaryResult, setSummaryResult] = useState<SummarizeEventsResult | null>(null)
  const [isSearching, setIsSearching] = useState(false)
  const [initialTranscript, setInitialTranscript] = useState<string>("")
  const [searchQuery, setSearchQuery] = useState<string>("")
  const isDev = process.env.NODE_ENV === 'development';
  const [events, setEvents] = useState<CalendarEvent[]>(isDev ? [
    {
      id: "1",
      title: "팀 미팅",
      startDate: new Date(),
      endDate: new Date(new Date().getTime() + 60 * 60 * 1000),
      description: "매주 월요일 오전 10시 팀 미팅",
    },
    // {
    //   id: "2",
    //   title: "팀 미팅2",
    //   startDate: new Date(),
    //   endDate: new Date(new Date().getTime() + 60 * 60 * 1000),
    //   description: "매주 월요일 오전 10시 팀 미팅",
    // },
    // {
    //   id: "3",
    //   title: "팀 미팅3",
    //   startDate: new Date(),
    //   endDate: new Date(new Date().getTime() + 60 * 60 * 1000),
    //   description: "매주 월요일 오전 10시 팀 미팅",
    // },
    // {
    //   id: "4",
    //   title: "팀 미팅4",
    //   startDate: new Date(),
    //   endDate: new Date(new Date().getTime() + 60 * 60 * 1000),
    //   description: "매주 월요일 오전 10시 팀 미팅",
    // },
    // {
    //   id: "5",
    //   title: "팀 미팅5",
    //   startDate: new Date(),
    //   endDate: new Date(new Date().getTime() + 60 * 60 * 1000),
    //   description: "매주 월요일 오전 10시 팀 미팅",
    // },
    {
      id: "6",
      title: "프로젝트 마감이 얼마 남지 않았으므로 더 열심히 해야 합니다",
      startDate: new Date(new Date().getTime() + 3 * 24 * 60 * 60 * 1000),
      endDate: new Date(new Date().getTime() + 3 * 24 * 60 * 60 * 1000),
      description: "프로젝트 최종 마감일",
    },
    {
      id: "7",
      title: "워크숍",
      startDate: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000),
      endDate: new Date(new Date().getTime() + 10 * 24 * 60 * 60 * 1000),
      description: "팀 빌딩 워크숍",
    },
    {
      id: "8",
      title: "팀 미팅6",
      startDate: new Date(new Date().getTime() + 8 * 24 * 60 * 60 * 1000),
      endDate: new Date(new Date().getTime() + 8 * 24 * 60 * 60 * 1000),
      description: "매주 월요일 오전 10시 팀 미팅",
    },
  ] : [])

  const handleAddEvent = useCallback((event: Omit<CalendarEvent, "id">) => {
    const newEvent: CalendarEvent = {
      ...event,
      id: `event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    }
    setEvents((prev) => [...prev, newEvent])
  }, [])

  const handleUpdateEvent = useCallback((eventId: string, updates: Partial<CalendarEvent>) => {
    setEvents((prev) =>
      prev.map((event) =>
        event.id === eventId ? { ...event, ...updates } : event
      )
    )
  }, [])

  const handleSearch = useCallback(async (query: string) => {
    setIsSearching(true)
    setSearchType('search')
    setSearchResultDialogOpen(true)
    try {
      const result = await searchEventsAI(query, events)
      setSearchResult(result)
    } catch (error) {
      console.error('Search error:', error)
      setSearchResult({ results: [], message: '검색 중 오류가 발생했습니다.' })
    } finally {
      setIsSearching(false)
    }
  }, [events])

  const handleVoiceCommand = useCallback(async (command: string, transcript?: string) => {
    switch (command) {
      case "ADD_EVENT":
        // transcript가 있고, "일정 추가" 키워드가 포함되어 있으면 전체 전달
        // 키워드가 없으면 (AI 의도 분류로 온 경우) 전체 전달
        if (transcript && transcript.trim()) {
          setInitialTranscript(transcript)
        } else {
          setInitialTranscript("")
        }
        setConversationDialogOpen(true)
        break
      case "UPDATE_EVENT":
        // 일정 수정 명령
        if (transcript && transcript.trim()) {
          setInitialTranscript(transcript)
        } else {
          setInitialTranscript("")
        }
        setEditDialogOpen(true)
        break
      case "SEARCH":
        // 일정 검색 - 대화형 검색 다이얼로그 사용
        if (transcript && transcript.trim()) {
          setSearchQuery(transcript)
        } else {
          setSearchQuery("")
        }
        setSearchDialogOpen(true)
        break
      case "SUMMARIZE_EVENTS":
        // 일정 요약
        setIsSearching(true)
        setSearchType('summary')
        setSearchResultDialogOpen(true)
        try {
          const query = transcript && transcript.trim() ? transcript : "내 일정 알려줘"
          const result = await summarizeEventsAI(query, events)
          setSummaryResult(result)
        } catch (error) {
          console.error('Summarize error:', error)
          setSummaryResult({
            summary: '요약 중 오류가 발생했습니다.',
            highlights: [],
            eventCount: 0,
            timeRange: ''
          })
        } finally {
          setIsSearching(false)
        }
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
    }
  }, [events])

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

        {/* AI 대화형 일정 추가 다이얼로그 */}
        <VoiceConversationDialog
          open={conversationDialogOpen}
          onOpenChange={setConversationDialogOpen}
          onEventComplete={handleAddEvent}
          initialTranscript={initialTranscript}
        />

        {/* AI 대화형 일정 수정 다이얼로그 */}
        <VoiceEditDialog
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          onEventUpdate={handleUpdateEvent}
          events={events}
          initialTranscript={initialTranscript}
        />

        {/* AI 대화형 일정 검색 다이얼로그 */}
        <VoiceSearchDialog
          open={searchDialogOpen}
          onOpenChange={setSearchDialogOpen}
          onSearch={handleSearch}
          initialQuery={searchQuery}
        />

        {/* 검색/요약 결과 다이얼로그 */}
        <SearchResultDialog
          open={searchResultDialogOpen}
          onOpenChange={setSearchResultDialogOpen}
          type={searchType}
          searchResult={searchResult}
          summaryResult={summaryResult}
          isLoading={isSearching}
        />

        {/* 모바일 음성 인식 플로팅 버튼 */}
        <MobileVoiceButton onCommand={handleVoiceCommand} />
      </div>
    </AccessibilityProvider>
  )
}
