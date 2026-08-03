-- ============================================
-- FARMSS AI MMS Service - Database Schema
-- ============================================

CREATE DATABASE IF NOT EXISTS farmss_mms
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_unicode_ci;

USE farmss_mms;

-- ============================================
-- 사용자 (관리자 계정)
-- ============================================
CREATE TABLE IF NOT EXISTS users (
    id          BIGINT          NOT NULL AUTO_INCREMENT,
    username    VARCHAR(50)     NOT NULL UNIQUE,
    password    VARCHAR(255)    NOT NULL,
    name        VARCHAR(100)    NOT NULL,
    email       VARCHAR(100)    UNIQUE,
    role        VARCHAR(20)     NOT NULL DEFAULT 'USER',  -- USER, ADMIN
    is_active   BOOLEAN         NOT NULL DEFAULT TRUE,
    created_at  DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- 고객 (MMS 수신자)
-- ============================================
CREATE TABLE IF NOT EXISTS customers (
    id          BIGINT          NOT NULL AUTO_INCREMENT,
    name        VARCHAR(100)    NOT NULL,
    phone       VARCHAR(20)     NOT NULL,
    group_name  VARCHAR(100),
    memo        TEXT,
    is_active   BOOLEAN         NOT NULL DEFAULT TRUE,
    created_at  DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    INDEX idx_phone (phone),
    INDEX idx_group_name (group_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- AI 생성 이미지
-- ============================================
CREATE TABLE IF NOT EXISTS images (
    id              BIGINT          NOT NULL AUTO_INCREMENT,
    user_id         BIGINT          NOT NULL,
    title           VARCHAR(200),
    prompt          TEXT            NOT NULL,
    image_url       VARCHAR(500)    NOT NULL,
    image_type      VARCHAR(20)     NOT NULL DEFAULT 'GENERATED',  -- GENERATED, UPLOADED
    file_name       VARCHAR(255),
    file_size       BIGINT,
    created_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- 저장된 프롬프트 (문자 템플릿)
-- ============================================
CREATE TABLE IF NOT EXISTS prompts (
    id          BIGINT          NOT NULL AUTO_INCREMENT,
    user_id     BIGINT          NOT NULL,
    title       VARCHAR(200)    NOT NULL,
    content     TEXT            NOT NULL,
    is_template BOOLEAN         NOT NULL DEFAULT FALSE,
    created_at  DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- MMS 발송 내역
-- ============================================
CREATE TABLE IF NOT EXISTS mms_sends (
    id              BIGINT          NOT NULL AUTO_INCREMENT,
    user_id         BIGINT          NOT NULL,
    image_id        BIGINT,
    title           VARCHAR(200),
    message         TEXT            NOT NULL,
    total_count     INT             NOT NULL DEFAULT 0,
    success_count   INT             NOT NULL DEFAULT 0,
    fail_count      INT             NOT NULL DEFAULT 0,
    status          VARCHAR(20)     NOT NULL DEFAULT 'PENDING',  -- PENDING, SENDING, DONE, FAILED, SCHEDULED
    scheduled_at    DATETIME,
    sent_at         DATETIME,
    created_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (image_id) REFERENCES images(id),
    INDEX idx_status (status),
    INDEX idx_scheduled_at (scheduled_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- MMS 발송 상세 (수신자별)
-- ============================================
CREATE TABLE IF NOT EXISTS mms_send_details (
    id              BIGINT          NOT NULL AUTO_INCREMENT,
    mms_send_id     BIGINT          NOT NULL,
    customer_id     BIGINT          NOT NULL,
    phone           VARCHAR(20)     NOT NULL,
    status          VARCHAR(20)     NOT NULL DEFAULT 'PENDING',  -- PENDING, SUCCESS, FAILED
    message_id      VARCHAR(100),   -- Solapi 메시지 ID
    error_message   VARCHAR(500),
    sent_at         DATETIME,
    PRIMARY KEY (id),
    FOREIGN KEY (mms_send_id) REFERENCES mms_sends(id),
    FOREIGN KEY (customer_id) REFERENCES customers(id),
    INDEX idx_mms_send_id (mms_send_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
