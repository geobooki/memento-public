# 퇴근 후 설정할 항목

## 1. 처방전 OCR 활성화
- Vercel → 프로젝트 → Settings → Environment Variables에서 `OPENAI_API_KEY`를 서버 변수로 추가합니다. Production/Preview 적용 범위를 확인하고 재배포합니다.
- 선택: `OPENAI_OCR_MODEL` (기본 `gpt-4.1-mini`). 키를 저장소나 `NEXT_PUBLIC_` 변수에 넣지 않습니다.
- `/medications`에 로그인하여 처방전 사진/PDF(3MB 이하)를 인식하고 원본 대조 후 일괄 등록합니다. 새로고침 후 등록 약이 유지되는지 확인합니다.
- OCR 원본은 인식 시 OpenAI로 전송되며 앱에 자동 보관되지 않습니다.

## 2. Supabase 복약 관리 확인
- 기존 프로젝트에 `supabase/schema.sql`의 `medications`, `medication_logs`, `medication_changes` 테이블 및 사용자별 RLS 정책이 있는지 확인합니다.
- 첨부 기능을 쓰려면 비공개 `medication-documents` 버킷과 사용자 폴더별 정책도 확인합니다.
- 이번 OCR 변경은 기존 복약 테이블을 사용하므로 새 컬럼은 필요 없습니다. 운영 DB에 SQL은 자동 실행하지 않았습니다.

## 3. 백그라운드 할 일 알림
- Vercel Hobby에서 배포할 수 있도록 기본 cron은 매일 09:00 UTC(한국 18:00)로 설정했습니다. 요금제 특성상 실행은 해당 시간대 안에서 지연될 수 있으며, 그 뒤 도래한 알림은 다음 실행까지 늦어질 수 있습니다.
- 정확한 시각·5분 뒤 알림을 지원하려면 Pro의 분 단위 cron 또는 외부 스케줄러를 설정합니다. 외부 호출은 `GET /api/cron/reminders`, `Authorization: Bearer <CRON_SECRET>`를 사용합니다.
- 서버 변수: `SUPABASE_SERVICE_ROLE_KEY`, `CRON_SECRET`, `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT`. 클라이언트 변수: `NEXT_PUBLIC_VAPID_PUBLIC_KEY`. 공개키 두 변수에는 같은 값을 설정합니다.
- 로그인한 브라우저에서 알림을 허용한 뒤 테스트용 할 일을 만들고 실제 수신을 확인합니다. 키 값은 문서나 GitHub에 남기지 않습니다.
