package com.agri.mms.client;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.util.Map;

/**
 * Solapi MMS 발송 클라이언트
 */
@Component
public class SolapiClient {

    private final WebClient webClient;

    @Value("${solapi.api-key}")
    private String apiKey;

    @Value("${solapi.api-secret}")
    private String apiSecret;

    @Value("${solapi.sender}")
    private String sender;

    public SolapiClient() {
        this.webClient = WebClient.builder()
                .baseUrl("https://api.solapi.com")
                .build();
    }

    /**
     * MMS 단건 발송
     * @param to 수신 번호
     * @param subject 제목
     * @param text 문자 내용
     * @param imageUrl 이미지 URL
     */
    public Mono<Map> sendMms(String to, String subject, String text, String imageUrl) {
        String authHeader = generateAuthHeader();
        Map<String, Object> message = Map.of(
                "to", to,
                "from", sender,
                "type", "MMS",
                "subject", subject,
                "text", text,
                "imageUrl", imageUrl
        );
        Map<String, Object> body = Map.of("message", message);

        return webClient.post()
                .uri("/messages/v4/send")
                .header("Authorization", authHeader)
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(body)
                .retrieve()
                .bodyToMono(Map.class);
    }

    /**
     * MMS 다건 발송
     */
    public Mono<Map> sendMmsBulk(java.util.List<Map<String, Object>> messages) {
        String authHeader = generateAuthHeader();
        Map<String, Object> body = Map.of("messages", messages);

        return webClient.post()
                .uri("/messages/v4/send-many/detail")
                .header("Authorization", authHeader)
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(body)
                .retrieve()
                .bodyToMono(Map.class);
    }

    /**
     * HMAC 기반 인증 헤더 생성
     */
    private String generateAuthHeader() {
        // TODO: HMAC-SHA256 서명 구현
        // https://developers.solapi.com/authentication 참고
        long timestamp = System.currentTimeMillis();
        String salt = java.util.UUID.randomUUID().toString().substring(0, 16);
        return String.format("HMAC-SHA256 apiKey=%s, date=%d, salt=%s, signature=%s",
                apiKey, timestamp, salt, "SIGNATURE_PLACEHOLDER");
    }
}
