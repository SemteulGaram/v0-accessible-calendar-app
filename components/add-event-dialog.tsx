"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import type { CalendarEvent } from "@/types/calendar"
import { useState } from "react"
import { useAccessibility } from "@/components/accessibility-provider"

interface AddEventDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAddEvent: (event: Omit<CalendarEvent, "id">) => void
}

export function AddEventDialog({ open, onOpenChange, onAddEvent }: AddEventDialogProps) {
  const { speak, playSound } = useAccessibility()
  const [title, setTitle] = useState("")
  const [startDate, setStartDate] = useState("")
  const [startTime, setStartTime] = useState("")
  const [endDate, setEndDate] = useState("")
  const [endTime, setEndTime] = useState("")
  const [description, setDescription] = useState("")
  const [color, setColor] = useState("#3b82f6")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!title || !startDate || !endDate) {
      speak("제목, 시작 날짜, 종료 날짜는 필수 항목입니다")
      playSound("error")
      return
    }

    const start = new Date(`${startDate}T${startTime || "00:00"}`)
    const end = new Date(`${endDate}T${endTime || "23:59"}`)

    if (end < start) {
      speak("종료 날짜는 시작 날짜보다 이후여야 합니다")
      playSound("error")
      return
    }

    onAddEvent({
      title,
      startDate: start,
      endDate: end,
      description: description || undefined,
      color,
    })

    speak(`${title} 일정이 추가되었습니다`)
    playSound("success")

    // Reset form
    setTitle("")
    setStartDate("")
    setStartTime("")
    setEndDate("")
    setEndTime("")
    setDescription("")
    setColor("#3b82f6")
    onOpenChange(false)
  }

  const handleCancel = () => {
    speak("일정 추가를 취소했습니다")
    playSound("click")
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]" aria-describedby="dialog-description">
        <DialogHeader>
          <DialogTitle>새 일정 추가</DialogTitle>
          <DialogDescription id="dialog-description">
            일정의 세부 정보를 입력하세요. 제목, 시작 날짜, 종료 날짜는 필수 항목입니다.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title" className="text-sm font-medium">
                제목 <span className="text-destructive">*</span>
              </Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="일정 제목을 입력하세요"
                required
                aria-required="true"
                onFocus={() => speak("제목 입력")}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="start-date" className="text-sm font-medium">
                  시작 날짜 <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="start-date"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                  aria-required="true"
                  onFocus={() => speak("시작 날짜 선택")}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="start-time" className="text-sm font-medium">
                  시작 시간
                </Label>
                <Input
                  id="start-time"
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  onFocus={() => speak("시작 시간 선택")}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="end-date" className="text-sm font-medium">
                  종료 날짜 <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="end-date"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  required
                  aria-required="true"
                  onFocus={() => speak("종료 날짜 선택")}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="end-time" className="text-sm font-medium">
                  종료 시간
                </Label>
                <Input
                  id="end-time"
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  onFocus={() => speak("종료 시간 선택")}
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description" className="text-sm font-medium">
                설명
              </Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="일정에 대한 추가 설명을 입력하세요"
                rows={3}
                onFocus={() => speak("설명 입력")}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="color" className="text-sm font-medium">
                색상
              </Label>
              <div className="flex items-center gap-2">
                <Input
                  id="color"
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="h-10 w-20 cursor-pointer"
                  onFocus={() => speak("일정 색상 선택")}
                />
                <span className="text-sm text-muted-foreground">일정 표시 색상을 선택하세요</span>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleCancel} onFocus={() => speak("취소 버튼")}>
              취소
            </Button>
            <Button type="submit" onFocus={() => speak("저장 버튼")}>
              저장
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
