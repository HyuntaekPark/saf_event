# SAF 파이 이벤트

이름과 도전값을 입력하면 값 중 하나라도 `3.09` 이상 `3.19` 이하일 때 `O`로 판정하는 이벤트 웹사이트입니다. 기록과 설정은 PostgreSQL에 저장됩니다.

## 로컬 실행

```bash
npm install
npm start
```

로컬 주소는 `http://127.0.0.1:5173/` 입니다.

## 환경 변수

`.env.example`을 참고해서 로컬에는 `.env`를 만들고, Vercel 프로젝트에는 `DATABASE_URL` 환경 변수를 등록하세요.

실제 DB 연결 문자열은 GitHub에 올리지 마세요.

## Vercel 배포

1. 이 폴더를 GitHub 저장소로 push합니다.
2. Vercel에서 GitHub 저장소를 import합니다.
3. Project Settings > Environment Variables에 `DATABASE_URL`을 추가합니다.
4. 배포하면 `index.html`과 `/api/*` 서버리스 함수가 함께 동작합니다.
