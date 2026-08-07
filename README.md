# agri-promo-mms MySQL 연동본

사용자가 제공한 MySQL 테이블명과 컬럼명에 맞춰 다시 작성한 Spring Boot 백엔드입니다.

## 1. 실행 전 준비

1. MySQL Workbench에서 `src/main/resources/database/schema.sql`을 실행합니다.
2. 테스트 데이터가 필요하면 `sample-data.sql`을 이어서 실행합니다.
3. `application-mysql.yml`에서 MySQL 아이디와 비밀번호를 수정합니다.
4. Eclipse에서 `AgriPromoMmsApplication.java`를 Spring Boot App으로 실행합니다.

## 2. 패키지 구조

- `domain/user`: user 테이블
- `domain/contact`: contact 테이블
- `domain/group`: contact_group 테이블
- `domain/product`: product 테이블
- `domain/prompt`: prompt_history 테이블
- `domain/image`: generated_image, regenerated_image 테이블
- `domain/history`: generation_history 테이블
- `domain/mms`: mms_history 테이블
- `controller`: 프론트엔드가 호출하는 REST API
- `service`: MMS 발송 업무 로직
- `gateway`: Mock 또는 향후 SOLAPI 연동 부분

## 3. Postman MMS 테스트

### Header

- `X-USER-NUM: 1`
- `Content-Type: application/json`

### POST URL

`http://localhost:8082/api/mms/send`

### JSON Body

```json
{
  "fromNumber": "01012341234",
  "title": "비료 할인 안내",
  "content": "이번 주 비료 할인 행사를 진행합니다.",
  "imageNum": 1,
  "contactNums": [1, 2, 3],
  "reserveFlag": "N"
}
```

현재 `MockMmsGateway`를 사용하므로 실제 휴대전화에는 전송되지 않고 `mms_history.send_status`만 SUCCESS 또는 FAIL로 갱신됩니다.

## 4. 현재 DB 설계에서 확인해야 할 점

1. `contact_group`과 `contact`를 연결하는 중간 테이블이 없습니다. 따라서 특정 그룹에 누가 속하는지 저장할 수 없습니다.
2. `contact`에 광고성 MMS 수신 동의 컬럼이 없습니다.
3. `mms_history`에 제목, 본문, 외부 API 메시지 ID, 실패 사유가 없습니다.
4. `mms_history`에 일괄 발송 묶음을 구분하는 batch ID가 없습니다.
5. 예약 발송은 제목과 본문을 DB에 보관해야 안정적으로 실행할 수 있습니다.

팀과 협의 후 `recommended_extensions.sql` 적용을 권장합니다.

---

## SOLAPI 실제 문자 발송 버전

이 프로젝트에는 `SolapiMmsGateway`가 추가되어 있습니다.
이미지 업로드 전 단계이므로 실제 메시지 타입은 LMS이며, 설정 방법은 `SOLAPI_SETUP.md`를 확인하세요.
API Key와 Secret은 코드에 넣지 않고 Eclipse 환경변수로 등록합니다.

## GPT-4.1 홍보 콘텐츠 생성

추가된 API:

```text
POST /api/ai/promotion
```

이 API는 GPT-4.1을 사용해 다음 값을 생성합니다.

- MMS 제목
- MMS 본문
- 추후 이미지 생성 모델에 사용할 이미지 프롬프트

자세한 설정은 `OPENAI_SETUP.md`를 확인하세요.
