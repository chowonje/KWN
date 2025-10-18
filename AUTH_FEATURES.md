# 🔐 인증 기능 가이드

## 개요

KWN 블로그에는 Supabase Auth를 사용한 완전한 로그인/회원가입 시스템이 구축되어 있습니다.

## 🎯 구현된 기능

### 1. 헤더 UI
- **비로그인 상태**: 로그인/회원가입 버튼 표시
- **로그인 상태**: 사용자 아바타 (이메일 첫 글자) 표시
- **사용자 메뉴**: 아바타 클릭 시 드롭다운 메뉴
  - 사용자 이메일 표시
  - 로그아웃 버튼

### 2. 로그인 페이지 (`/auth/login`)
- 이메일/비밀번호 입력
- 로그인 성공 시 자동으로 홈페이지로 리다이렉트
- 에러 메시지 표시
- 회원가입 페이지로 이동 링크
- 로딩 상태 표시

### 3. 회원가입 페이지 (`/auth/signup`)
- 이름, 이메일, 비밀번호, 비밀번호 확인 입력
- 비밀번호 유효성 검사 (최소 6자)
- 비밀번호 일치 확인
- 가입 성공 시 자동으로 로그인 페이지로 리다이렉트
- 에러 메시지 표시
- 로그인 페이지로 이동 링크

### 4. 인증 컨텍스트
- React Context API를 사용한 전역 상태 관리
- `useAuth()` 훅으로 어디서든 사용자 정보 접근
- 자동 세션 관리
- 로그인/로그아웃 함수 제공

## 📋 사용 방법

### 컴포넌트에서 인증 상태 사용

```typescript
import { useAuth } from '@/lib/auth-context'

export default function MyComponent() {
  const { user, loading, signOut } = useAuth()

  if (loading) {
    return <div>로딩 중...</div>
  }

  if (!user) {
    return <div>로그인이 필요합니다.</div>
  }

  return (
    <div>
      <p>환영합니다, {user.email}!</p>
      <button onClick={signOut}>로그아웃</button>
    </div>
  )
}
```

### 보호된 페이지 만들기

```typescript
'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'

export default function ProtectedPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login')
    }
  }, [user, loading, router])

  if (loading) {
    return <div>로딩 중...</div>
  }

  if (!user) {
    return null
  }

  return (
    <div>
      <h1>보호된 콘텐츠</h1>
      <p>로그인한 사용자만 볼 수 있습니다.</p>
    </div>
  )
}
```

## 🔧 Supabase 설정

### 1. Auth 활성화

Supabase Dashboard → Authentication → Providers:
- Email 프로바이더 활성화
- Enable email signups: ON

### 2. 이메일 확인 비활성화 (개발용)

개발 단계에서는 이메일 확인을 비활성화:

```sql
UPDATE auth.config 
SET config = config || '{"mailer_autoconfirm": true}'::jsonb;
```

### 3. 환경 변수 설정

`.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## 🎨 UI 특징

### 디자인
- 그라디언트 제목
- 부드러운 애니메이션
- 반응형 디자인
- 에러/성공 메시지 표시
- 로딩 상태 표시

### 모바일 최적화
- 768px 이하에서 로그인/회원가입 버튼 숨김 (사용자 아바타만 표시)
- 터치 친화적인 버튼 크기
- 반응형 폼 레이아웃

## 🔒 보안 고려사항

### 현재 구현
- ✅ Supabase Auth를 통한 안전한 비밀번호 해싱
- ✅ HTTPS를 통한 암호화된 통신
- ✅ 클라이언트 측 유효성 검사
- ✅ 세션 자동 관리

### 추가 개선 사항 (프로덕션)
- [ ] 이메일 인증 활성화
- [ ] 비밀번호 재설정 기능
- [ ] 2단계 인증 (2FA)
- [ ] OAuth 로그인 (Google, GitHub 등)
- [ ] Rate limiting
- [ ] 사용자 프로필 페이지
- [ ] 포스트 작성자 추적 (user_id)

## 🚀 다음 단계

### 포스트 작성자 연결

포스트를 작성할 때 현재 로그인한 사용자를 연결:

```typescript
import { useAuth } from '@/lib/auth-context'

export default function WritePost() {
  const { user } = useAuth()

  const handleSubmit = async () => {
    await fetch('/api/posts', {
      method: 'POST',
      body: JSON.stringify({
        slug: 'my-post',
        frontmatter: {
          title: '제목',
          author: user?.email, // 작성자 자동 설정
          // ...
        },
        content: '내용'
      })
    })
  }

  // ...
}
```

### RLS 정책 강화

```sql
-- 포스트 테이블에 user_id 추가
ALTER TABLE posts ADD COLUMN user_id UUID REFERENCES auth.users(id);

-- 로그인한 사용자만 포스트 생성
CREATE POLICY "Authenticated users can create posts"
ON posts FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

-- 자신의 포스트만 수정/삭제
CREATE POLICY "Users can update own posts"
ON posts FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own posts"
ON posts FOR DELETE
USING (auth.uid() = user_id);
```

## 📚 참고 자료

- [Supabase Auth 문서](https://supabase.com/docs/guides/auth)
- [Next.js Authentication](https://nextjs.org/docs/authentication)
- [React Context API](https://react.dev/learn/passing-data-deeply-with-context)

## 🐛 문제 해결

### "로그인 기능이 작동하지 않습니다"
- Supabase 환경 변수가 `.env.local`에 설정되어 있는지 확인
- 개발 서버를 재시작했는지 확인
- Supabase Auth가 활성화되어 있는지 확인

### "회원가입 후 이메일 확인이 필요합니다"
- 개발 단계에서는 이메일 확인을 비활성화 (위 SQL 참고)
- 또는 Supabase Dashboard → Authentication → Email Templates에서 설정

### "사용자 메뉴가 안 닫힙니다"
- 외부 클릭 감지 기능이 구현되어 있으므로 메뉴 외부를 클릭하면 닫힙니다

## ✅ 테스트

### 로그인 테스트
1. `/auth/signup`에서 계정 생성
2. `/auth/login`에서 로그인
3. 헤더에 사용자 아바타 확인
4. 아바타 클릭하여 메뉴 확인
5. 로그아웃 후 다시 로그인/회원가입 버튼 확인

### 보호된 페이지 테스트
1. 로그아웃 상태에서 보호된 페이지 접근
2. 자동으로 로그인 페이지로 리다이렉트 확인
3. 로그인 후 페이지 접근 가능 확인


