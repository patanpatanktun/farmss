package com.agri.mms.client;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.util.Map;

/**
 * AI 서버(FastAPI)와 통신하는 클라이언트
 */
@Component
public class AiServerClient {

    private final WebClient webClient;

    public AiServerClient(@Value("${ai-server.url}") String aiServerUrl) {
        this.webClient = WebClient.builder()
                .baseUrl(aiServerUrl)
                .build();
    }

    /**
     * AI 이미지 생성 요청
     */
    public Mono<Map> generateImage(Map<String, Object> request) {
        return webClient.post()
                .uri("/api/image/generate")
                .bodyValue(request)
                .retrieve()
                .bodyToMono(Map.class);
    }

    /**
     * AI 프롬프트 생성 요청
     */
    public Mono<Map> generatePrompt(Map<String, Object> request) {
        return webClient.post()
                .uri("/api/prompt/generate")
                .bodyValue(request)
                .retrieve()
                .bodyToMono(Map.class);
    }

    /**
     * Vision 분석 요청
     */
    public Mono<Map> analyzeImage(Map<String, Object> request) {
        return webClient.post()
                .uri("/api/vision/analyze")
                .bodyValue(request)
                .retrieve()
                .bodyToMono(Map.class);
    }

    /**
     * AI 서버 헬스 체크
     */
    public Mono<Map> healthCheck() {
        return webClient.get()
                .uri("/api/health")
                .retrieve()
                .bodyToMono(Map.class);
    }
}
