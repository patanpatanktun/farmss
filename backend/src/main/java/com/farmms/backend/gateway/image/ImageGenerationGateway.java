package com.farmms.backend.gateway.image;

/**
 * AI 이미지 생성 API와 연결하기 위한 공통 인터페이스입니다.
 *
 * Mock 이미지 생성기와 실제 OpenAI 이미지 생성기가
 * 동일한 형식으로 동작하도록 정의합니다.
 */
public interface ImageGenerationGateway {

    /**
     * 프롬프트와 상품 참고 이미지를 이용해
     * 농자재 홍보 이미지를 생성합니다.
     *
     * 참고 이미지가 없으면 프롬프트만 이용해 새 이미지를 생성하고,
     * 참고 이미지가 있으면 해당 상품의 형태와 특징을 참고하여
     * 홍보 이미지를 생성합니다.
     *
     * @param promptText 이미지 생성 프롬프트
     * @param referenceImageUrl 상품 참고 이미지 주소
     * @return 생성된 이미지에 접근할 수 있는 URL
     */
    String generate(
            String promptText,
            String referenceImageUrl
    );
}