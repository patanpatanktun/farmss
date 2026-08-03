-- ============================================
-- FARMSS AI MMS Service - Init Data
-- ============================================

USE farmss_mms;

-- 기본 관리자 계정 생성
-- 비밀번호: admin1234 (BCrypt 암호화)
INSERT INTO users (username, password, name, email, role)
VALUES (
    'admin',
    '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBpwTTyU9Q6ZUi',
    '관리자',
    'admin@farmss.kr',
    'ADMIN'
)
ON DUPLICATE KEY UPDATE id = id;
