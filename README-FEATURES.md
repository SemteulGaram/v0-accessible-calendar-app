# Accessible Calendar - Frontend Application

시각장애인을 위한 접근성 중심 캘린더 애플리케이션의 프론트엔드입니다.

## 🎯 주요 기능

- **월간/주간/일간 캘린더 뷰**: 다양한 일정 보기 모드
- **음성 명령 인식**: 한국어 음성으로 캘린더 조작
- **AI 대화형 일정 추가**: OpenAI API를 통한 자연어 일정 생성
- **TTS (음성 출력)**: 화면의 모든 내용을 한국어로 읽어주기
- **오디오 피드백**: 동작에 대한 음향 효과
- **고대비 테마**: 다크/라이트 모드 지원
- **스크린 리더 최적화**: ARIA 레이블, 시맨틱 HTML

## 🚀 시작하기

### 1. 의존성 설치

```bash
pnpm install
```

### 2. 환경 변수 설정

`.env.local` 파일을 생성하고 백엔드 서버 주소를 설정하세요:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### 3. 개발 서버 실행

```bash
pnpm dev
```

애플리케이션이 `http://localhost:3000`에서 실행됩니다.

**중요**: AI 대화형 일정 추가 기능을 사용하려면 백엔드 서버(`accessible-calendar-server`)가 실행 중이어야 합니다!

## 📦 기술 스택

- **Framework**: Next.js 15.2.4 (App Router)
- **Language**: TypeScript
- **UI Framework**: React 19
- **Styling**: Tailwind CSS 4.1.9
- **UI Components**: Radix UI + Shadcn/UI
- **Date Handling**: date-fns 4.1.0
- **Icons**: Lucide React

## 🎤 음성 명령

### 기본 명령어 (패턴 매칭)

- "오늘", "투데이" - 오늘 날짜로 이동
- "다음 달", "이전 달" - 월 네비게이션
- "월간 보기", "주간 보기", "일간 보기" - 뷰 전환
- "검색", "찾기" - 일정 검색

### AI 대화형 명령어

- **"일정 추가", "새 일정"** - AI와 대화하며 일정 추가
  - 예: "내일 오후 3시에 치과 예약" → AI가 자동으로 날짜, 시간, 내용 추출
  - 누락된 정보는 AI가 질문하여 수집

## 🗂️ 프로젝트 구조

```
v0-accessible-calendar-app/
├── app/
│   ├── page.tsx                         # 메인 페이지
│   ├── layout.tsx                       # 루트 레이아웃
│   └── globals.css                      # 글로벌 스타일
├── components/
│   ├── calendar-grid.tsx                # 캘린더 그리드
│   ├── calendar-header.tsx              # 헤더 (음성 버튼)
│   ├── calendar-sidebar.tsx             # 사이드바
│   ├── add-event-dialog.tsx             # 일정 추가 다이얼로그
│   ├── voice-command-panel.tsx          # 음성 명령 패널
│   ├── voice-conversation-dialog.tsx    # AI 대화형 일정 추가 ⭐
│   ├── accessibility-provider.tsx       # 접근성 컨텍스트
│   └── ui/                              # Shadcn/UI 컴포넌트
├── hooks/
│   ├── use-speech-recognition.ts        # 음성 인식 훅
│   ├── use-text-to-speech.ts            # TTS 훅
│   └── use-audio-feedback.ts            # 오디오 피드백 훅
├── lib/
│   ├── api-client.ts                    # 백엔드 API 통신 ⭐
│   ├── voice-conversation.ts            # 대화 상태 관리 ⭐
│   ├── voice-commands.ts                # 음성 명령 파서
│   ├── calendar-utils.ts                # 캘린더 유틸리티
│   └── utils.ts                         # 공통 유틸리티
├── types/
│   └── calendar.ts                      # TypeScript 타입 정의
├── .env.local                           # 환경 변수 (Git 제외)
├── .env.local.example                   # 환경 변수 템플릿
└── package.json

⭐ = 이번에 추가된 OpenAI 통합 관련 파일
```

## 🔄 AI 대화형 일정 추가 흐름

### 1. 사용자가 "일정 추가" 음성 명령
```
사용자: "일정 추가"
→ VoiceConversationDialog 열림
→ AI: "언제 일정을 추가하시겠습니까?"
```

### 2. AI가 필요한 정보 수집
```
사용자: "내일"
→ API 호출 (날짜 추출)
→ AI: "몇 시로 설정하시겠습니까?"

사용자: "오후 3시"
→ API 호출 (시간 추출)
→ AI: "어떤 일정인가요?"

사용자: "치과 예약"
→ API 호출 (제목 추출)
→ AI: "내일 오후 3시 치과 예약 일정을 추가했습니다."
```

