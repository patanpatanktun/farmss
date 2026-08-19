package com.farmms.backend.dto.image;

/**
 * 비동기 이미지 생성 요청을 접수한 직후
 * 프론트엔드에 반환하는 응답 DTO입니다.
 *
 * 실제 이미지는 백그라운드에서 생성됩니다.
 */
public record ImageGenerateAcceptedResponse(

        /**
         * generated_image 테이블에
         * 먼저 생성된 이미지 번호입니다.
         */
        Long imageId,

        /**
         * 현재 이미지 생성 상태입니다.
         *
         * 처음 요청 시에는 PENDING 상태입니다.
         */
        String status,

        /**
         * 사용자에게 보여줄 안내 메시지입니다.
         */
        String message

) {
}