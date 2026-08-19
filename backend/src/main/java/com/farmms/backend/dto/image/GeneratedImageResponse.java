package com.farmms.backend.dto.image;

import java.time.LocalDateTime;

import com.farmms.backend.domain.image.GeneratedImage;

/**
 * 생성된 AI 홍보 이미지 정보를 반환하는 DTO입니다.
 *
 * 비동기 이미지 생성 상태도 함께 반환합니다.
 */
public record GeneratedImageResponse(

        /**
         * 생성 이미지 번호
         */
        Long imageId,

        /**
         * 이미지에 연결된 상품 번호
         */
        Long proNum,

        /**
         * 최종 생성 이미지 URL
         *
         * PENDING / PROCESSING 상태에서는
         * 아직 이미지가 없으므로 null일 수 있습니다.
         */
        String imageUrl,

        /**
         * 다운로드 횟수
         */
        Long download,

        /**
         * 이미지 생성 요청 시각
         */
        LocalDateTime createDay,

        /**
         * 현재 이미지 생성 상태
         *
         * PENDING
         * PROCESSING
         * COMPLETED
         * FAILED
         */
        String status,

        /**
         * 이미지 생성 실패 원인
         *
         * 정상 상태에서는 null입니다.
         */
        String errorMessage

) {

    /**
     * GeneratedImage Entity를
     * API 응답 DTO로 변환합니다.
     */
    public static GeneratedImageResponse from(
            GeneratedImage image
    ) {

        return new GeneratedImageResponse(

                image.getImageId(),

                image.getProNum(),

                image.getImageUrl(),

                image.getDownload(),

                image.getCreateDay(),

                image.getStatus(),

                image.getErrorMessage()
        );
    }
}