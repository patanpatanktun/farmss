package com.hrg.agripromomms.dto;

import java.time.LocalDateTime;

/** 사용자가 생성한 홍보 이미지 목록 응답입니다. */
public record GeneratedImageResponse(
        Long imageNum,
        String imageUrl,
        String status,
        Long productNum,
        String productName,
        LocalDateTime createDay) {
}
