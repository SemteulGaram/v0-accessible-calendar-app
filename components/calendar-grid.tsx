"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useState } from "react"
import { getDaysInMonth, isSameDay, isToday, formatDate, layoutEventsForMonth } from "@/lib/calendar-utils"
import type { CalendarEvent } from "@/types/calendar"

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"]

interface CalendarGridProps {
  events?: CalendarEvent[]
}

export function CalendarGrid({ events = [] }: CalendarGridProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  const days = getDaysInMonth(year, month)

  const eventLayouts = layoutEventsForMonth(events, year, month)

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1))
  }

  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1))
  }

  const goToToday = () => {
    setCurrentDate(new Date())
    setSelectedDate(new Date())
  }

  const handleDateClick = (date: Date) => {
    setSelectedDate(date)
  }

  const getEventsForDate = (date: Date) => {
    return events.filter((event) => {
      const eventStart = new Date(event.startDate)
      const eventEnd = new Date(event.endDate)
      eventStart.setHours(0, 0, 0, 0)
      eventEnd.setHours(23, 59, 59, 999)
      const checkDate = new Date(date)
      checkDate.setHours(12, 0, 0, 0)
      return checkDate >= eventStart && checkDate <= eventEnd
    })
  }

  const weeks: Date[][] = []
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7))
  }

  return (
    <div className="flex flex-1 flex-col p-6">
      {/* 캘린더 헤더 */}
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-foreground">
          {year}년 {month + 1}월
        </h2>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={goToToday} aria-label="오늘로 이동">
            오늘
          </Button>
          <Button variant="outline" size="icon" onClick={goToPreviousMonth} aria-label="이전 달">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={goToNextMonth} aria-label="다음 달">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Card className="flex-1 overflow-auto p-0">
        <div className="flex-1 flex flex-col gap-px bg-border" role="grid" aria-label="월간 캘린더">
          {/* 요일 헤더 */}
          <div className="flex-none grid grid-cols-7 gap-px">
            {WEEKDAYS.map((day) => (
              <div
                key={day}
                className="bg-muted p-3 text-center text-sm font-semibold text-muted-foreground"
                role="columnheader"
                aria-label={`${day}요일`}
              >
                {day}
              </div>
            ))}
          </div>

          {/* 주 단위 행 */}
          {weeks.map((week, weekIndex) => {
            const weekEventLayouts = eventLayouts.filter((layout) => layout.row === weekIndex)
            const maxLayer = Math.max(0, ...weekEventLayouts.map((l) => l.layer))

            return (
              <div key={weekIndex} className="flex-1 relative flex flex-row">
                {/* 날짜 셀 */}
                <div className="flex-1 grid grid-cols-7 gap-px">
                  {week.map((date, dayIndex) => {
                    const isCurrentMonth = date.getMonth() === month
                    const isTodayDate = isToday(date)
                    const isSelected = selectedDate && isSameDay(date, selectedDate)
                    const dayEvents = getEventsForDate(date)

                    return (
                      <button
                        key={dayIndex}
                        onClick={() => handleDateClick(date)}
                        className={`
                          relative bg-card p-2 flex flex-col items-center justify-start text-left transition-colors hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring focus:ring-inset
                          ${!isCurrentMonth ? "text-muted-foreground opacity-50" : "text-foreground"}
                          ${isSelected ? "bg-accent" : ""}
                        `}
                        style={{
                          minHeight: "120px",
                        }}
                        role="gridcell"
                        aria-label={`${formatDate(date)}${dayEvents.length > 0 ? `, ${dayEvents.length}개의 일정` : ""}`}
                        aria-selected={isSelected || undefined}
                      >
                        <span
                          className={`
                            inline-flex h-6 w-6 items-center justify-center rounded-full text-sm
                            ${isTodayDate ? "bg-primary text-primary-foreground font-semibold" : ""}
                          `}
                        >
                          {date.getDate()}
                        </span>
                        {isTodayDate && (
                          <div className="pointer-events-none absolute inset-0 border-2 border-primary" />
                        )}
                      </button>
                    )
                  })}
                </div>

                <div className="pointer-events-none absolute left-0 right-0 top-8 grid grid-cols-7 gap-px">
                  {weekEventLayouts.map((layout, layoutIndex) => {
                    const eventStartDate = new Date(layout.event.startDate)
                    const eventEndDate = new Date(layout.event.endDate)
                    const weekStart = week[0]
                    const weekEnd = week[week.length - 1]

                    const isEventStart = eventStartDate >= weekStart
                    const isEventEnd = eventEndDate <= weekEnd
                    const eventDayCount = Math.ceil(
                      (Math.min(eventEndDate.getTime(), weekEnd.getTime()) - Math.max(eventStartDate.getTime(), weekStart.getTime())) /
                        (1000 * 60 * 60 * 24)
                    ) + 1

                    return (
                      <div
                        key={layoutIndex}
                        className="inline-flex h-6 items-center justify-start mt-[2px] pointer-events-auto mx-1 cursor-pointer truncate rounded px-2 py-1 text-xs font-medium text-white transition-opacity hover:opacity-80"
                        style={{
                          gridColumn: `${layout.startCol + 1} / span ${layout.span}`,
                          backgroundColor: layout.event.color || "#3b82f6",
                          borderTopLeftRadius: isEventStart ? "0.25rem" : "0",
                          borderBottomLeftRadius: isEventStart ? "0.25rem" : "0",
                          borderTopRightRadius: isEventEnd ? "0.25rem" : "0",
                          borderBottomRightRadius: isEventEnd ? "0.25rem" : "0",
                        }}
                        title={`${layout.event.title} (${formatDate(eventStartDate)} - ${formatDate(eventEndDate)})`}
                        role="button"
                        tabIndex={0}
                        aria-label={`일정: ${layout.event.title}, ${formatDate(eventStartDate)}부터 ${formatDate(eventEndDate)}까지`}
                      >
                        {isEventStart ? layout.event.title : layout.event.title + ` (${eventDayCount}일째)`}
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      </Card>

      {/* 선택된 날짜 정보 */}
      {selectedDate && (
        <div className="mt-4" role="region" aria-live="polite" aria-label="선택된 날짜 정보">
          <Card className="p-4">
            <h3 className="mb-2 font-semibold text-foreground">{formatDate(selectedDate)}</h3>
            {getEventsForDate(selectedDate).length > 0 ? (
              <ul className="space-y-2">
                {getEventsForDate(selectedDate).map((event) => (
                  <li key={event.id} className="flex items-center gap-2">
                    <div
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: event.color || "#3b82f6" }}
                      aria-hidden="true"
                    />
                    <span className="text-sm text-foreground">{event.title}</span>
                    {event.description && <span className="text-xs text-muted-foreground">- {event.description}</span>}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">일정이 없습니다</p>
            )}
          </Card>
        </div>
      )}
    </div>
  )
}
