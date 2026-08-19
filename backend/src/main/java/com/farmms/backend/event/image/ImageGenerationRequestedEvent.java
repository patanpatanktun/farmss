package com.farmms.backend.event.image;

/**
 * 이미지 생성 요청의 DB 저장이 완료된 후
 * 백그라운드 이미지 생성 작업으로 전달할 이벤트입니다.
 *
 * 실제 OpenAI 호출에 필요한 최소한의 값만 담습니다.
 */
public record ImageGenerationRequestedEvent(

        /**
         * generated_image 테이블에
         * PENDING 상태로 먼저 저장된 이미지 번호입니다.
         */
        Long imageId,

        /**
         * OpenAI에 실제 전달할 최종 이미지 생성 프롬프트입니다.
         *
         * 상품명, 가격, 설명,
         * 사용자의 추가 요청 등이 포함됩니다.
         */
        String imagePrompt,

        /**
         * 상품에 등록된 참고 이미지 주소입니다.
         *
         * 참고 이미지가 없다면 null일 수 있습니다.
         */
        String referenceImageUrl,

        /**
         * 이미지 생성 완료 후
         * 하단 문의 배너에 사용할 판매 업체명입니다.
         */
        String company,

        /**
         * 이미지 하단 문의 배너에
         * 정확하게 표시할 업체 전화번호입니다.
         */
        String companyPhone

) {
}