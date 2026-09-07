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
