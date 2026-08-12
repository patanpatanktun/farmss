package com.farmms.backend.dto.image;

/**
 * 이미지 재생성 완료 후
 * 프론트엔드에 반환하는 응답 DTO입니다.
 */
public record ImageRegenerateResponse(

        /**
         * 재생성의 기준이 된 원본 이미지 번호
         */
        Long originalImageId,

        /**
         * 새롭게 생성된 이미지 번호
         */
        Long regeneratedImageId,

        /**
         * 기존 이미지 URL
         */
        String originalImageUrl,

        /**
         * 새 이미지 URL
         */
        String regeneratedImageUrl,

        /**
         * 사용자가 입력한 수정 요청
         */
        String editPrompt,

        /**
         * 처리 결과 메시지
         */
        String message

) {
}