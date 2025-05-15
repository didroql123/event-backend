# event-backend



작업순서
1. 실행 환경 설치
2. . 유저 정보 입력 (register)
   . 유저 로그인 (login)
3. . gateway 생성
    - POST : localhost:3000/auth/login ... > auth:3001/auth/login 으로 라우트
    - GET [JWT] >> role 기반 >> EVENT MENU RETURN
   . auth의 외부포트 닫음

4. event 메뉴 설계 및 구현 (간단한 crud까지)
    . operator
     1. 이벤트 crud
     2. 보상 crud
    . user
     1. 이벤트 조회 
     2. 보상 요청
    . auditor
     1. 전체 유저 보상 조회
    . admin
     --모든 메뉴 가능

    
     DB 설계
     -users(auth){ 
        email : string,
        pw : string,
        role : string
      }
     -event_list(event){
        event_id : num,
        title : string,
        content : string,
        reward_id : num,
        date : array{
            create_date : datetime,
            start_date : datetime,
            end_date : datetime,
        },
        condition : string,
        valid : boolean
     }
     
     - reward_list(event){
        reward_id : num,
        item : string,
        total_quantity : num,
        quantity : num,
        event_id : num
     }
     
     - users(event){
        email : string (unique),
        parti_id : array[
            info : array[
                event_id : num,
                condition : string,
                date : datetime,
                status : boolean
            ]
        ]
     }

5. gateway - auth , event (jwt, role)라우팅 완료

6. event crud 세부화(role 별)