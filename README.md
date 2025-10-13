# 🚴‍♂️ TASHU Riding Application

<div align="center">

![React](https://img.shields.io/badge/React-18.x-61DAFB?style=for-the-badge&logo=react&logoColor=white)
![Spring](https://img.shields.io/badge/Spring-5.0.7-6DB33F?style=for-the-badge&logo=spring&logoColor=white)
![Oracle](https://img.shields.io/badge/Oracle-DB-F80000?style=for-the-badge&logo=oracle&logoColor=white)
![Java](https://img.shields.io/badge/Java-8-007396?style=for-the-badge&logo=java&logoColor=white)

**대전시 공공자전거 타슈를 활용한 친환경 라이딩 서비스**

실시간 GPS 추적 • 데이터 시각화 • 커뮤니티 • CO₂ 절감 계산

[데모 보기](#) • [문제 해결 과정](#-trouble-shooting) • [개선 사항](#-향후-개선사항-future-improvements)

</div>

---

## 📋 프로젝트 개요 (Overview)

대전시 공공자전거 타슈(TASHU) 시스템을 활용한 풀스택 웹 애플리케이션입니다.  
React 프론트엔드와 Spring 백엔드를 연동하여 실시간 GPS 추적, 라이딩 통계 시각화, 커뮤니티 기능을 제공합니다.

### 🎯 핵심 가치
- **🌱 친환경**: CO₂ 절감량 실시간 계산 및 통계 제공
- **📊 데이터 기반**: Chart.js를 활용한 개인 라이딩 패턴 분석
- **🗺️ 위치 기반**: Kakao Maps API를 활용한 대여소 정보 및 경로 안내
- **👥 커뮤니티**: 사용자 간 라이딩 경험 공유 및 순위 시스템

### 📅 개발 정보
- **개발 기간**: 2025.09.01 ~ 2025.10.01 (단기 개인프로젝트)
- **개발 인원**: 1인 (풀스택)
- **핵심 가치**: CO₂ 절감, 건강 증진, 커뮤니티 형성

---

## ⚙️ Tech Stack

### Frontend
- **React.js 18.x** - UI 프레임워크
- **JavaScript (ES6+)** - 프로그래밍 언어
- **CSS3** - 스타일링 (Flexbox, Grid)
- **Kakao Maps API** - 지도 서비스 및 대여소 표시
- **Chart.js** - 라이딩 데이터 시각화
- **Geolocation API** - 실시간 GPS 위치 추적

### Backend
- **Spring Framework 5.0.7** - MVC 패턴 기반 백엔드
- **MyBatis 3.x** - SQL 매핑 프레임워크
- **Java 8** - 프로그래밍 언어
- **Maven** - 빌드 및 의존성 관리
- **Apache Tomcat 9** - 웹 서버

### Database
- **Oracle Database 18c** - 관계형 데이터베이스
- **JDBC** - 데이터베이스 연결

### Tools
- **Eclipse IDE** - 백엔드 개발 환경
- **VS Code** - 프론트엔드 개발 환경
- **Git** - 버전 관리
- **Postman** - API 테스트

---

## 🚀 주요 기능 (Features)

### 🚴‍♂️ 라이딩 관리
- **실시간 GPS 추적**: Geolocation API를 활용한 1초 단위 위치 추적
- **자동 거리 계산**: Haversine 공식 기반 정확한 거리 측정
- **시뮬레이션 모드**: 실제 라이딩 없이 가상 라이딩 체험 가능
- **자동 통계 저장**: 라이딩 완료 시 거리, 시간, CO₂, 칼로리, 포인트 자동 계산 및 저장

### 📊 대시보드
- **개인 통계 조회**: 총 라이딩 거리, CO₂ 절감량, 포인트, 칼로리 집계
- **차트 시각화**: Chart.js를 활용한 월별/일별 라이딩 패턴 분석
  - 막대 차트: 월별 라이딩 거리 비교
  - 선 차트: 일별 라이딩 추이 분석
- **순위 시스템**: 전체 사용자 대상 라이딩 거리 기반 순위 및 레벨 시스템
- **실시간 업데이트**: 라이딩 완료 시 대시보드 데이터 즉시 반영

### 🗺️ 지도 서비스
- **타슈 대여소 표시**: Kakao Maps API를 활용한 실시간 대여소 위치 마커 표시
- **대여소 정보**: 대여소명, 현재 자전거 수량, 거치대 수 표시
- **경로 추적**: 라이딩 중 이동 경로 실시간 표시
- **내 위치 표시**: 현재 사용자 위치 마커 및 이동 경로 시각화

### 💬 커뮤니티
- **게시판 시스템**: 자유게시판, 공지사항, 이벤트 게시판
- **댓글/대댓글**: 게시글 댓글 및 답글 기능 (계층형 구조)
- **좋아요 기능**: 게시글 및 댓글 좋아요 (중복 방지)
- **즐겨찾기**: 관심 게시글 북마크 및 조회
- **조회수 집계**: 게시글 조회수 자동 증가
- **페이징 처리**: 대용량 게시글 효율적 조회

### 👤 사용자 관리
- **회원가입/로그인**: 이메일 기반 회원 인증 (세션 방식)
- **프로필 관리**: 개인정보 수정, 닉네임 변경, 프로필 이미지 업로드
- **회원탈퇴**: 연관 데이터 CASCADE DELETE 처리
- **이동기록 조회**: 개인 라이딩 히스토리 및 상세 통계 확인

---

## 📂 프로젝트 구조 (Project Structure)

```
workspace_proj/
│
├── 📂 my-react-app/                      # React 프론트엔드
│   ├── 📂 public/
│   │   └── index.html
│   ├── 📂 src/
│   │   ├── 📂 components/                # React 컴포넌트
│   │   │   ├── NavigationView.js        # 라이딩 내비게이션 UI
│   │   │   ├── RideCompletionScreen.js  # 라이딩 완료 화면
│   │   │   ├── StationMap.js            # 대여소 지도 표시
│   │   │   ├── Dashboard.js             # 대시보드 차트
│   │   │   └── ...
│   │   ├── 📂 hooks/                     # 커스텀 훅
│   │   │   ├── useRideTracking.js       # 라이딩 추적 로직
│   │   │   ├── useAuth.js               # 인증 관리
│   │   │   └── useStations.js           # 대여소 데이터 관리
│   │   ├── 📂 pages/                     # 페이지 컴포넌트
│   │   │   ├── HomePage.js              # 메인 페이지
│   │   │   ├── DashboardPage.js         # 대시보드
│   │   │   ├── RidePage.js              # 라이딩 페이지
│   │   │   ├── CommunityPage.js         # 커뮤니티
│   │   │   └── MyPage.js                # 마이페이지
│   │   ├── 📂 utils/                     # 유틸리티
│   │   │   ├── api.js                   # API 통신 모듈
│   │   │   ├── haversine.js             # 거리 계산 함수
│   │   │   └── calculations.js          # CO₂/칼로리 계산
│   │   ├── App.js
│   │   └── index.js
│   └── package.json
│
└── 📂 tasue/                             # Spring 백엔드
    ├── 📂 src/main/java/com/future/my/
    │   ├── 📂 controller/                # REST 컨트롤러
    │   │   ├── RideController.java      # 라이딩 API
    │   │   ├── UserController.java      # 사용자 API
    │   │   ├── BoardController.java     # 게시판 API
    │   │   └── StationController.java   # 대여소 API
    │   ├── 📂 service/                   # 비즈니스 로직
    │   │   ├── RideService.java
    │   │   ├── UserService.java
    │   │   └── BoardService.java
    │   ├── 📂 dao/                       # 데이터 접근 계층
    │   │   ├── RideDAO.java
    │   │   ├── UserDAO.java
    │   │   └── BoardDAO.java
    │   └── 📂 vo/                        # Value Object
    │       ├── RideVO.java
    │       ├── UserVO.java
    │       └── BoardVO.java
    ├── 📂 src/main/resources/
    │   ├── 📂 mapper/                    # MyBatis 매퍼
    │   │   ├── ride-mapper.xml
    │   │   ├── user-mapper.xml
    │   │   └── board-mapper.xml
    │   └── application.properties        # DB 설정
    └── pom.xml
```

---

## 🗄️ Database Schema

### 핵심 테이블 구조

#### TASHU_USER (사용자)
```sql
- user_id (PK, NUMBER)
- email (VARCHAR2, UNIQUE)
- password (VARCHAR2, 암호화)
- nickname (VARCHAR2)
- profile_image (VARCHAR2)
- reg_date (DATE)
```

#### TASHU_RIDE (라이딩 기록)
```sql
- ride_id (PK, NUMBER)
- user_id (FK → TASHU_USER)
- distance (NUMBER) -- 거리 (km)
- duration (NUMBER) -- 시간 (분)
- co2_saved (NUMBER) -- CO₂ 절감량 (kg)
- calories (NUMBER) -- 소모 칼로리
- points (NUMBER) -- 획득 포인트
- ride_date (DATE)
```

#### TASHU_STATION (대여소)
```sql
- station_id (PK, NUMBER)
- station_name (VARCHAR2)
- latitude (NUMBER) -- 위도
- longitude (NUMBER) -- 경도
- bike_count (NUMBER) -- 현재 자전거 수
- rack_count (NUMBER) -- 거치대 수
```

#### TASHU_BOARD (게시판)
```sql
- board_id (PK, NUMBER)
- user_id (FK → TASHU_USER)
- title (VARCHAR2)
- content (CLOB)
- category (VARCHAR2) -- 자유/공지/이벤트
- views (NUMBER) -- 조회수
- likes (NUMBER) -- 좋아요 수
- created_at (DATE)
```

#### TASHU_COMMENT (댓글)
```sql
- comment_id (PK, NUMBER)
- board_id (FK → TASHU_BOARD)
- user_id (FK → TASHU_USER)
- parent_id (FK → TASHU_COMMENT, 대댓글용)
- content (VARCHAR2)
- created_at (DATE)
```

#### TASHU_RANKING (순위)
```sql
- user_id (PK, FK → TASHU_USER)
- total_distance (NUMBER) -- 총 거리
- total_points (NUMBER) -- 총 포인트
- level (NUMBER) -- 레벨
- rank (NUMBER) -- 순위
```

### 관계형 구조
- **1:N 관계**: USER → RIDE, USER → BOARD, USER → COMMENT
- **외래키 제약조건**: CASCADE DELETE (사용자 탈퇴 시 연관 데이터 자동 삭제)
- **인덱스 최적화**: user_id, board_id, ride_date 컬럼에 인덱스 생성

---

## 🔗 API 엔드포인트 (URL Mapping)

### 🚴‍♂️ 라이딩 API

| URL | Method | Description | Request Body | Response |
|-----|--------|-------------|--------------|----------|
| `/api/ride/start` | POST | 라이딩 시작 | `{ userId, stationId }` | `{ rideId, startTime }` |
| `/api/ride/end` | POST | 라이딩 종료 | `{ rideId, distance, duration }` | `{ success, rideData }` |
| `/api/ride/history` | GET | 라이딩 기록 조회 | Query: `userId` | `[ { rideId, distance, ... } ]` |
| `/api/ride/stats` | GET | 통계 조회 | Query: `userId` | `{ totalDistance, co2, ... }` |

### 👤 사용자 API

| URL | Method | Description | Request Body | Response |
|-----|--------|-------------|--------------|----------|
| `/api/user/register` | POST | 회원가입 | `{ email, password, nickname }` | `{ success, userId }` |
| `/api/user/login` | POST | 로그인 | `{ email, password }` | `{ success, token, userInfo }` |
| `/api/user/profile` | GET | 프로필 조회 | Query: `userId` | `{ userId, email, nickname, ... }` |
| `/api/user/update` | PUT | 프로필 수정 | `{ userId, nickname, profileImage }` | `{ success }` |
| `/api/user/delete` | DELETE | 회원탈퇴 | Query: `userId` | `{ success }` |

### 📊 대시보드 API

| URL | Method | Description | Request Body | Response |
|-----|--------|-------------|--------------|----------|
| `/api/dashboard/stats` | GET | 개인 통계 | Query: `userId` | `{ distance, co2, calories, points }` |
| `/api/dashboard/chart` | GET | 차트 데이터 | Query: `userId, period` | `[ { date, distance } ]` |
| `/api/dashboard/ranking` | GET | 순위 조회 | Query: `userId` | `[ { rank, userId, distance } ]` |

### 🗺️ 대여소 API

| URL | Method | Description | Request Body | Response |
|-----|--------|-------------|--------------|----------|
| `/api/station/list` | GET | 전체 대여소 조회 | - | `[ { stationId, name, lat, lng, bikes } ]` |
| `/api/station/detail` | GET | 대여소 상세 | Query: `stationId` | `{ stationId, name, bikes, racks }` |

### 💬 커뮤니티 API

| URL | Method | Description | Request Body | Response |
|-----|--------|-------------|--------------|----------|
| `/api/board/list` | GET | 게시글 목록 | Query: `page, category` | `{ posts, totalPages }` |
| `/api/board/write` | POST | 게시글 작성 | `{ userId, title, content, category }` | `{ success, boardId }` |
| `/api/board/detail` | GET | 게시글 상세 | Query: `boardId` | `{ boardId, title, content, ... }` |
| `/api/board/delete` | DELETE | 게시글 삭제 | Query: `boardId` | `{ success }` |
| `/api/comment/write` | POST | 댓글 작성 | `{ boardId, userId, content }` | `{ success, commentId }` |
| `/api/comment/list` | GET | 댓글 목록 | Query: `boardId` | `[ { commentId, content, ... } ]` |

---

## ▶️ 실행 방법 (How to Run)

### 1️⃣ 프론트엔드 실행

```bash
# 저장소 클론
git clone https://github.com/kimjaekim/tashu-riding-app.git

# 프론트엔드 디렉토리 이동
cd my-react-app

# 의존성 설치
npm install

# 개발 서버 실행
npm start

# 브라우저에서 http://localhost:3000 접속
```

### 2️⃣ 백엔드 실행

```bash
# 백엔드 디렉토리 이동
cd tasue

# Maven 빌드
mvn clean install

# Eclipse에서 프로젝트 Import
# Run As → Spring Boot App

# 또는 명령어로 실행
java -jar target/tasue-0.0.1-SNAPSHOT.jar

# 서버 실행 확인: http://localhost:8080
```

### 3️⃣ 데이터베이스 설정

**application.properties 수정**
```properties
# Oracle DB 연결 설정
spring.datasource.url=jdbc:oracle:thin:@localhost:1521:XE
spring.datasource.username=your_username
spring.datasource.password=your_password
spring.datasource.driver-class-name=oracle.jdbc.OracleDriver

# MyBatis 설정
mybatis.mapper-locations=classpath:mapper/*.xml
mybatis.type-aliases-package=com.future.my.vo
```

**테이블 생성**
```sql
-- sql/schema.sql 파일 실행
-- TASHU_USER, TASHU_RIDE 등 6개 테이블 생성
```

### 4️⃣ Kakao Maps API 설정

```javascript
// my-react-app/src/utils/api.js
const KAKAO_API_KEY = 'YOUR_KAKAO_API_KEY';

// Kakao Developers에서 JavaScript 키 발급
// https://developers.kakao.com/
```

---

## 📐 계산 공식 (Calculation Formula)

### CO₂ 절감량
```javascript
CO₂ 절감량 (kg) = 거리 (km) × 0.21
// 승용차 평균 CO₂ 배출량 기준
```

### 포인트
```javascript
포인트 = 거리 (km) × 10
// 1km 당 10포인트 적립
```

### 칼로리
```javascript
칼로리 (kcal) = 거리 (km) × 30
// 평균 자전거 운동 강도 기준
```

### 거리 계산 (Haversine Formula)
```javascript
// 두 GPS 좌표 간 거리 계산
function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371; // 지구 반지름 (km)
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c; // 거리 (km)
}
```

---

## 🔧 Trouble Shooting

### 1️⃣ CORS 에러 발생
**문제**: React(3000 포트)에서 Spring(8080 포트) API 호출 시 CORS 에러

**해결**:
```java
// Spring Controller에 @CrossOrigin 추가
@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/api")
public class RideController { ... }
```

### 2️⃣ GPS 위치 추적 정확도 문제
**문제**: Geolocation API의 위치 정확도가 낮아 거리 계산 오차 발생

**해결**:
```javascript
// 고정밀 위치 추적 옵션 설정
navigator.geolocation.watchPosition(
  successCallback,
  errorCallback,
  {
    enableHighAccuracy: true,  // 고정밀 모드
    timeout: 5000,
    maximumAge: 0
  }
);
```

### 3️⃣ Oracle DB 한글 깨짐
**문제**: 게시판 제목/내용 저장 시 한글 인코딩 오류

**해결**:
```properties
# application.properties
spring.datasource.url=jdbc:oracle:thin:@localhost:1521:XE?characterEncoding=UTF-8
```

### 4️⃣ Chart.js 데이터 업데이트 안됨
**문제**: 라이딩 완료 후 대시보드 차트가 업데이트되지 않음

**해결**:
```javascript
// useEffect 의존성 배열에 데이터 추가
useEffect(() => {
  fetchChartData();
}, [rideData]); // rideData 변경 시 차트 재렌더링
```

### 5️⃣ MyBatis resultType 매핑 오류
**문제**: DB 조회 결과가 VO에 제대로 매핑되지 않음

**해결**:
```xml
<!-- mapper XML에서 resultMap 사용 -->
<resultMap id="rideResultMap" type="com.future.my.vo.RideVO">
  <id property="rideId" column="ride_id"/>
  <result property="userId" column="user_id"/>
  <result property="distance" column="distance"/>
</resultMap>
```

---

## 🎯 향후 개선사항 (Future Improvements)

### 🔐 보안 강화
- [ ] JWT 토큰 기반 인증으로 전환 (현재 세션 방식)
- [ ] HTTPS 적용 및 SSL 인증서 설정
- [ ] XSS, CSRF 공격 방어 로직 추가
- [ ] 비밀번호 암호화 강화 (bcrypt 적용)

### ⚡ 성능 최적화
- [ ] Redis 캐싱 도입 (대여소 정보, 사용자 세션)
- [ ] 데이터베이스 쿼리 최적화 (N+1 문제 해결)
- [ ] 이미지 최적화 및 CDN 적용
- [ ] React 컴포넌트 Code Splitting

### 📱 모바일 최적화
- [ ] PWA(Progressive Web App) 적용
- [ ] 반응형 디자인 개선 (모바일 퍼스트)
- [ ] 오프라인 모드 지원
- [ ] 푸시 알림 기능 추가

### 🔄 실시간 기능
- [ ] WebSocket을 활용한 실시간 알림
- [ ] 실시간 사용자 간 경쟁 (라이브 순위)
- [ ] 그룹 라이딩 기능 (팀 대결)

### 🤖 AI 기능
- [ ] 개인 라이딩 패턴 분석
- [ ] 맞춤형 경로 추천
- [ ] 날씨/시간대별 최적 라이딩 시간 예측

### 🏗️ 아키텍처 개선
- [ ] Spring Boot + JPA 마이그레이션
- [ ] 마이크로서비스 아키텍처 전환
- [ ] Docker 컨테이너화
- [ ] CI/CD 파이프라인 구축 (GitHub Actions)
- [ ] AWS/GCP 클라우드 배포

### 🧪 테스트 및 모니터링
- [ ] JUnit, Mockito 단위 테스트 작성
- [ ] React Testing Library 프론트엔드 테스트
- [ ] ELK Stack 로그 모니터링
- [ ] 성능 모니터링 (APM 도구)

---

## 📊 프로젝트 성과

- ✅ **풀스택 개발 경험**: React 프론트엔드부터 Spring 백엔드, Oracle DB까지 전 과정 구현
- ✅ **실시간 GPS 추적**: Haversine 공식을 활용한 정확한 거리 계산 시스템 개발
- ✅ **데이터 시각화**: Chart.js를 활용한 직관적인 라이딩 통계 대시보드
- ✅ **RESTful API 설계**: HTTP 메소드를 활용한 표준 API 구현
- ✅ **3계층 아키텍처**: Controller-Service-DAO 분리로 유지보수성 향상

---

## 📝 라이선스 (License)

이 프로젝트는 개인 학습 목적으로 개발되었습니다.

---

## 👨‍💻 개발자 (Developer)

- **Name**: kimjaehyeun
- **Email**: nicegame9510@gmail.com
- **GitHub**: [@kimjaekim](https://github.com/kimjaekim)

---

## 📞 문의 (Contact)

프로젝트에 대한 문의사항이나 제안은 이슈를 등록하거나 이메일로 연락 주세요.

- **Issues**: [GitHub Issues](https://github.com/kimjaekim/tashu-riding-app/issues)
- **Email**: nicegame9510@gmail.com

---

## 발표자료

https://drive.google.com/file/d/14c7loXc1rjxEcVBp7UKWDq2NOzN-mE6P/view?usp=sharing

<div align="center">

**⭐ 이 프로젝트가 도움이 되셨다면 Star를 눌러주세요! ⭐**

Made with ❤️ by kimjaehyeun

</div>
