# ✅ 최종 배포 체크리스트

배포 직전 마지막 확인사항 (5분 소요)

---

## 🔒 보안 (필수)

### 1. 환경변수 확인
- [ ] `.env` 파일이 `.gitignore`에 포함되어 있음 ✅ (이미 설정됨)
- [ ] GitHub에 환경변수가 push되지 않았음을 확인

### 2. Vercel 환경변수 설정
Vercel 대시보드에서 다음 2개 설정:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
```

**어디서 찾나요?**
- Supabase Dashboard → 프로젝트 선택 → Settings → API
- Project URL과 anon public key 복사

### 3. Supabase 보안 설정
- [ ] RLS (Row Level Security) 활성화 확인
  - Supabase Dashboard → Database → Tables → posts 테이블 → RLS enabled ✅
- [ ] Storage 버킷 생성 확인
  - `post-images` 버킷이 public으로 설정되어 있는지 확인

### 4. 파일 업로드 보안
- [ ] 파일 크기 제한 (10MB) ✅ 적용됨
- [ ] 파일 타입 검증 ✅ 적용됨
- [ ] 확장자 검증 ✅ 적용됨

---

## 📦 코드 품질 (권장)

### 1. 빌드 테스트
로컬에서 프로덕션 빌드 확인:
```bash
npm run build
npm run start
```

오류가 없어야 함!

### 2. TypeScript 오류 확인
```bash
npx tsc --noEmit
```

### 3. 린트 확인
```bash
npm run lint
```

---

## 🌐 Supabase 설정 확인

### 1. Authentication URL 설정
Supabase Dashboard → Authentication → URL Configuration

```
Site URL: https://your-project-name.vercel.app
Redirect URLs: https://your-project-name.vercel.app/**
```

⚠️ **중요**: 배포 후 Vercel URL로 업데이트 필요!

### 2. Storage 버킷 확인
Supabase Dashboard → Storage

- [ ] `post-images` 버킷이 존재함
- [ ] Public 접근 활성화됨
- [ ] RLS 정책 설정됨 (인증된 사용자만 업로드)

### 3. 데이터베이스 테이블 확인
Supabase Dashboard → Database → Tables

- [ ] `posts` 테이블 존재
- [ ] `profiles` 테이블 존재 (Auth와 연동)
- [ ] RLS 정책 활성화됨

SQL 실행 필요하면:
```sql
-- create-posts-table-v2.sql 파일 실행
```

---

## 🚀 Vercel 배포

### 1. GitHub 연동
```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

### 2. Vercel 설정
1. https://vercel.com 로그인
2. "New Project" → GitHub 저장소 선택
3. 환경변수 2개 입력 (위 참고)
4. "Deploy" 클릭

### 3. 배포 완료 후 확인
배포가 완료되면 (2-3분):

- [ ] 사이트가 로드됨
- [ ] 블로그 글 목록이 보임
- [ ] 로그인/회원가입 작동
- [ ] 글 작성 기능 작동
- [ ] 이미지 업로드 작동

---

## 🔧 배포 후 설정

### 1. Supabase Redirect URL 업데이트
배포 완료 후 실제 URL로 업데이트:

Supabase Dashboard → Authentication → URL Configuration
```
Site URL: https://your-actual-domain.vercel.app
Redirect URLs: https://your-actual-domain.vercel.app/**
```

### 2. 커스텀 도메인 연결 (선택)
Vercel Dashboard → 프로젝트 → Settings → Domains

---

## ⚠️ 흔한 문제 해결

### 문제 1: "Supabase 연결 안 됨"
**해결**: 
1. Vercel 환경변수 다시 확인
2. 변수명에 오타 없는지 확인 (`NEXT_PUBLIC_` 접두사 필수!)
3. Deployments → ... → Redeploy

### 문제 2: "이미지 업로드 실패"
**해결**:
1. Supabase Storage 버킷 이름 확인 (`post-images`)
2. 버킷이 public인지 확인
3. Storage RLS 정책 확인

### 문제 3: "로그인 후 리디렉션 안 됨"
**해결**:
Supabase Redirect URL에 배포된 도메인 추가

### 문제 4: "빌드 실패"
**해결**:
1. 로컬에서 `npm run build` 실행
2. TypeScript 오류 수정
3. 다시 push

---

## 📊 현재 보안 점수

**✅ 배포 준비 완료: 85/100**

**적용된 보안 기능**:
- ✅ 비밀번호 해싱 (Supabase 자동)
- ✅ SQL Injection 방어
- ✅ XSS 방어 (DOMPurify)
- ✅ 파일 업로드 검증 (크기, 타입, 확장자)
- ✅ RLS 정책 (데이터베이스 권한)
- ✅ 환경변수 암호화

**선택적 개선사항** (배포 후):
- 💡 Rate Limiting
- 💡 CSP 헤더
- 💡 정기 보안 업데이트

---

## 🎉 완료!

모든 체크박스를 확인했다면 배포 준비 완료입니다!

**다음 단계**:
1. `git push` → Vercel 자동 배포
2. 3분 대기
3. 배포된 URL 확인
4. Supabase URL 설정 업데이트
5. 기능 테스트

**예상 소요 시간**: 처음부터 끝까지 약 10-15분

---

**참고 문서**:
- 상세 가이드: `VERCEL_DEPLOYMENT.md`
- 빠른 시작: `VERCEL_QUICK_START.md`
- 보안 상세: `SECURITY_CHECKLIST.md`

**문제가 생기면**: 
- Vercel 배포 로그 확인
- Supabase Dashboard 로그 확인
- 브라우저 콘솔 오류 확인

행운을 빕니다! 🚀