### 3. 일정 자동 생성
- 수집된 정보로 CalendarEvent 객체 생성
- 캘린더에 자동 추가
- 대화 종료

## 🔌 백엔드 API 통합

### API 클라이언트 ([lib/api-client.ts](lib/api-client.ts))

```typescript
// 음성 명령 파싱
const result = await parseVoiceCommand(
  "내일 오후 3시에 치과 예약",
  conversationHistory
)

// 서버 상태 확인
const isHealthy = await checkServerHealth()

// OpenAI 연결 테스트
const isConnected = await testOpenAIConnection()
```

### 대화 관리자 ([lib/voice-conversation.ts](lib/voice-conversation.ts))

```typescript
const manager = new VoiceConversationManager()

// 대화 시작
manager.start()

// 음성 입력 처리
const result = await manager.processVoiceInput("내일")

if (result.complete) {
  // 일정 정보 수집 완료
  onAddEvent(result.event)
} else {
  // 다음 질문 표시
  speak(result.question)
}
```

## 🎨 접근성 기능

### 음성 출력 (TTS)
- 모든 UI 요소에 포커스 시 내용 읽어주기
- 사용자 동작에 대한 음성 피드백
- 한국어 음성 지원

### 오디오 피드백
- 성공: 800Hz
- 오류: 200Hz
- 클릭: 600Hz
- 알림: 1000Hz
- 포커스: 400Hz

### 키보드 네비게이션
- Tab: 요소 간 이동
- Enter/Space: 버튼 활성화
- Escape: 다이얼로그 닫기
- 화살표 키: 캘린더 네비게이션

### 시각적 접근성
- 고대비 색상
- 포커스 인디케이터 (2px outline)
- 큰 클릭 영역
- 명확한 텍스트 레이블

## 🧪 브라우저 호환성

### 완전 지원
- Chrome/Edge (최신 버전)
- 음성 인식, TTS, 모든 기능 정상 작동

### 부분 지원
- Firefox: TTS 지원, 음성 인식 미지원
- Safari: 제한적인 Web Speech API 지원

## 🛠️ 개발

### 스크립트

```bash
pnpm dev          # 개발 서버 실행
pnpm build        # 프로덕션 빌드
pnpm start        # 프로덕션 서버 실행
pnpm lint         # ESLint 실행
```

### 새로운 UI 컴포넌트 추가

```bash
pnpx shadcn@latest add [component-name]
```

## 📝 사용 시나리오

### 시나리오 1: 음성으로 간단히 일정 추가
1. "일정 추가" 음성 명령
2. "내일 오후 3시에 치과 예약" 한 번에 말하기
3. AI가 자동으로 정보 추출 후 일정 추가

### 시나리오 2: 단계별 대화로 일정 추가
1. "일정 추가" 음성 명령
2. AI: "언제 일정을 추가하시겠습니까?"
3. 사용자: "다음 주 월요일"
4. AI: "몇 시로 설정하시겠습니까?"
5. 사용자: "오전 10시"
6. AI: "어떤 일정인가요?"
7. 사용자: "팀 미팅"
8. AI: "다음 주 월요일 오전 10시 팀 미팅 일정을 추가했습니다."

### 시나리오 3: 기본 음성 명령 사용
- "오늘" → 오늘 날짜로 이동
- "다음 달" → 다음 달로 이동
- "월간 보기" → 월간 뷰로 전환

## 🔒 보안 고려사항

- ✅ API 키는 백엔드에서만 관리 (프론트엔드 노출 없음)
- ✅ 환경 변수는 `.gitignore`에 포함
- ✅ CORS는 백엔드에서 제어
- ✅ 사용자 데이터는 서버를 통해서만 처리

## 🚧 현재 제한사항

- 데이터 지속성 없음 (새로고침 시 일정 삭제)
- 주간/일간 뷰는 UI만 존재 (로직 미구현)
- 일정 수정/삭제 기능 없음
- 사용자 인증 없음
- 오프라인 모드 없음

## 🔮 향후 계획

- [ ] localStorage를 통한 클라이언트 데이터 백업
- [ ] 일정 수정/삭제 기능
- [ ] 주간/일간 뷰 로직 구현
- [ ] 반복 일정 지원
- [ ] 알림/리마인더
- [ ] 캘린더 공유
- [ ] PWA 변환
- [ ] 다국어 지원 확장

## 📄 라이선스

ISC

## 🤝 기여

이 프로젝트는 시각장애인의 일정 관리를 돕기 위한 접근성 중심 애플리케이션입니다.
