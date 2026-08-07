CREATE DATABASE IF NOT EXISTS agri_promo_mms
    DEFAULT CHARACTER SET utf8mb4
    DEFAULT COLLATE utf8mb4_0900_ai_ci;

USE agri_promo_mms;

-- user는 MySQL 함수/키워드와 혼동될 수 있어 백틱으로 감쌉니다.
CREATE TABLE IF NOT EXISTS `user` (
    user_num BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(100) NOT NULL UNIQUE,
    pw VARCHAR(255) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    name VARCHAR(30) NOT NULL,
    gender CHAR(1) NOT NULL,
    age INT,
    join_date DATETIME NOT NULL,
    phone VARCHAR(20) NOT NULL,
    CONSTRAINT ck_user_gender CHECK (gender IN ('M','F'))
);

CREATE TABLE IF NOT EXISTS contact (
    con_num BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_num BIGINT NOT NULL,
    con_name VARCHAR(50) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    region VARCHAR(100) NOT NULL,
    crop VARCHAR(100),
    CONSTRAINT fk_contact_user
        FOREIGN KEY (user_num) REFERENCES `user`(user_num)
);

CREATE TABLE IF NOT EXISTS contact_group (
    group_num BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_num BIGINT NOT NULL,
    group_name VARCHAR(100) NOT NULL,
    con_description TEXT,
    CONSTRAINT fk_group_user
        FOREIGN KEY (user_num) REFERENCES `user`(user_num)
);

CREATE TABLE IF NOT EXISTS product (
    pro_num BIGINT AUTO_INCREMENT PRIMARY KEY,
    pro_name VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL,
    price INT NOT NULL,
    company VARCHAR(100) NOT NULL,
    crop VARCHAR(100),
    pro_description TEXT
);

CREATE TABLE IF NOT EXISTS prompt_history (
    prompt_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    con_num BIGINT NOT NULL,
    user_num BIGINT NOT NULL,
    prompt_text TEXT NOT NULL,
    create_day DATETIME NOT NULL,
    CONSTRAINT fk_prompt_contact FOREIGN KEY (con_num) REFERENCES contact(con_num),
    CONSTRAINT fk_prompt_user FOREIGN KEY (user_num) REFERENCES `user`(user_num)
);

CREATE TABLE IF NOT EXISTS generated_image (
    image_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    prompt_id BIGINT NOT NULL,
    user_num BIGINT NOT NULL,
    pro_num BIGINT NOT NULL,
    image_url VARCHAR(255) NOT NULL,
    status VARCHAR(20) NOT NULL,
    create_day DATETIME NOT NULL,
    CONSTRAINT fk_image_prompt FOREIGN KEY (prompt_id) REFERENCES prompt_history(prompt_id),
    CONSTRAINT fk_image_user FOREIGN KEY (user_num) REFERENCES `user`(user_num),
    CONSTRAINT fk_image_product FOREIGN KEY (pro_num) REFERENCES product(pro_num)
);

CREATE TABLE IF NOT EXISTS regenerated_image (
    re_image_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    prompt_id BIGINT NOT NULL,
    image_id BIGINT NOT NULL,
    image_url VARCHAR(255) NOT NULL,
    CONSTRAINT fk_regen_prompt FOREIGN KEY (prompt_id) REFERENCES prompt_history(prompt_id),
    CONSTRAINT fk_regen_image FOREIGN KEY (image_id) REFERENCES generated_image(image_id)
);

CREATE TABLE IF NOT EXISTS generation_history (
    history_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_num BIGINT NOT NULL,
    image_id BIGINT NOT NULL,
    download_count INT NOT NULL DEFAULT 0,
    regenerate_flag CHAR(1) NOT NULL,
    create_day DATETIME NOT NULL,
    CONSTRAINT ck_regenerate_flag CHECK (regenerate_flag IN ('Y','N')),
    CONSTRAINT fk_history_user FOREIGN KEY (user_num) REFERENCES `user`(user_num),
    CONSTRAINT fk_history_image FOREIGN KEY (image_id) REFERENCES generated_image(image_id)
);

CREATE TABLE IF NOT EXISTS mms_history (
    mms_num BIGINT AUTO_INCREMENT PRIMARY KEY,
    -- 텍스트 발송 단계에서는 이미지가 없을 수 있으므로 NULL 허용
    image_num BIGINT NULL,
    con_num BIGINT NOT NULL,
    send_date DATETIME NOT NULL,
    send_status VARCHAR(20) NOT NULL,
    reserve_flag CHAR(1) NOT NULL,
    CONSTRAINT ck_send_status CHECK (send_status IN ('WAIT', 'SUCCESS', 'FAIL')),
    CONSTRAINT ck_reserve_flag CHECK (reserve_flag IN ('Y','N')),
    CONSTRAINT fk_mms_image FOREIGN KEY (image_num) REFERENCES generated_image(image_id),
    CONSTRAINT fk_mms_contact FOREIGN KEY (con_num) REFERENCES contact(con_num)
);
