USE agri_promo_mms;

-- 기존 DB를 이미 생성한 경우 한 번만 실행합니다.
-- 현재는 이미지 없이 문자 발송을 테스트하므로 image_num을 NULL 허용으로 변경합니다.
ALTER TABLE mms_history
    MODIFY COLUMN image_num BIGINT NULL;
