# 프로젝트 주요 기능 명세
구분	기능 설명	처리 항목 상세
 Auth	회원가입 / 로그인 / JWT 발급	- 이메일, 비밀번호, 역할(user, admin 등) 등록 및 중복 체크
- 로그인 시 JWT 발급
- JwtAuthGuard로 토큰 유효성 검사
- RolesGuard로 권한 기반 접근 제어 적용
 Reward	보상 생성/조회/수정/삭제	- item(이름, 타입) 및 total_quantity 설정
- 생성 시 quantity = total_quantity로 자동 설정
- 수정 시 event_id와 total_quantity는 변경 불가
- 삭제 시: 이벤트에 연결되어 있으면 삭제 차단 (event_id == null 검사)
- 조회 시 전체 보상 목록 반환
 Event	이벤트 생성/조회/수정/삭제	- title, content, condition, date, reward_id 입력
- 이벤트 생성 시 reward_id 연결 및 유효성 검사
- 수정 시 보상 변경 가능, 단 보상 중복 연결 불가
- valid=false 설정 시 자동으로 close_reason 추가
- 삭제 시 연결된 보상의 event_id 해제 처리 포함
 Participation	유저 이벤트 참여 및 미션 완료	- 참여 시 유저-이벤트 관계 저장
- 이벤트 중복 참여 방지 (already participated 체크)
- 참여 시 조건 값 초기화, 상태 status=false 저장
- 미션 완료 시 조건 비교하여 자동 보상 지급
- 완료 시 status=true로 업데이트
 조회 기능	참여 내역 및 보상 상태별 조회	- GET /user/me: 현재 유저의 참여 내역만 조회
- GET /user: 모든 유저 참여 기록 조회 (admin 등만 가능)
- GET /user/event/:event_id: 특정 이벤트 참여자 조회
- GET /user/status/:status: 보상 지급 여부로 필터링 조회
 스케줄러	이벤트 자동 종료 처리	- 매 시간 정각(@Cron('0 * * * *'))에 실행
- valid=true && end_date<now인 이벤트 자동 종료
- 종료 시 valid=false, close_reason="expired" 자동 설정
- 종료된 이벤트 수 콘솔에 출력
 테스트	e2e 테스트 (auth, gateway 중심)	- auth: 회원가입, 로그인, JWT 토큰 발급 검증
- gateway: 토큰을 통한 모든 API 접근 테스트 (RBAC)
- 테스트는 컨테이너 내부에서 npm run test:e2e로 수행
- DELETE 제외한 전체 API 권한 제어 정상 동작 여부 확인

## 실행 방법 (Docker Compose 기반)

이 프로젝트는 Docker Compose를 사용하여 MongoDB 및 NestJS 기반의 마이크로서비스(Gateway, Auth, Event)를 한 번에 실행할 수 있도록 구성되어 있습니다.

### 1. 사전 준비

* Docker 및 Docker Compose가 설치되어 있어야 합니다.
* 각 서비스(auth, event, gateway)에 `.env` 파일이 필요합니다.

#### `.env` 예시:

```env
# auth/.env
MONGO_URI=mongodb://mongo:27017/auth-service
JWT_SECRET=test
JWT_EXPIRES_IN=7h

# gateway/.env
JWT_SECRET=test
JWT_EXPIRES_IN=7h

# event/.env
MONGO_URI=mongodb://mongo:27017/event-service
JWT_SECRET=test
JWT_EXPIRES_IN=7h
```

---

### 2. 실행 명령어

```bash
docker-compose up --build
```

### 3. 종료 명령어

```bash
docker-compose down
```

---

### 4. 접속 정보

