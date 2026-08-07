-- 아래 SQL은 현재 ERD를 바꾸므로 자동 적용하지 않습니다.
-- 개인정보 보호와 실제 단체 발송 기능을 위해 팀과 협의 후 적용하세요.

USE agri_promo_mms;

-- 1. 연락처의 광고 수신 동의 상태
ALTER TABLE contact
    ADD COLUMN receive_consent CHAR(1) NOT NULL DEFAULT 'N',
    ADD COLUMN consent_date DATETIME NULL,
    ADD CONSTRAINT ck_contact_consent CHECK (receive_consent IN ('Y','N'));

-- 2. 연락처와 그룹을 연결하는 다대다 중간 테이블
CREATE TABLE contact_group_member (
    group_num BIGINT NOT NULL,
    con_num BIGINT NOT NULL,
    PRIMARY KEY (group_num, con_num),
    FOREIGN KEY (group_num) REFERENCES contact_group(group_num),
    FOREIGN KEY (con_num) REFERENCES contact(con_num)
);

-- 3. 발송 문구와 외부 API 결과를 이력에 남기기 위한 컬럼
ALTER TABLE mms_history
    ADD COLUMN title VARCHAR(100) NULL,
    ADD COLUMN content VARCHAR(2000) NULL,
    ADD COLUMN provider_message_id VARCHAR(200) NULL,
    ADD COLUMN error_message VARCHAR(500) NULL;
