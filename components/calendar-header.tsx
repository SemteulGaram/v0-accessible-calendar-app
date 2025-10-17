"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Calendar, Mic, Search, Settings, User, Moon, Sun, Menu } from "lucide-react"
import { useState } from "react"
import { useSpeechRecognition } from "@/hooks/use-speech-recognition"
import { useAccessibility } from "@/components/accessibility-provider"

interface CalendarHeaderProps {
  onVoiceCommand?: (command: string) => void
  sidebarContent?: React.ReactNode
}

export function CalendarHeader({ onVoiceCommand, sidebarContent }: CalendarHeaderProps) {
  const { isListening, startListening, stopListening } = useSpeechRecognition()
  const { speak, playSound } = useAccessibility()
  const [isDarkMode, setIsDarkMode] = useState(true)

  const handleVoiceInput = () => {
    if (isListening) {
      stopListening()
      speak("음성 인식을 중지했습니다")
      playSound("click")
    } else {
      startListening()
      speak("음성 인식을 시작합니다. 명령어를 말씀해주세요")
      playSound("notification")
    }
  }

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode)
    document.documentElement.classList.toggle("dark")
    const newMode = !isDarkMode ? "다크" : "라이트"
    speak(`${newMode} 모드로 전환했습니다`)
    playSound("success")
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-card" role="banner">
      <div className="flex h-16 items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-3">
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                aria-label="메뉴 열기"
                onFocus={() => {
                  speak("메뉴")
                  playSound("focus")
                }}
              >
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-4">
              {sidebarContent}
            </SheetContent>
          </Sheet>

          <Calendar className="h-8 w-8 text-primary" aria-hidden="true" />
          <h1 className="text-xl font-semibold text-foreground">
            접근성 캘린더
            <span className="sr-only">시각장애인을 위한 음성 인식 캘린더</span>
          </h1>
        </div>

        <div className="flex flex-1 items-center justify-center gap-2 px-4 md:px-8">
          <div className="relative w-full max-w-md">
            <Search
              className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              type="search"
              placeholder="일정 검색..."
              className="w-full pl-10 pr-4"
              aria-label="일정 검색"
              onFocus={() => {
                speak("검색창")
                playSound("focus")
              }}
            />
          </div>

          <Button
            variant={isListening ? "default" : "outline"}
            size="icon"
            onClick={handleVoiceInput}
            aria-label={isListening ? "음성 인식 중지" : "음성 인식 시작"}
            aria-pressed={isListening}
            className="shrink-0"
          >
            <Mic className={`h-5 w-5 ${isListening ? "animate-pulse" : ""}`} />
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            aria-label={isDarkMode ? "라이트 모드로 전환" : "다크 모드로 전환"}
          >
            {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                aria-label="사용자 메뉴 열기"
                onFocus={() => {
                  speak("사용자 메뉴")
                  playSound("focus")
                }}
              >
                <User className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>내 계정</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onFocus={() => speak("설정")}
                onClick={() => {
                  speak("설정 페이지로 이동합니다")
                  playSound("click")
                }}
              >
                <Settings className="mr-2 h-4 w-4" />
                <span>설정</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onFocus={() => speak("접근성 옵션")}
                onClick={() => {
                  speak("접근성 옵션을 엽니다")
                  playSound("click")
                }}
              >
                <span>접근성 옵션</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onFocus={() => speak("로그아웃")}
                onClick={() => {
                  speak("로그아웃합니다")
                  playSound("click")
                }}
              >
                로그아웃
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
