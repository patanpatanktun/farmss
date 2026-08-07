package com.hrg.agripromomms.dto;

/** 판매업자의 연락처 목록 응답입니다. */
public record ContactResponse(
        Long contactNum,
        String name,
        String maskedPhone,
        String region,
        String crop) {
}
