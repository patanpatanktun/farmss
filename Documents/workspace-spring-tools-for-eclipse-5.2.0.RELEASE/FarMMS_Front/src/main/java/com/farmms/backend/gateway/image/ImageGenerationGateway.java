package com.farmms.backend.gateway.image;

/**
 * AI 이미지 생성 서버와 연결하기 위한 공통 인터페이스입니다.
 */
public interface ImageGenerationGateway {

    /**
     * 프롬프트를 AI 서버에 전달하고 생성된 이미지 URL을 반환합니다.
     *
     * @param promptText 이미지 생성 프롬프트
     * @return 생성된 이미지 URL
     */
    String generate(String promptText);
}