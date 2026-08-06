package com.farmms.backend.dto.image;

import java.time.LocalDateTime;

import com.farmms.backend.domain.image.GeneratedImage;

/**
 * 생성된 AI 홍보 이미지 정보를 반환하는 DTO입니다.
 */
public record GeneratedImageResponse(

        Long imageId,
        Long proNum,
        String imageUrl,
        Long download,
        LocalDateTime createDay

) {

    /**
     * GeneratedImage Entity를 응답 DTO로 변환합니다.
     */
    public static GeneratedImageResponse from(
            GeneratedImage image
    ) {
        return new GeneratedImageResponse(
                image.getImageId(),
                image.getProNum(),
                image.getImageUrl(),
                image.getDownload(),
                image.getCreateDay()
        );
    }
}