| 서비스     | 경로                                             | 설명            |
| ------- | ---------------------------------------------- | ------------- |
| Gateway | [http://localhost:3000](http://localhost:3000) | 모든 API 진입점    |
| Auth    | 내부 서비스                                         | 로그인, 회원가입 등   |
| Event   | 내부 서비스                                         | 이벤트, 보상 관련 기능 |
| MongoDB | mongodb://mongo:27017                          | 내부 DB 주소      |

---

### 5. e2e 테스트 실행 방법

이 프로젝트는 각 서비스 컨테이너에 접속하여 직접 `e2e 테스트 명령어`를 실행하는 방식으로 테스트를 수행합니다.

각 서비스의 테스트 목적은 다음과 같습니다:

* **Auth**: 회원가입과 로그인 기능이 올바르게 동작하는지 확인하고, JWT 토큰이 정상적으로 발급되는지 테스트합니다.
* **Gateway**: 발급된 토큰을 사용해 DELETE를 제외한 대부분의 API에 대해 역할 기반 접근 제어(RBAC)가 올바르게 동작하는지 검증합니다.

#### 실행 예시

```bash
# auth 컨테이너에 접속하여 e2e 테스트 수행
docker-compose exec auth sh
npm run test:e2e

# gateway 컨테이너에 접속하여 e2e 테스트 수행 , 위 auth e2e테스트를 수행해야 정상수행됨(로그인 토큰 발행)
docker-compose exec gateway sh
npm run test:e2e
```

NestJS 기반으로 구성된 각 서비스는 내부적으로 `jest`를 사용하며, 테스트 결과는 터미널에 출력됩니다.

---

### 6. 기타 명령어

```bash
# 컨테이너 내부 접속 (예: auth)
docker exec -it auth sh
```

---

## 조건 검증 방식 요약

* 필수값 누락, 형식 불일치 등의 검사는 서비스 내부에서 직접 처리합니다.
* 모든 요청에는 JwtAuthGuard + RolesGuard가 적용되어 있으며, 역할 기반 접근 제한이 정상적으로 동작합니다.

---

## 1. 이벤트 시스템 설계도

### 이벤트 흐름 순서도 (USER + ADMIN / OPERATOR 통합)

```
┌────────────────────────────┐
│        ADMIN / OPERATOR    │
└────────────────────────────┘
            │
            ▼
[1] 보상 생성
    └─ POST /reward
            │
            ▼
[2] 이벤트 생성 (보상 연결)
    └─ POST /event
            │
            ▼
[3] 이벤트 유효 여부 조회
    └─ GET /event?valid=true

┌────────────────────────────┐
│           USER             │
└────────────────────────────┘
            │
            ▼
[4] 이벤트 목록 / 상세 조회
    └─ GET /event
    └─ GET /event/:id
            │
            ▼
[5] 이벤트 참여
    └─ POST /user/participate
            │
            ▼
[6] 미션 완료 요청
    └─ PATCH /user/complete/:event_id
    └─ 조건 충족 시 보상 지급

┌────────────────────────────┐
│           SYSTEM           │
└────────────────────────────┘
            │
            ▼
[7] 보상 소진 시 이벤트 자동 종료
    └─ valid = false
    └─ close_reason = "sold_out"

┌────────────────────────────┐
│ ADMIN / OPERATOR / AUDITOR │
└────────────────────────────┘
            │
            ▼
[8] 참여 내역 조회
    └─ GET /user
    └─ GET /user/event/:event_id
    └─ GET /user/status/:status

┌────────────────────────────┐
│         SCHEDULER          │
└────────────────────────────┘
            │
            ▼
[9] 종료일 지난 이벤트 자동 종료
    └─ @Cron('0 * * * *')
    └─ close_reason = "expired"

```

### 이벤트 자동 종료 (스케줄러)

* 스케줄: 매 시간 정각 (0분)
* 동작:

  * `valid: true` 이고 `end_date < now`인 이벤트 자동 종료
  * 종료 시 `valid = false`, `close_reason = "expired"` 자동 설정
* 로그:

  * 종료된 이벤트 개수 콘솔 출력

---

## 2. 전체 API 상세 목록

### AUTH API

#### POST `/auth/register`

* 설명: 회원가입
* 인증: 없음
* 요청 Body:

```json
{
  "email": "test@example.com",
  "password": "123456",
  "role": "user"
}
```

* 응답:

```json
{
  "message": "유저 등록 성공",
  "user": { "email": "test@example.com", "role": "user" }
}
```

#### POST `/auth/login`

* 설명: 로그인 및 JWT 발급
* 인증: 없음
* 요청 Body:

```json
{
  "email": "test@example.com",
  "password": "123456"
}
```

* 응답:

```json
{
  "message": "로그인 성공",
  "token": "Bearer eyJhbGci..."
}
```

---

### REWARD API

#### POST `/reward`

* 설명: 보상 생성
* 인증: 필요
* 권한: admin, operator
* 요청 Body:

```json
{
  "item": {
    "name": "쿠폰",
    "item_type": "coupon"
  },
  "total_quantity": 100
}
```

* 응답:

```json
{
  "reward_id": 1,
  "item": {
    "name": "쿠폰",
    "type": "coupon"
  },
  "total_quantity": 100,
  "quantity": 100,
  "__v": 0
}
```

#### GET `/reward`

* 설명: 보상 전체 조회
* 인증: 필요
* 권한: 전체
* 응답:

```json
[
  {
    "reward_id": 1,
    "item": {
      "name": "쿠폰",
      "type": "coupon"
    },
    "total_quantity": 100,
    "quantity": 95
  }
]
```

#### PATCH `/reward/:reward_id`

* 설명: 보상 수정 (event\_id, total\_quantity 수정 불가)
* 인증: 필요
* 요청 Body:

```json
{
  "item": {
    "name": "수정된 이름",
    "item_type": "point"
  },
  "quantity": 80
}
```

* 응답:

```json
{
    "reward_id": 1,
    "item": {
        "name": "수정된 이름",
        "item_type": "point",
    },
    "total_quantity": 100,
    "quantity": 80,
    "__v": 0
}
```

#### DELETE `/reward/:reward_id`

* 설명: 보상 삭제
* 인증: 필요
* 조건: 이벤트에 연결되어 있지 않아야 함
* 응답:

```json
{
  "acknowledged": true,
  "deletedCount": 1
}
```

---

### EVENT API

#### POST `/event`

* 설명: 이벤트 생성
* 인증: 필요
* 권한: admin, operator
* 요청 Body:

```json
{
  "title": "출석체크",
  "content": "7일 출석시 지급",
  "reward_id": 1,
  "condition": 7,
  "date": {
    "start_date": "2025-05-20T00:00:00Z",
    "end_date": "2025-05-30T00:00:00Z"
  }
}
```

* 응답:

```json
{
  "event_id": 1,
  "title": "출석체크",
  "content": "7일 출석시 지급",
  "reward_id": 1,
  "date": {
      "create_date": "2025-05-19T06:16:19.453Z",
      "start_date": "2025-05-19T08:00:00.000Z",
      "end_date": "2025-05-30T00:00:00.000Z",
  },
  "condition": "7",
  "valid": true,
}
```

#### GET `/event`

* 설명: 이벤트 리스트 조회 (필터 포함)
* 쿼리: valid=true | false | all
* 인증: 필요
* 응답:

```json
[
  {
    "event_id": 1,
    "title": "출석체크",
    "content": "7일 출석시 지급",
    "reward_id": 1,
    "date": {
        "create_date": "2025-05-18T18:25:02.881Z",
        "start_date": "2025-06-01T00:00:00.000Z",
        "end_date": "2025-06-07T00:00:00.000Z",
    },
    "condition": "7",
    "valid": true
  }
]
```

#### GET `/event/:id`

* 설명: 이벤트 단건 조회
* 인증: 필요
* 응답:

```json
{
  "event_id": 1,
  "title": "수정됨",
  "content": "내용",
  "reward_id": 1,
  "date": {
      "create_date": "2025-05-18T18:25:02.881Z",
      "start_date": "2025-06-01T00:00:00.000Z",
      "end_date": "2025-06-07T00:00:00.000Z",
  },
  "condition": "10",
  "valid": true
}
```

#### PATCH `/event/:event_id`

* 설명: 이벤트 수정
* 인증: 필요
* 조건: 보상 연결은 1:1, valid=false 시 close\_reason 자동 부여
* 요청 body:
```json
{
  "title": "수정됨",
  "content": "수정된내용",
  "reward_id": 1
}
```
* 응답:

```json
{
    "message": "업데이트 완료",
    "updateData": {
        "title": "수정됨",
        "content": "수정된내용",
        "reward_id": 1
    }
}
```

#### DELETE `/event/:event_id`

* 설명: 이벤트 삭제 (보상 연결 해제 포함)
* 인증: 필요
* 응답:

```json
{
  "message": "이벤트 삭제 완료",
  "deleted_event": {
    "event_id": 1,
    "title": "출석체크"
  }
}
```

---

### USER PARTICIPATION API

#### POST `/user/participate`

* 설명: 이벤트 참여
* 인증: 필요
* 권한: user, admin
* 요청 Body:

```json
{
  "event_id": 2
}
```

* 응답:

```json
{
    "email": "admin",
    "parti_id": [
        {
            "event_id": 2,
            "condition": 0,
            "date": "2025-05-19T07:31:31.590Z",
            "status": false,
        }
    ],
}
```

#### GET `/user/me`

* 설명: 내 참여 내역 조회
* 인증: 필요
* 응답:

```json
{
  "email": "test@example.com",
  "parti_id": [
    {
      "event_id": 2,
      "condition": 0,
      "status": false,
      "date": "2025-05-21T00:00:00.000Z"
    }
  ]
}
```

#### PATCH `/user/complete/:event_id`

* 설명: 미션 완료 처리 (미션 완료시 자동 지급)
* 인증: 필요
* 응답:

```json
{
  "message": "미션 처리 완료",
  "보상지급여부": true
}
```

#### DELETE `/user/:email/:event_id`

* 설명: 특정 유저 참여 정보 삭제 (admin)
* 인증: 필요
* 응답:

```json
{
  "email": "test@example.com",
  "parti_id": []
}
```

#### GET `/user`

* 설명: 전체 참여 기록 조회
* 인증: 필요
* 권한: admin, auditor, operator
* 응답:

```json
[
  {
    "email": "test@example.com",
    "parti_id": [ ... ]
  }
]
```

#### GET `/user/event/:event_id`

* 설명: 특정 이벤트 참여자 조회
* 인증: 필요
* 권한: admin, auditor, operator
* 응답:

```json
[
  {
    "email": "user1@example.com",
    "parti_id": [ { "event_id": 1, ... } ]
  },
  {
    "email": "user2@example.com",
    "parti_id": [ { "event_id": 1, ... } ]
  }
]
```

#### GET `/user/status/:status`

* 설명: 보상 상태별 참여자 조회
* 인증: 필요
* 권한: admin, auditor, operator
* 응답:

```json
[
  {
    "email": "user1@example.com",
    "parti_id": [ { "event_id": 1, "status": true } ]
  }
]
```

---

## 서비스 구성 요약

| 서비스     | 설명                  | 포트    |
| ------- | ------------------- | ----- |
| gateway | API Gateway, 인증/프록시 | 3000  |
| auth    | 유저 관리, JWT 발급       | 3001  |
| event   | 이벤트/보상/참여 관리        | 3002  |
| mongo   | MongoDB             | 27017 |
