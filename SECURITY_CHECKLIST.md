# 🔒 보안 체크리스트 및 권장사항

배포 전 필수 확인사항과 보안 개선 권장사항을 정리했습니다.

## ✅ 현재 잘 구현된 보안 사항

### 1. **비밀번호 해싱** ✅
- **상태**: 안전
- **구현**: Supabase Auth가 자동으로 bcrypt를 사용하여 비밀번호 해싱 처리
- **위치**: `lib/auth-context.tsx`
- **조치 불필요**: Supabase가 자동 관리

### 2. **SQL Injection 방지** ✅
- **상태**: 안전
- **구현**: Supabase 클라이언트 라이브러리 사용으로 Prepared Statements 자동 적용
- **위치**: `lib/supabase-posts.ts`, `app/api/posts/route.ts`
- **조치 불필요**: ORM/클라이언트 라이브러리가 자동 방어

### 3. **XSS (Cross-Site Scripting) 방지** ✅
- **상태**: 양호
- **구현**: DOMPurify 라이브러리로 HTML 살균(sanitization)
- **위치**: `app/blog/[slug]/page.tsx` (Line 191, 287)
```typescript
dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(content) }}
```
- **권장사항**: 계속 유지

### 4. **Row Level Security (RLS)** ✅
- **상태**: 잘 설정됨
- **구현**: Supabase RLS 정책으로 데이터베이스 레벨 권한 관리
- **위치**: `create-posts-table-v2.sql` (Line 66-94)
- **정책**:
  - 모든 사용자: published 글 읽기 가능
  - 인증된 사용자: 글 작성 가능
  - 작성자만: 본인 글 수정/삭제 가능

### 5. **환경변수 관리** ✅
- **상태**: 안전
- **구현**: `.gitignore`에 `.env*` 포함
- **위치**: `.gitignore` (Line 28-29)
- **조치 불필요**: 이미 잘 설정됨

---

## ⚠️ 개선이 필요한 보안 사항

### 1. **파일 업로드 검증** ⚠️ 중요도: 높음

**현재 문제**:
- 파일 타입 검증이 클라이언트에서만 이루어짐 (`accept="image/*"`)
- 파일 크기 제한 없음
- 악성 파일 업로드 가능성

**위치**: `app/api/upload/route.ts`, `components/RichTextEditor.tsx`

**권장 개선 사항**:
```typescript
// app/api/upload/route.ts
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // 🔒 파일 크기 검증 (10MB 제한)
    const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ 
        error: '파일 크기는 10MB를 초과할 수 없습니다.' 
      }, { status: 400 })
    }

    // 🔒 파일 타입 검증 (화이트리스트)
    const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ 
        error: '지원하지 않는 파일 형식입니다. (jpg, png, gif, webp만 가능)' 
      }, { status: 400 })
    }

    // 🔒 파일 확장자 재검증 (MIME type 위조 방지)
    const fileExt = file.name.split('.').pop()?.toLowerCase()
    const ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'gif', 'webp']
    if (!fileExt || !ALLOWED_EXTENSIONS.includes(fileExt)) {
      return NextResponse.json({ 
        error: '잘못된 파일 확장자입니다.' 
      }, { status: 400 })
    }

    // 기존 업로드 로직...
  }
}
```

---

### 2. **Storage 버킷 이름 불일치** ⚠️ 중요도: 중간

**현재 문제**:
- SQL 파일: `post-images` 버킷 생성
- 업로드 API: `blog-images` 버킷 사용
- 불일치로 인한 오류 가능성

**위치**:
- `create-posts-table-v2.sql` (Line 97): `post-images`
- `app/api/upload/route.ts` (Line 36): `blog-images`

**해결 방법**: 둘 중 하나로 통일
```typescript
// 옵션 1: 코드 수정 (권장)
.from('post-images')  // SQL과 일치시키기

// 옵션 2: SQL 수정
-- SQL 파일에서 blog-images로 변경
```

---

### 3. **API Rate Limiting 미설정** ⚠️ 중요도: 중간

**현재 문제**:
- API 엔드포인트에 요청 제한 없음
- DDoS, 브루트포스 공격에 취약

**권장 사항**:
Vercel 배포 시 자동으로 일부 보호되지만, 추가 보호를 위해 다음 옵션 고려:

**옵션 1: Vercel Edge Config (무료 플랜)**
```typescript
// middleware.ts (새로 생성)
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// 간단한 IP 기반 Rate Limiting
const requestCounts = new Map<string, { count: number; resetTime: number }>()

export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith('/api/')) {
    const ip = request.ip || 'unknown'
    const now = Date.now()
    const windowMs = 60 * 1000 // 1분
    const maxRequests = 100 // 1분에 100번

    const record = requestCounts.get(ip)
    if (record && now < record.resetTime) {
      if (record.count >= maxRequests) {
        return NextResponse.json(
          { error: 'Too many requests' },
          { status: 429 }
        )
      }
      record.count++
    } else {
      requestCounts.set(ip, { count: 1, resetTime: now + windowMs })
    }
  }
  return NextResponse.next()
}
```

