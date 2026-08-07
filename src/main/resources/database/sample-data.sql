USE agri_promo_mms;

INSERT INTO `user` (user_id, pw, email, name, gender, age, join_date, phone)
VALUES ('seller01', 'test-password', 'seller01@example.com', '김판매', 'M', 45, NOW(), '01011112222');

SET @USER_NUM = LAST_INSERT_ID();

INSERT INTO contact (user_num, con_name, phone, region, crop) VALUES
(@USER_NUM, '김농부', '01022223333', '광주', '벼'),
(@USER_NUM, '이농부', '01033334444', '나주', '배'),
(@USER_NUM, '박농부', '01044445555', '담양', '딸기');

SET @CONTACT_NUM = (SELECT MIN(con_num) FROM contact WHERE user_num = @USER_NUM);

INSERT INTO contact_group (user_num, group_name, con_description)
VALUES (@USER_NUM, '여름 비료 홍보 대상', '여름철 비료 상품 홍보 대상 그룹');

INSERT INTO product (pro_name, category, price, company, crop, pro_description)
VALUES ('친환경 복합비료', '비료', 25000, '농업회사', '벼', '벼 재배용 복합비료');

SET @PRO_NUM = LAST_INSERT_ID();

INSERT INTO prompt_history (con_num, user_num, prompt_text, create_day)
VALUES (@CONTACT_NUM, @USER_NUM, '친환경 비료 여름 할인 홍보 이미지', NOW());

SET @PROMPT_ID = LAST_INSERT_ID();

INSERT INTO generated_image (prompt_id, user_num, pro_num, image_url, status, create_day)
VALUES (@PROMPT_ID, @USER_NUM, @PRO_NUM, 'https://example.com/images/fertilizer-promo.jpg', 'COMPLETED', NOW());
