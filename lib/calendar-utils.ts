export function getDaysInMonth(year: number, month: number): Date[] {
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const daysInMonth = lastDay.getDate()
  const startingDayOfWeek = firstDay.getDay()

  const days: Date[] = []

  // 이전 달의 날짜들 추가
  for (let i = startingDayOfWeek - 1; i >= 0; i--) {
    const date = new Date(year, month, -i)
    days.push(date)
  }

  // 현재 달의 날짜들 추가
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(new Date(year, month, i))
  }

  // 다음 달의 날짜들 추가 (6주 그리드를 채우기 위해)
  const remainingDays = 42 - days.length
  for (let i = 1; i <= remainingDays; i++) {
    days.push(new Date(year, month + 1, i))
  }

  return days
}

export function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  )
}

export function isToday(date: Date): boolean {
  return isSameDay(date, new Date())
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date)
}

export function getEventsForDay(events: any[], date: Date): any[] {
  return events.filter((event) => {
    const eventStart = new Date(event.startDate)
    const eventEnd = new Date(event.endDate)
    return date >= eventStart && date <= eventEnd
  })
}

export interface EventLayout {
  event: any
  startCol: number // 0-6 (일요일-토요일)
  span: number // 몇 칸을 차지하는지
  row: number // 어느 주인지
  layer: number // 겹치는 일정들의 레이어
}

export function layoutEventsForMonth(events: any[], year: number, month: number): EventLayout[] {
  const days = getDaysInMonth(year, month)
  const weeks: Date[][] = []

  // 날짜들을 주 단위로 그룹화
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7))
  }

  const layouts: EventLayout[] = []

  console.log("[v0] layoutEventsForMonth - events:", events)
  console.log("[v0] layoutEventsForMonth - year:", year, "month:", month)

  weeks.forEach((week, weekIndex) => {
    const weekEvents = events.filter((event) => {
      const eventStart = new Date(event.startDate)
      const eventEnd = new Date(event.endDate)
      eventStart.setHours(0, 0, 0, 0)
      eventEnd.setHours(23, 59, 59, 999)

      const weekStart = new Date(week[0])
      weekStart.setHours(0, 0, 0, 0)
      const weekEnd = new Date(week[week.length - 1])
      weekEnd.setHours(23, 59, 59, 999)

      const overlaps = eventStart <= weekEnd && eventEnd >= weekStart

      return overlaps
    })

    console.log(`[v0] Week ${weekIndex} events:`, weekEvents)

    // 각 일정의 시작 위치와 span 계산
    weekEvents.forEach((event) => {
      const eventStart = new Date(event.startDate)
      const eventEnd = new Date(event.endDate)
      eventStart.setHours(0, 0, 0, 0)
      eventEnd.setHours(23, 59, 59, 999)

      // 이 주에서 일정이 시작하는 열 찾기
      let startCol = -1
      let endCol = -1

      week.forEach((day, dayIndex) => {
        const checkDate = new Date(day)
        checkDate.setHours(12, 0, 0, 0)

        if (checkDate >= eventStart && checkDate <= eventEnd) {
          if (startCol === -1) startCol = dayIndex
          endCol = dayIndex
        }
      })

      if (startCol !== -1) {
        // 레이어 계산 (겹치는 일정들을 위해)
        const existingLayouts = layouts.filter((l) => l.row === weekIndex)
        let layer = 0
        let foundLayer = false

        while (!foundLayer) {
          const hasConflict = existingLayouts.some(
            (l) => l.layer === layer && !(l.startCol + l.span - 1 < startCol || l.startCol > endCol),
          )

          if (!hasConflict) {
            foundLayer = true
          } else {
            layer++
          }
        }

        const layout = {
          event,
          startCol,
          span: endCol - startCol + 1,
          row: weekIndex,
          layer,
        }

        console.log("[v0] Created layout:", layout)

        layouts.push(layout)
      }
    })
  })

  console.log("[v0] Total layouts created:", layouts)

  return layouts
}
