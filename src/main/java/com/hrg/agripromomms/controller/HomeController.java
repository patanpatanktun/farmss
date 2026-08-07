package com.hrg.agripromomms.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.LinkedHashMap;
import java.util.Map;

/** 기본 주소에서 서버 상태와 API 경로를 안내합니다. */
@RestController
public class HomeController {

    @GetMapping("/")
    public Map<String, Object> home() {
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("service", "AI 홍보 이미지 MMS 발송 서비스");
        response.put("status", "MySQL 연동 서버가 정상 실행 중입니다.");
        response.put("contacts", "GET /api/contacts");
        response.put("images", "GET /api/images");
        response.put("mmsSend", "POST /api/mms/send");
        response.put("mmsHistory", "GET /api/mms/history");
        response.put("requiredHeader", "X-USER-NUM");
        return response;
    }
}
