package com.farmms.backend.gateway.image;

import java.util.UUID;

import org.springframework.stereotype.Component;

/**
 * 실제 AI 서버 없이 이미지 생성 흐름을 테스트하는 Mock 구현체입니다.
 */
@Component
public class MockImageGenerationGateway
        implements ImageGenerationGateway {

    @Override
    public String generate(String promptText) {

        // 테스트할 때 서로 다른 이미지 URL로 저장되도록 임의 ID를 붙입니다.
        String imageKey = UUID.randomUUID().toString();

        return "https://placehold.co/1024x1024/png"
                + "?text=FarMms-"
                + imageKey;
    }
}