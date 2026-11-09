# memento

Next.js App Router + Tailwind CSS 기반의 반응형 기록 앱입니다.

## 구조

- `app/(main)/page.tsx` 오늘의 기록
- `app/(main)/calendar/page.tsx` 날짜별 달력
- `app/(main)/todos/page.tsx` 전체 날짜 to-do
- `app/(main)/settings/page.tsx` 사용자 카테고리 추가
- `app/auth/page.tsx` 로그인/회원가입/아이디·비밀번호 찾기
- `app/auth/reset-password/page.tsx` 비밀번호 변경
- `app/splash/page.tsx` 동적 스플래시
- `components/` 공통 쉘·위젯·Supabase 상태
- `lib/categories.ts` 자동 분류 및 기본 팔레트
- `app/globals.css` Tailwind 색상 토큰 팔레트

## Supabase

`supabase/schema.sql`을 SQL Editor에서 실행하세요. `auth.users`는 Supabase Auth 내부 스키마의 사용자 테이블이라 일반 `public` 테이블 목록에 보이지 않을 수 있습니다. 사용자는 Authentication → Users에서 확인합니다.

환경변수:

```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

Google은 Supabase Auth Provider에서 활성화하면 바로 사용할 수 있습니다. Naver는 Supabase의 Custom OIDC/OAuth 제공자로 등록한 뒤 provider 이름을 맞춰 활성화해야 합니다.

## 실행

```bash
npm install
npm run dev
npm run build
```

Vercel에는 위 두 환경변수를 Production/Preview/Development에 등록하고, Supabase Authentication → URL Configuration에 Vercel 도메인과 `http://localhost:3000/**`를 Redirect URL로 추가하세요.

## 처방전 자동 등록

`/medications`에서 처방전(JPG/PNG/WebP/PDF, 3MB 이하)을 올려 여러 약을 자동 추출하고, 원본과 비교한 뒤 일괄 등록합니다. 로그인과 Supabase 스키마 적용이 필요합니다. 서버 환경변수 `OPENAI_API_KEY`를 설정하세요. 모델은 `OPENAI_OCR_MODEL`로 지정하며 기본값은 `gpt-4.1-mini`입니다. 키를 NEXT_PUBLIC 변수에 넣지 마세요.

인식 요청 시 처방전은 OpenAI로 전송됩니다. API 요청은 `store: false`를 사용하며 앱은 OCR 원본을 별도 저장하지 않습니다. 불명확한 정보는 빈칸과 경고로 표시하며 용량을 추정하지 않습니다. 일괄 등록은 하나의 DB insert로 처리합니다. 기존 첨부 기능은 별도로 유지됩니다.

검증 시 실제 처방전·API 키가 필요하며, API 키 미설정 시 서비스 설정 안내를 표시합니다.

배포 후 필요한 API·DB·알림 설정은 [퇴근 후 설정 목록](docs/AFTER_WORK.md)을 참고하세요.
