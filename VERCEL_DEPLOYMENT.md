# 🚀 Vercel 배포 가이드

이 가이드는 KWN 블로그를 Vercel에 배포하는 전체 과정을 설명합니다.

## 📋 사전 준비사항

- [x] GitHub 계정
- [x] Supabase 프로젝트 (이미 설정됨)
- [ ] Git 저장소 (GitHub, GitLab, 또는 Bitbucket)

---

## 1️⃣ Git 저장소 설정

### 현재 프로젝트를 GitHub에 업로드

```bash
# Git 초기화 (아직 안했다면)
git init

# 모든 파일 추가
git add .

# 첫 커밋
git commit -m "Initial commit: KWN Blog"

# GitHub에서 새 저장소 생성 후
git remote add origin https://github.com/your-username/your-repo-name.git
git branch -M main
git push -u origin main
```

---

## 2️⃣ Vercel 계정 생성 및 프로젝트 연결

1. **Vercel 웹사이트 접속**
   - https://vercel.com 방문
   - "Sign Up" 클릭

2. **GitHub로 로그인**
   - "Continue with GitHub" 선택
   - GitHub 계정 연동 승인

3. **새 프로젝트 생성**
   - "Add New..." → "Project" 클릭
   - GitHub 저장소 목록에서 `your-repo-name` 선택
   - "Import" 클릭

---

## 3️⃣ 환경변수 설정 (가장 중요!)

프로젝트 설정 화면에서:

### Supabase 환경변수 가져오기

1. **Supabase 대시보드 접속**
   - https://supabase.com/dashboard
   - 프로젝트 선택
   - 왼쪽 메뉴: "Project Settings" → "API"

2. **Vercel에 환경변수 추가**
   
   Vercel 프로젝트 설정 페이지에서 다음 환경변수를 추가:

   | Name | Value | 어디서 찾나요? |
   |------|-------|--------------|
   | `NEXT_PUBLIC_SUPABASE_URL` | `https://xxxxx.supabase.co` | Supabase > Settings > API > Project URL |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGc...` | Supabase > Settings > API > Project API keys > anon public |

   **중요:** 두 환경변수 모두 `NEXT_PUBLIC_` 접두사가 붙어야 합니다!

---

## 4️⃣ 배포 설정 확인

### Build & Development Settings (자동 감지됨)

Vercel이 자동으로 감지하지만, 확인해보세요:

- **Framework Preset:** Next.js
- **Build Command:** `npm run build` 또는 `next build`
- **Output Directory:** `.next` (자동)
- **Install Command:** `npm install`

### Root Directory
- 기본값 사용 (`.`)

---

## 5️⃣ 배포 시작!

1. **"Deploy" 버튼 클릭**
   - Vercel이 자동으로:
     - 코드 복사
     - 의존성 설치
     - 프로젝트 빌드
     - 배포 완료

2. **배포 진행 확인**
   - 빌드 로그를 실시간으로 볼 수 있습니다
   - 보통 2-3분 소요

3. **배포 완료!**
   - `https://your-project-name.vercel.app` 형태의 URL이 생성됩니다
   - 바로 접속 가능!

---

## 6️⃣ 커스텀 도메인 연결 (선택사항)

### 자체 도메인이 있다면:

1. **Vercel 대시보드**
   - 프로젝트 선택 → "Settings" → "Domains"

2. **도메인 추가**
   - "Add" 클릭
   - 도메인 이름 입력 (예: `kwn.blog`)

3. **DNS 설정**
   
   도메인 등록업체(가비아, 호스팅케이알 등)에서:

   **A 레코드 방식:**
   ```
   Type: A
   Name: @
   Value: 76.76.21.21
   ```

   **CNAME 방식 (권장):**
   ```
   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   ```

4. **SSL 인증서**
   - Vercel이 자동으로 무료 SSL 인증서 발급
   - HTTPS 자동 적용

---

## 7️⃣ 자동 배포 설정

### Git Push = 자동 배포

기본적으로 활성화되어 있습니다:

- `main` 브랜치에 push → 프로덕션 배포
- 다른 브랜치에 push → 미리보기 배포
- Pull Request → 자동 미리보기 URL 생성

```bash
# 코드 수정 후
git add .
git commit -m "Update blog post"
git push

# Vercel이 자동으로 배포 시작!
```

---

## 🔧 배포 후 확인사항

### ✅ 체크리스트

- [ ] 웹사이트가 정상적으로 로드되는가?
- [ ] Supabase 연동이 정상 작동하는가?
- [ ] 블로그 글 작성/수정/삭제가 되는가?
- [ ] 이미지 업로드가 작동하는가?
- [ ] 인증(로그인/회원가입)이 작동하는가?
- [ ] 모든 페이지가 정상적으로 라우팅되는가?

---

## 🐛 문제 해결

### 배포는 성공했는데 Supabase 연결이 안 될 때

1. **환경변수 확인**
   - Vercel 대시보드 → 프로젝트 → Settings → Environment Variables
   - `NEXT_PUBLIC_SUPABASE_URL`과 `NEXT_PUBLIC_SUPABASE_ANON_KEY` 확인

2. **환경변수 수정 후 재배포**
   - 환경변수 변경 후 "Redeploy" 필요
   - Deployments 탭 → 최신 배포 → "..." → "Redeploy"

### 빌드 실패할 때

1. **로컬에서 테스트**
   ```bash
   npm run build
   ```
   로컬에서 빌드가 성공하면 Vercel에서도 성공해야 합니다.

2. **로그 확인**
   - Vercel 배포 로그에서 정확한 에러 메시지 확인
   - TypeScript 오류가 가장 흔함

### 이미지가 안 보일 때

Vercel의 이미지 최적화는 외부 이미지에 제한이 있습니다.

`next.config.mjs`에 추가:
```js
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
    ],
  },
};
```

---

## 💰 비용

### Vercel 무료 플랜 (Hobby)

- ✅ 무제한 배포
- ✅ 무료 SSL
- ✅ 자동 Git 통합
- ✅ 100GB 대역폭/월
- ✅ 빠른 글로벌 CDN

**대부분의 개인 블로그는 무료 플랜으로 충분합니다!**

---

## 📊 배포 후 모니터링

### Vercel Analytics (선택사항)

1. 프로젝트 → "Analytics" 탭
2. 페이지 뷰, 성능 등 확인 가능
3. 무료 플랜에서도 기본 기능 사용 가능

### Supabase 모니터링

1. Supabase 대시보드
2. Database → Usage
3. API 요청, 데이터베이스 크기 확인

---

## 🎉 완료!

축하합니다! 이제 여러분의 블로그가 전 세계에 공개되었습니다!

### 다음 단계

- [ ] Google Search Console에 사이트 등록
- [ ] 구글 애널리틱스 설정
- [ ] SEO 최적화
- [ ] 소셜 미디어 공유 설정

---

## 🆘 도움이 필요하면?

- Vercel 문서: https://vercel.com/docs
- Vercel 커뮤니티: https://github.com/vercel/next.js/discussions
- Supabase 문서: https://supabase.com/docs

---

**제작일:** 2025년 10월 18일  
**버전:** 1.0

