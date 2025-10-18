-- Supabase에서 실행할 SQL (Table Editor → SQL Editor에서 실행)

-- posts 테이블 생성
CREATE TABLE IF NOT EXISTS posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  summary TEXT,
  image TEXT,
  author TEXT,
  category TEXT,
  sub_category TEXT,
  status TEXT DEFAULT 'published',
  featured BOOLEAN DEFAULT false,
  tags TEXT[],
  date TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 슬러그 인덱스 생성 (검색 성능 향상)
CREATE INDEX IF NOT EXISTS posts_slug_idx ON posts(slug);

-- 상태 인덱스 생성
CREATE INDEX IF NOT EXISTS posts_status_idx ON posts(status);

-- 카테고리 인덱스 생성
CREATE INDEX IF NOT EXISTS posts_category_idx ON posts(category);

-- updated_at 자동 업데이트 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- updated_at 트리거 생성
DROP TRIGGER IF EXISTS update_posts_updated_at ON posts;
CREATE TRIGGER update_posts_updated_at
    BEFORE UPDATE ON posts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- RLS (Row Level Security) 활성화 (보안)
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- 읽기 권한: 모든 사용자 허용
CREATE POLICY "Enable read access for all users"
ON posts FOR SELECT
USING (true);

-- 쓰기 권한: 인증된 사용자만 허용
CREATE POLICY "Enable insert for authenticated users only"
ON posts FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users only"
ON posts FOR UPDATE
USING (auth.role() = 'authenticated');

CREATE POLICY "Enable delete for authenticated users only"
ON posts FOR DELETE
USING (auth.role() = 'authenticated');




