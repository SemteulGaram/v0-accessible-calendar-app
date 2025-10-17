"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, CalendarDays, List, Grid3x3 } from "lucide-react"
import { useState } from "react"
import { VoiceCommandPanel } from "@/components/voice-command-panel"
import { useAccessibility } from "@/components/accessibility-provider"
import { AddEventDialog } from "@/components/add-event-dialog"
import type { CalendarEvent } from "@/types/calendar"

interface CalendarSidebarProps {
  onViewChange?: (view: string) => void
  onCommand?: (command: string) => void
  onAddEvent?: (event: Omit<CalendarEvent, "id">) => void
}

export function CalendarSidebar({ onViewChange, onCommand, onAddEvent }: CalendarSidebarProps) {
  const [viewMode, setViewMode] = useState("month")
  const { speak, playSound } = useAccessibility()
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const handleAddEvent = () => {
    speak("일정 추가 화면을 엽니다")
    playSound("notification")
    setIsDialogOpen(true)
  }

  const handleViewChange = (value: string) => {
    setViewMode(value)
    onViewChange?.(value)
    const viewNames: Record<string, string> = {
      day: "일간",
      week: "주간",
      month: "월간",
    }
    speak(`${viewNames[value]} 보기로 전환했습니다`)
    playSound("success")
  }

  return (
    <>
      <div className="flex flex-col gap-4" role="complementary" aria-label="캘린더 사이드바">
        <Button
          onClick={handleAddEvent}
          className="w-full"
          size="lg"
          aria-label="새 일정 추가"
          onFocus={() => {
            speak("일정 추가 버튼")
            playSound("focus")
          }}
        >
          <Plus className="mr-2 h-5 w-5" />
          일정 추가
        </Button>

        <div>
          <VoiceCommandPanel onCommand={onCommand} />
        </div>

        <Card className="p-4">
          <h2 className="mb-3 text-sm font-semibold text-sidebar-foreground">보기 전환</h2>
          <Select value={viewMode} onValueChange={handleViewChange}>
            <SelectTrigger className="w-full" aria-label="캘린더 보기 모드 선택">
              <SelectValue placeholder="보기 선택" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">
                <div className="flex items-center">
                  <List className="mr-2 h-4 w-4" />
                  <span>일간 보기</span>
                </div>
              </SelectItem>
              <SelectItem value="week">
                <div className="flex items-center">
                  <CalendarDays className="mr-2 h-4 w-4" />
                  <span>주간 보기</span>
                </div>
              </SelectItem>
              <SelectItem value="month">
                <div className="flex items-center">
                  <Grid3x3 className="mr-2 h-4 w-4" />
                  <span>월간 보기</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>

          <div className="mt-4 flex flex-col gap-2" role="group" aria-label="빠른 보기 전환">
            <Button
              variant={viewMode === "day" ? "default" : "outline"}
              className="w-full justify-start"
              onClick={() => handleViewChange("day")}
              aria-pressed={viewMode === "day"}
              onFocus={() => speak("일간 보기")}
            >
              <List className="mr-2 h-4 w-4" />
              일간
            </Button>
            <Button
              variant={viewMode === "week" ? "default" : "outline"}
              className="w-full justify-start"
              onClick={() => handleViewChange("week")}
              aria-pressed={viewMode === "week"}
              onFocus={() => speak("주간 보기")}
            >
              <CalendarDays className="mr-2 h-4 w-4" />
              주간
            </Button>
            <Button
              variant={viewMode === "month" ? "default" : "outline"}
              className="w-full justify-start"
              onClick={() => handleViewChange("month")}
              aria-pressed={viewMode === "month"}
              onFocus={() => speak("월간 보기")}
            >
              <Grid3x3 className="mr-2 h-4 w-4" />
              월간
            </Button>
          </div>
        </Card>
      </div>

      <AddEventDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onAddEvent={(event) => {
          onAddEvent?.(event)
        }}
      />
    </>
  )
}
