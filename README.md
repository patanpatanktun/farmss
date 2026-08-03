# 🌾 FARMSS AI MMS Service

농업인을 위한 AI 기반 MMS 마케팅 자동화 서비스입니다.

## 프로젝트 소개

FARMSS AI MMS Service는 농업 관련 비즈니스를 위한 AI 기반 MMS(멀티미디어 메시징 서비스) 자동화 플랫폼입니다.
OpenAI API를 활용하여 맞춤형 이미지 생성 및 프롬프트 기반 마케팅 메시지를 자동으로 생성하고,
Solapi를 통해 고객에게 MMS를 발송합니다.

## 주요 기능

- 🤖 AI 기반 이미지 생성 (DALL-E)
- 📝 GPT 기반 마케팅 문구 자동 생성
- 📱 MMS 자동 발송 (Solapi 연동)
- 👥 고객 관리
- 📊 발송 현황 대시보드

## 기술 스택

### Frontend
- HTML / CSS / JavaScript

### Backend
- Java 17
- Spring Boot 3.x
- Spring Security + JWT
- Spring Data JPA
- MySQL

### AI Server
- Python 3.11
- FastAPI
- OpenAI API (GPT-4, DALL-E 3)

### Infra
- Docker / Docker Compose
- Nginx
- GitHub Actions (CI/CD)

## 프로젝트 구조

```
farmss-ai-mms-service/
├── frontend/         # 프론트엔드
├── backend/          # Spring Boot API 서버
├── ai-server/        # Python AI 서버
├── database/         # DB 스키마 및 초기 데이터
├── nginx/            # Nginx 설정
├── storage/          # 파일 저장소
└── docs/             # 프로젝트 문서
```

## 시작하기

### 사전 요구사항
- Docker & Docker Compose
- Java 17+
- Python 3.11+
- Node.js 18+

### 실행 방법

```bash
# 전체 서비스 실행
docker-compose up -d

# 개발 환경
# Backend
cd backend && ./mvnw spring-boot:run

# AI Server
cd ai-server && pip install -r requirements.txt && uvicorn app:app --reload

# Frontend
cd frontend && npm install && npm run dev
```

## 환경 변수 설정

각 서비스의 `.env.example` 파일을 참고하여 `.env` 파일을 생성하세요.

## 팀원

| 이름 | 역할 |
|------|------|
|      | Frontend |
|      | Backend |
|      | AI Server |
|      | Infra / DevOps |

## 라이선스

MIT License - 자세한 내용은 [LICENSE](LICENSE) 파일을 참고하세요.
