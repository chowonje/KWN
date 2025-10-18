# Supabase 설정 가이드

## 📌 개요

이 프로젝트는 Supabase를 사용하여 블로그 포스트를 저장하고 관리합니다.
환경 변수가 설정되지 않으면 기존 MDX 파일 방식으로 동작합니다.

## 🚀 1단계: Supabase 프로젝트 생성

1. [Supabase](https://supabase.com) 접속 및 로그인
2. "New Project" 클릭
3. 프로젝트 정보 입력:
   - Name: `kwn-blog` (원하는 이름)
   - Database Password: 안전한 비밀번호 생성
   - Region: `Northeast Asia (Seoul)` 선택 (한국 리전)
4. "Create new project" 클릭

## 📊 2단계: 데이터베이스 스키마 생성

프로젝트가 생성되면 SQL Editor로 이동하여 아래 쿼리를 실행하세요:

```sql
-- posts 테이블 생성
CREATE TABLE posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  summary TEXT,
  image TEXT,
  author TEXT,
  category TEXT,
  sub_category TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  featured BOOLEAN DEFAULT false,
  tags TEXT[],
  date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- slug 인덱스 생성 (빠른 조회)
CREATE INDEX idx_posts_slug ON posts(slug);

-- category 인덱스 생성 (카테고리별 조회)
CREATE INDEX idx_posts_category ON posts(category);

-- status 인덱스 생성 (published 포스트 조회)
CREATE INDEX idx_posts_status ON posts(status);

-- date 인덱스 생성 (날짜순 정렬)
CREATE INDEX idx_posts_date ON posts(date DESC);

-- updated_at 자동 업데이트 트리거 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- updated_at 트리거 생성
CREATE TRIGGER update_posts_updated_at
BEFORE UPDATE ON posts
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- RLS (Row Level Security) 활성화
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- 모든 사용자가 published 포스트를 읽을 수 있도록 설정
CREATE POLICY "Anyone can read published posts"
ON posts FOR SELECT
USING (status = 'published');

-- 인증된 사용자만 포스트를 생성/수정/삭제할 수 있도록 설정
-- (현재는 인증 없이 모든 작업 허용 - 추후 수정 필요)
CREATE POLICY "Anyone can insert posts"
ON posts FOR INSERT
WITH CHECK (true);

CREATE POLICY "Anyone can update posts"
ON posts FOR UPDATE
USING (true);

CREATE POLICY "Anyone can delete posts"
ON posts FOR DELETE
USING (true);
```

## 🔑 3단계: 환경 변수 설정

1. Supabase 프로젝트 Settings → API로 이동
2. 다음 정보를 복사:
   - `Project URL`
   - `anon` `public` 키

3. 프로젝트 루트에 `.env.local` 파일 생성:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

## 📦 4단계: 패키지 설치

```bash
npm install
```

## 🧪 5단계: 테스트 데이터 추가 (선택사항)

SQL Editor에서 샘플 데이터 추가:

```sql
INSERT INTO posts (slug, title, content, summary, category, status, featured, tags, date)
VALUES (
  'supabase-test',
  'Supabase 연동 테스트',
  '# Supabase 연동 성공!\n\n이것은 테스트 포스트입니다.',
  'Supabase 데이터베이스 연동이 성공적으로 완료되었습니다.',
  'youth',
  'published',
  true,
  ARRAY['테스트', 'Supabase', 'Next.js'],
  CURRENT_DATE
);
```

## ✅ 6단계: 개발 서버 실행

```bash
npm run dev
```

브라우저에서 `http://localhost:3000` 접속하여 Supabase 포스트가 표시되는지 확인하세요!

## 🔄 동작 방식

### 환경 변수가 설정된 경우
- ✅ Supabase 데이터베이스에서 포스트를 읽고 씁니다
- ✅ 실시간으로 데이터가 동기화됩니다
- ✅ `/api/posts` - Supabase에서 모든 포스트 가져오기
- ✅ `/api/post?slug=xxx` - Supabase에서 특정 포스트 가져오기

### 환경 변수가 없는 경우
- 🔙 기존 MDX 파일 방식으로 동작합니다
- 🔙 `content/blog/*.mdx` 파일을 읽습니다

## 🔐 7단계: Supabase Auth 설정 (로그인/회원가입)

프로젝트에 이미 로그인/회원가입 페이지가 포함되어 있습니다!

### Auth 활성화

1. Supabase 프로젝트 → **Authentication** → **Providers** 이동
2. **Email** 프로바이더 활성화 (기본값)
3. **Settings** → **Auth** 에서 다음 설정:
   - **Enable email confirmations**: OFF (개발 단계)
   - **Enable email signups**: ON

### 이메일 확인 비활성화 (개발용)

개발 중에는 이메일 확인을 비활성화하면 편리합니다:

```sql
-- SQL Editor에서 실행
UPDATE auth.config 
SET config = config || '{"mailer_autoconfirm": true}'::jsonb;
```

또는 Dashboard → Authentication → Email Templates에서 설정

### 테스트 계정 생성

회원가입 페이지(`/auth/signup`)에서 테스트 계정을 생성하거나, SQL로 직접 추가:

```sql
-- 테스트 사용자 추가 (비밀번호: test123)
-- Supabase Dashboard에서 회원가입 하는 것을 권장
```

## 🛡️ 보안 고려사항 (추후 개선 필요)

현재는 **누구나** 포스트를 생성/수정/삭제할 수 있습니다.
프로덕션 환경에서는 다음을 구현해야 합니다:

### 1. RLS 정책 강화

```sql
-- 기존 정책 삭제
DROP POLICY IF EXISTS "Anyone can insert posts" ON posts;
DROP POLICY IF EXISTS "Anyone can update posts" ON posts;
DROP POLICY IF EXISTS "Anyone can delete posts" ON posts;

-- 인증된 사용자만 포스트 생성/수정/삭제
CREATE POLICY "Authenticated users can insert posts"
ON posts FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update their posts"
ON posts FOR UPDATE
USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete their posts"
ON posts FOR DELETE
USING (auth.role() = 'authenticated');
```

### 2. 작성자 추적

포스트 테이블에 user_id 추가:

```sql
ALTER TABLE posts ADD COLUMN user_id UUID REFERENCES auth.users(id);

-- 작성자만 수정/삭제 가능
CREATE POLICY "Users can update own posts"
ON posts FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own posts"
ON posts FOR DELETE
USING (auth.uid() = user_id);
```

## 📝 API 사용 예시

### 포스트 가져오기
```typescript
const response = await fetch('/api/posts')
const posts = await response.json()
```

### 포스트 생성/수정
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

### 포스트 삭제
```typescript
await fetch('/api/posts?slug=my-post', {
  method: 'DELETE'
})
```

## 🎉 완료!

이제 Supabase를 사용하여 블로그 포스트를 관리할 수 있습니다!

