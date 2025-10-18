# KWN 복지 뉴스 블로그

복지 관련 뉴스와 정보를 공유하는 Next.js 기반 블로그 플랫폼입니다.

## ✨ 주요 기능

- 📝 **MDX & Supabase 하이브리드**: MDX 파일 또는 Supabase 데이터베이스 사용 가능
- 🎨 **현대적인 UI**: Tailwind CSS 기반의 깔끔한 디자인
- 🔐 **로그인/회원가입**: Supabase Auth 기반 사용자 인증 시스템
- 👤 **사용자 프로필**: 사용자 아바타 및 메뉴
- 🏷️ **카테고리 시스템**: 아동/청소년, 청년, 중장년/노인, 여성, 장애인 카테고리
- 🔖 **태그 & 검색**: 태그 기반 포스트 분류
- ⭐ **추천 포스트**: Featured 포스트 강조 표시
- 📱 **반응형 디자인**: 모바일부터 데스크탑까지 완벽 지원

## 🚀 빠른 시작

### 요구사항
- Node.js 18 이상

### 설치 및 실행

```bash
# 1) 패키지 설치
npm install

# 2) 개발 서버 실행
npm run dev

# 3) 브라우저에서 확인
# http://localhost:3000
```

## 🗄️ Supabase 연동 (선택사항)

Supabase를 사용하여 데이터베이스에 포스트를 저장하고 관리할 수 있습니다.

### Supabase 설정

자세한 설정 방법은 **[SUPABASE_SETUP.md](./SUPABASE_SETUP.md)** 파일을 참고하세요.

간단 요약:
1. Supabase 프로젝트 생성
2. 데이터베이스 스키마 생성 (SQL 쿼리 실행)
3. Supabase Auth 활성화 (로그인/회원가입용)
4. `.env.local` 파일에 환경 변수 추가
5. 개발 서버 재실행

**환경 변수가 없으면 기존 MDX 방식으로 동작합니다.**

### 로그인/회원가입 기능

이미 구현되어 있습니다!
- `/auth/login` - 로그인 페이지
- `/auth/signup` - 회원가입 페이지
- 헤더의 로그인/회원가입 버튼 (로그인 시 사용자 메뉴로 변경)
- Supabase Auth를 통한 안전한 인증

## 📁 프로젝트 구조

```
├── app/
│   ├── api/              # API 라우트 (포스트 CRUD)
│   ├── auth/             # 인증 페이지
│   │   ├── login/        # 로그인 페이지
│   │   └── signup/       # 회원가입 페이지
│   ├── category/         # 카테고리 페이지
│   ├── globals.css       # 글로벌 스타일
│   ├── layout.tsx        # 루트 레이아웃 (AuthProvider 포함)
│   └── page.tsx          # 홈페이지
├── components/
│   ├── Header.tsx        # 헤더 컴포넌트
│   ├── HomeList.tsx      # 포스트 목록 (카드 UI)
│   └── SiteHeader.tsx    # 사이드 패널 (로그인/사용자 메뉴)
├── lib/
│   ├── posts.ts          # MDX 포스트 관리
│   ├── categories.ts     # 카테고리 정의
│   ├── supabase.ts       # Supabase 클라이언트
│   ├── supabase-posts.ts # Supabase 포스트 관리
│   └── auth-context.tsx  # 인증 컨텍스트 (React Context)
├── content/
│   └── blog/             # MDX 블로그 포스트
└── public/               # 정적 파일
```

## 📝 포스트 작성

### 방법 1: MDX 파일 (기본)

`content/blog/` 디렉토리에 `.mdx` 파일 생성:

```mdx
---
title: 포스트 제목
date: 2024-01-15
summary: 간단한 요약
category: youth
tags: [복지, 청년]
author: 홍길동
featured: true
status: published
---

# 포스트 내용

본문을 작성하세요...
```

### 방법 2: Supabase (환경 변수 설정 시)

API를 통해 포스트 생성:

```typescript
await fetch('/api/posts', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    slug: 'my-post',
    frontmatter: {
      title: '제목',
      summary: '요약',
      category: 'youth',
      status: 'published',
      tags: ['태그1', '태그2']
    },
    content: '# 내용\n\n본문...'
  })
})
```

또는 `/category/write` 페이지에서 직접 작성

## 🎨 커스터마이징

- **사이트 정보**: `app/layout.tsx`의 `metadata` 수정
- **색상 테마**: `app/globals.css`의 CSS 변수 수정
- **카테고리**: `lib/categories.ts`에서 카테고리 추가/수정
- **Tailwind 설정**: `tailwind.config.ts`

## 🏗️ 배포

```bash
# 프로덕션 빌드
npm run build

# 프로덕션 서버 실행
npm run start
```

### Vercel 배포
1. GitHub에 코드 푸시
2. [Vercel](https://vercel.com) 연결
3. 환경 변수 설정 (Supabase 사용 시)
4. 자동 배포

## 📚 기술 스택

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Content**: MDX
- **Deployment**: Vercel (권장)

## 📄 라이선스

MIT
