package com.hrg.agripromomms.controller.ai;

import com.hrg.agripromomms.dto.ai.AiPromotionRequest;
import com.hrg.agripromomms.dto.ai.AiPromotionResponse;
import com.hrg.agripromomms.service.ai.OpenAiPromotionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

/**
 * GPT-4.1을 이용한 농자재 홍보 콘텐츠 생성 API입니다.
 */
@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
public class AiPromotionController {

    private final OpenAiPromotionService openAiPromotionService;

    /** 브라우저에서 접속했을 때 POST 사용법을 안내합니다. */
    @GetMapping("/promotion")
    public Map<String, Object> promotionGuide() {
        return Map.of(
                "message", "홍보 콘텐츠 생성은 POST 요청으로 실행해야 합니다.",
                "method", "POST",
                "url", "/api/ai/promotion",
                "requiredHeader", "X-USER-NUM",
                "model", "gpt-4.1");
    }

    /**
     * 상품 정보를 바탕으로 MMS 제목·본문·이미지 프롬프트를 생성합니다.
     */
    @PostMapping("/promotion")
    public ResponseEntity<AiPromotionResponse> generatePromotion(
            @RequestHeader("X-USER-NUM") Long userNum,
            @Valid @RequestBody AiPromotionRequest request) {

        return ResponseEntity.ok(
                openAiPromotionService.generatePromotion(userNum, request));
    }
}
