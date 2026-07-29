# memento — 하루 기록 관리

Next.js App Router와 Tailwind CSS로 만든 반응형 기록 관리 앱입니다.

## 실행

```bash
npm install
npm run dev
```

브라우저에서 `http://localhost:3000`을 엽니다. 프로덕션 빌드는 `npm run build` 후 `npm start`로 실행합니다.

## Supabase 연결

1. Supabase에서 새 프로젝트를 만듭니다.
2. SQL Editor에서 [`supabase/schema.sql`](./supabase/schema.sql)의 내용을 실행합니다.
3. Project Settings → API에서 Project URL과 publishable/anon key를 확인합니다.
4. `.env.example`을 `.env.local`로 복사하고 값을 입력합니다.

```bash
cp .env.example .env.local
```

환경변수를 입력하면 앱은 로그인 화면으로 전환되고, 모든 기록을 로그인한 사용자의 `entries` 테이블에 저장합니다. Supabase의 이메일 확인 설정이 켜져 있으면 회원가입 후 확인 메일을 눌러야 로그인할 수 있습니다.

## Vercel 배포

1. 이 폴더를 GitHub 저장소에 push합니다.
2. Vercel에서 `Add New → Project`로 저장소를 import합니다.
3. Vercel Project Settings → Environment Variables에 다음 두 값을 추가합니다.
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy를 실행합니다.

Vercel은 `vercel.json`의 Next.js 설정을 자동으로 인식합니다. 배포 후 Supabase Authentication → URL Configuration의 Site URL과 Redirect URLs에 Vercel 도메인(예: `https://your-app.vercel.app`)을 추가해야 이메일 인증 redirect가 정상 동작합니다.

## 사용자 흐름

1. 상단 입력창에 업무 메모, 일기, 감정, 아이디어, 할 일을 한 줄로 입력합니다.
2. `자동 분류` 상태로 기록하면 키워드 기반으로 카테고리를 지정합니다. 필요하면 직접 카테고리를 선택할 수 있습니다.
3. 오늘의 타임라인에서 시간순 기록, 카테고리 필터, 하루 요약을 확인합니다.
4. 날짜별 보기에서 기록이 있는 날짜를 선택해 해당 날짜의 타임라인을 확인합니다.
5. 할 일 모아보기에서 전체 기간, 최근 7일, 미완료만 필터링하고 완료 상태를 토글합니다.
6. 검색 아이콘으로 기록과 할 일을 키워드 검색하고, 각 기록의 `카테고리 수정`으로 분류를 직접 고칩니다.

## 데이터 구조

기록은 브라우저 `localStorage`의 `memento-entries` 키에 배열로 저장됩니다.

```js
{
  id: 1718582400000,
  date: "2024-06-17",
  time: "14:20",
  text: "이번 주 금요일까지 제안서 초안 완성하기",
  category: "todo", // work | journal | emotion | todo | idea | other
  done: false
}
```

외부 서버 없이 동작하는 프로토타입이므로 같은 브라우저 안에서 기록이 유지됩니다.
=======
