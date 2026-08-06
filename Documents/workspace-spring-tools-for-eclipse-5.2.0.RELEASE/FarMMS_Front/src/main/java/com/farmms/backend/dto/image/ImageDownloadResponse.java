package com.farmms.backend.dto.image;

/**
 * 이미지 다운로드 요청 결과를 반환하는 DTO입니다.
 */
public record ImageDownloadResponse(

        Long imageId,
        String imageUrl,
        Long download

) {
}