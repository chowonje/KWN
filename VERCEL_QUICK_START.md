# ⚡ Vercel 배포 빠른 시작 가이드

## 5분 만에 배포하기!

### 1단계: GitHub에 코드 올리기 (2분)

```bash
git init
git add .
git commit -m "Ready for deployment"
git remote add origin https://github.com/당신의유저명/레포지토리명.git
git branch -M main
git push -u origin main
```

### 2단계: Vercel 연결 (1분)

1. https://vercel.com 접속
2. "Sign Up with GitHub" 클릭
3. "New Project" 클릭
4. GitHub 저장소 선택 → Import

### 3단계: 환경변수 설정 (2분)

**Supabase에서 가져올 것:**
- 📍 https://supabase.com/dashboard
- 프로젝트 선택 → Settings → API

**Vercel에 입력할 환경변수:**

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUz...
```

### 4단계: Deploy 버튼 클릭!

끝! 🎉 2-3분 후 `https://your-project.vercel.app`에서 확인 가능합니다.

---

## 🔄 이후 업데이트 방법

```bash
# 코드 수정
git add .
git commit -m "업데이트 내용"
git push

# Vercel이 자동으로 재배포!
```

---

## 💡 필수 환경변수

| 환경변수 | 어디서 찾나요? |
|---------|--------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Dashboard → Project Settings → API → Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Dashboard → Project Settings → API → anon public key |

⚠️ **주의:** `NEXT_PUBLIC_` 접두사를 꼭 붙여야 합니다!

---

## 🌐 커스텀 도메인 연결 (선택)

1. Vercel 프로젝트 → Settings → Domains
2. 도메인 입력 (예: `myblog.com`)
3. 도메인 업체에서 DNS 설정:
   - A Record: `76.76.21.21`
   - 또는 CNAME: `cname.vercel-dns.com`

---

## ✅ 배포 성공 확인

- [ ] 사이트가 로드되나요?
- [ ] 블로그 글이 보이나요?
- [ ] 로그인이 되나요?
- [ ] 글 작성/수정이 되나요?

---

## 🐛 문제가 생겼다면?

**Supabase 연결 안 됨:**
- Vercel 환경변수 다시 확인
- 저장 후 "Redeploy" 클릭

**빌드 실패:**
- 로컬에서 `npm run build` 실행해보기
- 에러 메시지 확인

**더 자세한 가이드:** `VERCEL_DEPLOYMENT.md` 참고

---

**무료 플랜으로 충분합니다!** 개인 블로그는 추가 비용 없이 운영 가능합니다. 🚀

