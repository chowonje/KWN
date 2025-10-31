-- ========================================
-- KWN 프로젝트 - Supabase 완전 설정 스크립트
-- ========================================
-- 이 파일을 Supabase SQL Editor에서 실행하세요
-- Dashboard > SQL Editor > New Query에서 전체 복사 후 RUN
-- ========================================

-- ========================================
-- 1. PROFILES 테이블 생성 (사용자 프로필)
-- ========================================

CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  name TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  avatar_url TEXT,
  
  -- 승인 시스템
  approval_status TEXT DEFAULT 'pending' CHECK (approval_status IN ('pending', 'approved', 'rejected')),
  approval_requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  approval_processed_at TIMESTAMP WITH TIME ZONE,
  approval_processed_by UUID REFERENCES auth.users(id),
  
  -- 메타 정보
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Profiles 인덱스
CREATE INDEX IF NOT EXISTS profiles_email_idx ON profiles(email);
CREATE INDEX IF NOT EXISTS profiles_role_idx ON profiles(role);
CREATE INDEX IF NOT EXISTS profiles_approval_status_idx ON profiles(approval_status);

-- Profiles updated_at 자동 업데이트
CREATE OR REPLACE FUNCTION update_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_profiles_updated_at();

-- 회원가입 시 자동 프로필 생성
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, role, approval_status, approval_requested_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    'user',
    'pending',
    NOW()
  )
  ON CONFLICT (id) DO UPDATE
  SET email = EXCLUDED.email,
      name = COALESCE(EXCLUDED.name, public.profiles.name);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Profiles RLS 활성화
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 프로필 읽기: 인증된 사용자
DROP POLICY IF EXISTS "Anyone can view profiles" ON profiles;
CREATE POLICY "Anyone can view profiles"
ON profiles FOR SELECT
TO authenticated
USING (true);

-- 관리자는 모든 프로필 조회 가능
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
CREATE POLICY "Admins can view all profiles"
ON profiles FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- 본인 프로필 수정
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id);

-- 관리자는 모든 프로필 수정 가능
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;
CREATE POLICY "Admins can update all profiles"
ON profiles FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- 관리자는 프로필 삭제 가능
DROP POLICY IF EXISTS "Admins can delete profiles" ON profiles;
CREATE POLICY "Admins can delete profiles"
ON profiles FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- ========================================
-- 2. POSTS 테이블 생성 (게시글)
-- ========================================

CREATE TABLE IF NOT EXISTS posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  
  -- 콘텐츠
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  summary TEXT,
  
  -- 이미지
  image TEXT,
  thumbnail TEXT,
  
  -- 작성자 (profiles 테이블 참조)
  author_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  author_name TEXT,
  
  -- 카테고리 & 태그
  category TEXT,
  sub_category TEXT,
  tags TEXT[],
  
  -- 상태 관리
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  featured BOOLEAN DEFAULT false,
  
  -- 발행 시간
  published_at TIMESTAMP WITH TIME ZONE,
  
  -- SEO
  seo_title TEXT,
  seo_description TEXT,
  
  -- 통계
  view_count INTEGER DEFAULT 0,
  reading_time INTEGER,
  
  -- 메타
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Posts 인덱스
CREATE INDEX IF NOT EXISTS posts_slug_idx ON posts(slug);
CREATE INDEX IF NOT EXISTS posts_author_idx ON posts(author_id);
CREATE INDEX IF NOT EXISTS posts_category_idx ON posts(category);
CREATE INDEX IF NOT EXISTS posts_status_idx ON posts(status);
CREATE INDEX IF NOT EXISTS posts_published_at_idx ON posts(published_at DESC);

-- Posts updated_at 자동 업데이트
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_posts_updated_at ON posts;
CREATE TRIGGER update_posts_updated_at
    BEFORE UPDATE ON posts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Posts RLS 활성화
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- 읽기: 모든 사용자가 published 글 읽기
DROP POLICY IF EXISTS "Anyone can read published posts" ON posts;
CREATE POLICY "Anyone can read published posts"
ON posts FOR SELECT
USING (status = 'published' OR auth.uid() = author_id);

-- 쓰기: 승인된 사용자만 글 작성
DROP POLICY IF EXISTS "Authenticated users can insert posts" ON posts;
CREATE POLICY "Authenticated users can insert posts"
ON posts FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = author_id AND
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND approval_status = 'approved'
  )
);

-- 수정: 본인 글만 수정 (승인된 사용자)
DROP POLICY IF EXISTS "Users can update own posts" ON posts;
CREATE POLICY "Users can update own posts"
ON posts FOR UPDATE
TO authenticated
USING (
  auth.uid() = author_id AND
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND approval_status = 'approved'
  )
);

-- 삭제: 본인 글만 삭제 (승인된 사용자)
DROP POLICY IF EXISTS "Users can delete own posts" ON posts;
CREATE POLICY "Users can delete own posts"
ON posts FOR DELETE
TO authenticated
USING (
  auth.uid() = author_id AND
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND approval_status = 'approved'
  )
);

-- ========================================
-- 3. STORAGE 설정 (이미지 업로드)
-- ========================================

-- Storage 버킷 생성
INSERT INTO storage.buckets (id, name, public)
VALUES ('post-images', 'post-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage 읽기 정책 (public)
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'post-images');

-- Storage 업로드 정책 (인증된 사용자)
DROP POLICY IF EXISTS "Authenticated users can upload images" ON storage.objects;
CREATE POLICY "Authenticated users can upload images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'post-images');

-- Storage 삭제 정책 (본인만)
DROP POLICY IF EXISTS "Users can delete own images" ON storage.objects;
CREATE POLICY "Users can delete own images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'post-images' AND auth.uid()::text = owner);

-- ========================================
-- 4. 초기 관리자 설정 (필수!)
-- ========================================
-- 아래 쿼리를 실행하여 첫 관리자를 설정하세요
-- your-admin-email@example.com을 실제 이메일로 변경!

-- UPDATE public.profiles
-- SET role = 'admin', approval_status = 'approved'
-- WHERE email = 'your-admin-email@example.com';

-- ========================================
-- 완료! 🎉
-- ========================================
-- 다음 단계:
-- 1. 위의 관리자 설정 쿼리 실행 (주석 해제 후)
-- 2. 애플리케이션에서 테스트
-- 3. 회원가입/로그인 테스트
-- 4. 글 작성 테스트
-- ========================================

