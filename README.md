# 🚴‍♂️ 타슈(TASHU) 공공자전거 라이딩 애플리케이션

## 📋 프로젝트 개요
대전시 공공자전거 타슈 시스템을 활용한 친환경 라이딩 서비스입니다. 실시간 GPS 추적, CO₂ 절감량 계산, 커뮤니티 기능을 제공합니다.

## 🛠️ 기술 스택

### Frontend
- **React.js** (18.x) - UI 프레임워크
- **JavaScript (ES6+)** - 프로그래밍 언어
- **CSS3** - 스타일링
- **Kakao Maps API** - 지도 서비스
- **Chart.js** - 데이터 시각화
- **Geolocation API** - GPS 추적

### Backend
- **Spring Framework** (5.0.7) - 백엔드 프레임워크
- **MyBatis** - ORM (Object-Relational Mapping)
- **Java 8** - 프로그래밍 언어
- **Maven** - 빌드 도구
- **Tomcat** - 웹 서버

### Database
- **Oracle Database** - 관계형 데이터베이스

## 🚀 주요 기능

### 🚴‍♂️ 라이딩 관리
- **실시간 GPS 추적**: 자전거 대여부터 반납까지 실시간 위치 추적
- **시뮬레이션 모드**: 실제 라이딩 없이 가상 라이딩 체험
- **자동 거리 계산**: Haversine 공식 기반 정확한 거리 측정
- **CO₂/포인트/칼로리 계산**: 프론트엔드에서 실시간 계산

### 📊 대시보드
- **개인 통계**: 총 라이딩 거리, CO₂ 절감량, 포인트, 칼로리
- **차트 시각화**: Chart.js를 활용한 직관적인 통계 표시
- **순위 시스템**: 사용자별 라이딩 순위 및 레벨

### 🗺️ 지도 서비스
- **타슈 대여소 표시**: 실시간 대여소 위치 및 자전거 수량
- **경로 안내**: 최적 라이딩 경로 추천
- **실시간 추적**: 라이딩 중 실시간 위치 업데이트

### 💬 커뮤니티
- **게시판**: 자유게시판, 공지사항, 이벤트
- **댓글 시스템**: 게시글 댓글 및 답글
- **좋아요 기능**: 게시글 및 댓글 좋아요

## 📁 프로젝트 구조

```
workspace_proj/
├── my-react-app/                 # React 프론트엔드
│   ├── src/
│   │   ├── components/           # React 컴포넌트
│   │   ├── hooks/                # 커스텀 훅
│   │   ├── pages/                # 페이지 컴포넌트
│   │   └── utils/                # 유틸리티
│   └── package.json
└── tasue/                        # Spring 백엔드
    ├── src/main/java/com/future/my/
    │   ├── controller/           # REST 컨트롤러
    │   ├── service/              # 비즈니스 로직
    │   ├── dao/                   # 데이터 접근 계층
    │   └── vo/                   # Value Object
    └── src/main/resources/
        └── mapper/               # MyBatis 매퍼
```

## 🚀 실행 방법

### 1. 프론트엔드 실행
```bash
cd my-react-app
npm install
npm start
```

### 2. 백엔드 실행
```bash
cd tasue
mvn clean install
# Eclipse에서 Spring 프로젝트 실행
```

### 3. 데이터베이스 설정
- Oracle Database 연결 설정
- 테이블 생성 및 데이터 삽입

## 🔧 기술적 특징

- **3계층 아키텍처**: Controller-Service-DAO 분리로 유지보수성 향상
- **Haversine 공식**: GPS 좌표 기반 정확한 거리 계산
- **실시간 GPS 추적**: Geolocation API를 활용한 정확한 위치 추적
- **데이터 시각화**: Chart.js를 활용한 직관적인 통계 표시
- **RESTful API**: Spring Framework 기반 REST API 설계

## 📊 계산 공식

### CO₂ 절감량
```
CO₂ 절감량 = 거리(km) × 0.21kg
```

### 포인트
```
포인트 = 거리(km) × 10
```

### 칼로리
```
칼로리 = 거리(km) × 30
```

## 🎯 향후 계획

- **성능 최적화**: 데이터베이스 쿼리 최적화 및 캐싱 도입
- **보안 강화**: JWT 토큰 기반 인증, HTTPS 적용
- **모바일 최적화**: PWA(Progressive Web App) 적용
- **AI 기능**: 라이딩 패턴 분석 및 개인화 추천

## 📝 라이선스

이 프로젝트는 개인 학습 목적으로 개발되었습니다.

## 👨‍💻 개발자

- **개발자**: [당신의 이름]
- **이메일**: [이메일 주소]
- **GitHub**: [GitHub 프로필]

---

**타슈와 함께 친환경 라이딩을 즐겨보세요!** 🌱🚴‍♂️
