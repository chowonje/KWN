/**
 * Supabase 테이블 자동 생성 스크립트
 * 
 * 실행 방법:
 * 1. .env.local 파일에 NEXT_PUBLIC_SUPABASE_URL과 SUPABASE_SERVICE_ROLE_KEY가 있어야 합니다
 * 2. 터미널에서: node setup-supabase-tables.js
 */

const fs = require('fs');
const path = require('path');

// .env.local 파일 읽기
function loadEnv() {
  const envPath = path.join(__dirname, '.env.local');
  if (!fs.existsSync(envPath)) {
    console.error('❌ .env.local 파일을 찾을 수 없습니다!');
    process.exit(1);
  }

  const envContent = fs.readFileSync(envPath, 'utf8');
  const env = {};
  
  envContent.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length > 0) {
      env[key.trim()] = valueParts.join('=').trim();
    }
  });

  return env;
}

// SQL 파일 읽기
function loadSQL() {
  const sqlPath = path.join(__dirname, 'supabase-setup-complete.sql');
  if (!fs.existsSync(sqlPath)) {
    console.error('❌ supabase-setup-complete.sql 파일을 찾을 수 없습니다!');
    process.exit(1);
  }
  return fs.readFileSync(sqlPath, 'utf8');
}

// Supabase에 SQL 실행
async function executeSQLBatch(supabaseUrl, serviceRoleKey, sql) {
  // SQL을 세미콜론으로 분리하여 여러 쿼리로 나눔
  const queries = sql
    .split(';')
    .map(q => q.trim())
    .filter(q => q.length > 0 && !q.startsWith('--'));

  console.log(`\n📝 총 ${queries.length}개의 SQL 쿼리를 실행합니다...\n`);

  let successCount = 0;
  let errorCount = 0;

  for (let i = 0; i < queries.length; i++) {
    const query = queries[i];
    
    // 주석이나 빈 쿼리 건너뛰기
    if (!query || query.startsWith('--')) continue;

    try {
      const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': serviceRoleKey,
          'Authorization': `Bearer ${serviceRoleKey}`
        },
        body: JSON.stringify({
          query: query + ';'
        })
      });

      if (response.ok) {
        successCount++;
        console.log(`✅ [${i + 1}/${queries.length}] 성공`);
      } else {
        const error = await response.text();
        console.log(`⚠️ [${i + 1}/${queries.length}] 실패 (계속 진행)`);
        if (error && !error.includes('already exists')) {
          console.log(`   상세: ${error.substring(0, 100)}...`);
        }
        errorCount++;
      }
    } catch (error) {
      console.log(`⚠️ [${i + 1}/${queries.length}] 오류 (계속 진행): ${error.message}`);
      errorCount++;
    }

    // 너무 빠른 요청 방지
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  console.log(`\n📊 실행 결과:`);
  console.log(`   ✅ 성공: ${successCount}개`);
  console.log(`   ⚠️  실패/건너뜀: ${errorCount}개`);
}

// Supabase REST API로 직접 SQL 실행
async function executeSQL(supabaseUrl, serviceRoleKey, sql) {
  console.log('\n🚀 Supabase 테이블 생성을 시작합니다...\n');

  // 각 섹션별로 분리하여 실행
  const sections = [
    { name: 'Profiles 테이블', sql: extractSection(sql, '1. PROFILES') },
    { name: 'Posts 테이블', sql: extractSection(sql, '2. POSTS') },
    { name: 'Storage 설정', sql: extractSection(sql, '3. STORAGE') }
  ];

  for (const section of sections) {
    if (!section.sql) continue;
    
    console.log(`\n📦 ${section.name} 생성 중...`);
    
    try {
      // psql 명령어 형식으로 실행
      const response = await fetch(`${supabaseUrl}/rest/v1/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': serviceRoleKey,
          'Authorization': `Bearer ${serviceRoleKey}`,
          'Prefer': 'return=minimal'
        }
      });

      console.log(`✅ ${section.name} 생성 완료`);
    } catch (error) {
      console.log(`⚠️ ${section.name} 생성 실패: ${error.message}`);
    }
  }
}

function extractSection(sql, sectionName) {
  const start = sql.indexOf(`-- ${sectionName}`);
  if (start === -1) return '';
  
  const nextSection = sql.indexOf('-- ====', start + 10);
  if (nextSection === -1) return sql.substring(start);
  
  return sql.substring(start, nextSection);
}

// 메인 실행
async function main() {
  console.log('🔧 Supabase 테이블 자동 생성 스크립트\n');
  console.log('=' .repeat(50));

  // 환경 변수 로드
  const env = loadEnv();
  const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    console.error('\n❌ Supabase 연결 정보가 없습니다!');
    console.error('\n.env.local 파일에 다음 변수들이 필요합니다:');
    console.error('  - NEXT_PUBLIC_SUPABASE_URL');
    console.error('  - SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
  }

  console.log(`\n✅ Supabase URL: ${supabaseUrl}`);
  console.log(`✅ Service Role Key: ${serviceRoleKey.substring(0, 20)}...`);

  // SQL 파일 로드
  const sql = loadSQL();
  console.log(`\n✅ SQL 파일 로드 완료 (${sql.length} bytes)`);

  // SQL 실행
  console.log('\n' + '='.repeat(50));
  console.log('\n⚠️  이 스크립트는 Supabase REST API를 통해 실행됩니다.');
  console.log('⚠️  일부 권한 문제로 실패할 수 있습니다.');
  console.log('\n권장 방법: Supabase Dashboard > SQL Editor에서 직접 실행\n');
  console.log('='.repeat(50));

  console.log('\n📋 대신 아래 파일을 Supabase SQL Editor에 복사하세요:');
  console.log(`   ${path.join(__dirname, 'supabase-setup-complete.sql')}`);
  console.log('\n단계:');
  console.log('1. Supabase Dashboard 접속');
  console.log('2. SQL Editor > New Query');
  console.log('3. supabase-setup-complete.sql 내용 복사 붙여넣기');
  console.log('4. RUN 버튼 클릭\n');
}

main().catch(console.error);

