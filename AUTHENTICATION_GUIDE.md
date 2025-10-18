# 🔐 Supabase Authentication 설정 가이드

이 가이드는 KWN 프로젝트에서 Supabase 기반 로그인 기능을 설정하는 방법을 안내합니다.

## 📋 목차
1. [환경 변수 설정](#1-환경-변수-설정)
2. [Supabase 대시보드 설정](#2-supabase-대시보드-설정)
3. [테스트](#3-테스트)
4. [문제 해결](#4-문제-해결)

---

## 1. 환경 변수 설정

### `.env.local` 파일 생성

프로젝트 루트에 `.env.local` 파일을 생성하고 다음 내용을 추가하세요:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://uqypdqhxnxtkhuwlgdln.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVxeXBkcWh4bnh0a2h1d2xnZGxuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1NDE5NDIsImV4cCI6MjA3NjExNzk0Mn0.cKc5S3zddSS73T2ILRaRmYk_p1NYk32XaesH8irCF7Q
```

⚠️ **주의**: `.env.local` 파일은 절대 Git에 커밋하지 마세요! (`.gitignore`에 이미 포함되어 있습니다)

---

## 2. Supabase 대시보드 설정

### 2.1 Authentication 활성화

1. **Supabase 대시보드 접속**
   - https://supabase.com/dashboard 에 로그인
   - 프로젝트 `uqypdqhxnxtkhuwlgdln` 선택

2. **Authentication 메뉴로 이동**
   - 왼쪽 사이드바에서 **Authentication** 클릭

### 2.2 Email Auth 설정

1. **Settings → Auth 이동**
   ```
   Authentication → Configuration → Settings
   ```

2. **Email Authentication 활성화**
   - `Enable Email Signup` 체크 ✅
   - `Confirm Email` 옵션:
     - **개발 중**: 체크 해제 (바로 회원가입)
     - **프로덕션**: 체크 (이메일 인증 필요)

3. **Site URL 설정** (중요!)
   ```
   Site URL: http://localhost:3000
   ```
   
   프로덕션 배포 시:
   ```
   Site URL: https://yourdomain.com
   ```

4. **Redirect URLs 추가**
   ```
   http://localhost:3000/**
   ```
   
   프로덕션:
   ```
   https://yourdomain.com/**
   ```

### 2.3 Email Templates 설정 (선택사항)

이메일 인증을 사용하는 경우:

1. **Authentication → Email Templates** 이동

2. **Confirm signup** 템플릿 커스터마이즈
   ```html
   <h2>KWN 가입을 환영합니다!</h2>
   <p>아래 링크를 클릭하여 이메일을 인증하세요:</p>
   <p><a href="{{ .ConfirmationURL }}">이메일 인증하기</a></p>
   ```

3. **Reset Password** 템플릿 커스터마이즈
   ```html
   <h2>비밀번호 재설정</h2>
   <p>아래 링크를 클릭하여 비밀번호를 재설정하세요:</p>
   <p><a href="{{ .ConfirmationURL }}">비밀번호 재설정하기</a></p>
   ```

### 2.4 정책(Policies) 설정 (선택사항)

데이터베이스 보안을 위해 RLS(Row Level Security)를 설정할 수 있습니다:

1. **Table Editor → posts** 테이블 선택

2. **RLS 활성화**
   - `Enable Row Level Security` 클릭

3. **정책 추가**
   
   **읽기 권한 (모두 허용)**:
   ```sql
   CREATE POLICY "Enable read access for all users"
   ON posts FOR SELECT
   USING (true);
   ```

   **쓰기 권한 (로그인 사용자만)**:
   ```sql
   CREATE POLICY "Enable insert for authenticated users only"
   ON posts FOR INSERT
   WITH CHECK (auth.role() = 'authenticated');
   
   CREATE POLICY "Enable update for authenticated users only"
   ON posts FOR UPDATE
   USING (auth.role() = 'authenticated');
   
   CREATE POLICY "Enable delete for authenticated users only"
   ON posts FOR DELETE
   USING (auth.role() = 'authenticated');
   ```

---

## 3. 테스트

### 3.1 개발 서버 실행

```bash
npm run dev
```

### 3.2 회원가입 테스트

1. http://localhost:3000/auth/signup 접속
2. 테스트 계정 정보 입력:
   ```
   이름: 홍길동
   이메일: test@example.com
   비밀번호: test1234
   ```
3. 회원가입 버튼 클릭
4. 성공 메시지 확인 후 자동으로 로그인 페이지로 이동

### 3.3 로그인 테스트

1. http://localhost:3000/auth/login 접속
2. 방금 생성한 계정으로 로그인
3. 헤더에 사용자 아이콘 표시 확인
4. 아이콘 클릭 → 이메일 표시 및 로그아웃 버튼 확인

### 3.4 보호된 페이지 테스트

1. 로그아웃 상태에서 http://localhost:3000/category/write 접속
2. 자동으로 로그인 페이지로 리다이렉트 확인
3. 로그인 후 글쓰기 페이지 접근 가능 확인

---

## 4. 문제 해결

### 문제 1: "Supabase가 설정되지 않았습니다" 에러

**원인**: `.env.local` 파일이 없거나 환경 변수가 잘못됨

**해결**:
1. `.env.local` 파일 존재 확인
2. 환경 변수 이름이 정확한지 확인 (`NEXT_PUBLIC_` 접두사 필수)
3. 개발 서버 재시작: `npm run dev`

### 문제 2: "Invalid login credentials" 에러

**원인**: 
- 이메일/비밀번호가 틀림
- 이메일 인증이 필요한데 인증하지 않음

**해결**:
1. Supabase 대시보드 → Authentication → Users에서 사용자 확인
2. `Confirm Email` 옵션 해제 (개발 중)
3. 비밀번호는 최소 6자 이상이어야 함

### 문제 3: 회원가입 후 이메일이 오지 않음

**원인**: 
- SMTP 설정이 안 됨 (Supabase 무료 플랜은 이메일 제한)
- Site URL이 잘못 설정됨

**해결**:
1. 개발 중에는 `Confirm Email` 옵션 해제
2. Supabase 대시보드 → Authentication → Users에서 수동으로 이메일 확인 처리
3. 프로덕션에서는 SMTP 설정 필요

### 문제 4: "redirect_to not allowed" 에러

**원인**: Redirect URLs 설정이 안 됨

**해결**:
1. Supabase 대시보드 → Authentication → URL Configuration
2. Redirect URLs에 `http://localhost:3000/**` 추가
3. 프로덕션 URL도 추가

### 문제 5: 로그인 후에도 user가 null

**원인**: 
- 세션이 제대로 로드되지 않음
- 브라우저 쿠키가 차단됨

**해결**:
1. 브라우저 콘솔에서 에러 확인
2. 브라우저 쿠키 설정 확인
3. 페이지 새로고침
4. 로컬스토리지 클리어 후 재로그인

---

## 5. 추가 기능

### 5.1 소셜 로그인 추가 (Google, GitHub 등)

1. **Supabase 대시보드 → Authentication → Providers**
2. 원하는 소셜 로그인 제공자 선택 (Google, GitHub, etc.)
3. Client ID와 Client Secret 입력
4. Redirect URL 복사하여 각 제공자에 등록

### 5.2 비밀번호 재설정 기능

```typescript
// lib/auth-context.tsx에 추가
const resetPassword = async (email: string) => {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/auth/reset-password`,
  })
  return { error }
}
```

### 5.3 사용자 프로필 업데이트

```typescript
const updateProfile = async (updates: { name?: string; avatar?: string }) => {
  const { error } = await supabase.auth.updateUser({
    data: updates
  })
  return { error }
}
```

---

## 6. 보안 체크리스트

- [ ] `.env.local` 파일이 `.gitignore`에 포함되어 있음
- [ ] Supabase Anon Key는 프론트엔드에 노출 가능 (읽기 전용)
- [ ] Service Role Key는 **절대** 프론트엔드에 노출하지 않음
- [ ] RLS(Row Level Security) 정책이 설정되어 있음
- [ ] 프로덕션에서는 이메일 인증 활성화
- [ ] HTTPS 사용 (프로덕션)
- [ ] CORS 설정 확인

---

## 7. 참고 자료

- [Supabase Authentication 공식 문서](https://supabase.com/docs/guides/auth)
- [Next.js + Supabase 가이드](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)
- [Row Level Security (RLS)](https://supabase.com/docs/guides/auth/row-level-security)

---

## 🎉 완료!

이제 KWN 프로젝트에서 Supabase 기반 로그인 기능을 사용할 수 있습니다!

문제가 있다면 Supabase 대시보드의 Logs 섹션에서 에러를 확인하세요.