**옵션 2: Supabase Rate Limiting (무료)**
- Supabase Auth는 기본적으로 Rate Limiting 적용됨
- 추가 설정 불필요

---

### 4. **CORS 설정** ⚠️ 중요도: 낮음

**현재 상태**: Next.js 기본 설정 사용

**배포 시 추가 고려사항**:
```javascript
// next.config.mjs
const nextConfig = {
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: process.env.NEXT_PUBLIC_SITE_URL || '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,DELETE,PATCH,POST,PUT' },
          { key: 'Access-Control-Allow-Headers', value: 'Authorization, Content-Type' },
        ],
      },
    ]
  },
}
```

---

### 5. **인증 토큰 검증 강화** ⚠️ 중요도: 중간

**현재 구현**:
```typescript
// app/api/posts/route.ts
const token = req.headers.get('authorization')?.replace('Bearer ', '')
```

**개선 권장사항**:
```typescript
// 토큰 만료 확인 추가
const { data: { user }, error: authError } = await supabase.auth.getUser()

if (authError || !user) {
  return NextResponse.json({ 
    error: '인증이 필요합니다. 다시 로그인해주세요.' 
  }, { status: 401 })
}

// 토큰 갱신이 필요한 경우 클라이언트에 알림
// Supabase는 자동으로 만료된 토큰을 갱신하므로 추가 구현 불필요
```

**이미 잘 구현됨**: Line 70-74에서 제대로 확인 중 ✅

---

### 6. **Content Security Policy (CSP)** ⚠️ 중요도: 낮음

**현재 상태**: 미설정

**배포 시 권장사항**:
```javascript
// next.config.mjs
const nextConfig = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: `
              default-src 'self';
              script-src 'self' 'unsafe-inline' 'unsafe-eval';
              style-src 'self' 'unsafe-inline';
              img-src 'self' data: https:;
              font-src 'self' data:;
              connect-src 'self' https://*.supabase.co;
            `.replace(/\\n/g, ''),
          },
        ],
      },
    ]
  },
}
```

**참고**: 개발 중에는 비활성화하고, 프로덕션 배포 전에만 활성화

---

## 🚀 Vercel 배포 시 추가 보안 설정

### 1. **환경변수 보안 설정**

Vercel 대시보드에서 다음 환경변수를 **Production + Preview**에 모두 설정:

```bash
# 필수
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# 선택 (추가 보안)
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key  # 서버 사이드에서만 사용
```

**주의**: `SUPABASE_SERVICE_ROLE_KEY`는 절대 클라이언트에 노출되면 안 됨!

---

### 2. **Supabase 보안 설정**

**Supabase Dashboard → Authentication → URL Configuration**
```
Site URL: https://your-domain.vercel.app
Redirect URLs: 
  - https://your-domain.vercel.app/**
```

**Supabase Dashboard → Authentication → Email Auth**
- Enable email confirmations: ✅
- Secure email change: ✅
- Email OTP 활성화 권장

---

### 3. **프로덕션 체크리스트**

배포 전 필수 확인:
- [ ] 모든 `.env` 파일이 `.gitignore`에 포함됨
- [ ] Vercel에 환경변수 설정 완료
- [ ] Supabase RLS 정책 활성화 확인
- [ ] Storage 버킷 public 접근 권한 확인
- [ ] 파일 업로드 검증 코드 추가
- [ ] Rate Limiting 설정 (선택)
- [ ] 도메인 HTTPS 인증서 자동 발급 확인 (Vercel 자동)

---

## 📊 보안 우선순위

### 즉시 조치 필요 (배포 전):
1. ✅ 환경변수 Vercel에 설정
2. ⚠️ 파일 업로드 검증 추가
3. ⚠️ Storage 버킷 이름 통일

### 배포 후 개선 권장:
1. Rate Limiting 추가
2. CSP 헤더 설정
3. 정기 보안 업데이트 확인

---

## 🔐 추가 보안 권장사항

### 1. **정기적인 패키지 업데이트**
```bash
# 보안 취약점 스캔
npm audit

# 자동 수정
npm audit fix

# 주요 패키지 업데이트
npm update
```

### 2. **Supabase 로그 모니터링**
- Supabase Dashboard → Logs 탭에서 비정상 활동 확인
- 실패한 인증 시도 모니터링

### 3. **백업 설정**
- Supabase Pro 플랜: 자동 백업 활성화
- 무료 플랜: 중요 데이터 정기 export

---

## 🎯 요약

### 현재 보안 상태: **양호 (70/100)**

**강점**:
- ✅ 비밀번호 자동 해싱
- ✅ SQL Injection 방어
- ✅ XSS 방어 (DOMPurify)
- ✅ RLS 정책 적용

**개선 필요**:
- ⚠️ 파일 업로드 검증
- ⚠️ Storage 버킷 이름 통일
- 💡 Rate Limiting (선택)
- 💡 CSP 헤더 (선택)

**배포 가능 여부**: ✅ **가능** (파일 업로드 검증 추가 후 권장)

---

**작성일**: 2025년 10월 18일  
**다음 리뷰**: 배포 후 1개월 뒤

