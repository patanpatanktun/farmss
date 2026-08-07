package com.hrg.agripromomms;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

/**
 * AI 홍보 이미지 생성 및 MMS 발송 서비스의 시작 클래스입니다.
 */
@EnableAsync
@SpringBootApplication
public class AgriPromoMmsApplication {

    public static void main(String[] args) {
        SpringApplication.run(AgriPromoMmsApplication.class, args);
    }
}
