package com.farmms.backend.gateway.image;

import java.util.UUID;

import org.springframework.boot.autoconfigure.condition
        .ConditionalOnProperty;
import org.springframework.stereotype.Component;

/**
 * 실제 AI API 없이 이미지 생성 흐름을 테스트하는 Mock 구현체입니다.
 *
 * application.yml의 farmms.image.provider 값이
 * mock이거나 설정되지 않은 경우에 사용됩니다.
 */
@Component
@ConditionalOnProperty(
        name = "farmms.image.provider",
        havingValue = "mock",
        matchIfMissing = true
)
public class MockImageGenerationGateway
        implements ImageGenerationGateway {

    /**
     * 실제 이미지를 생성하지 않고 테스트용 이미지 URL을 반환합니다.
     */
    @Override
    public String generate(
            String promptText,
            String referenceImageUrl
    ) {
        /*
         * 생성할 때마다 서로 다른 테스트 이미지 주소가
         * 저장되도록 임의 식별자를 붙입니다.
         */
        String imageKey =
                UUID.randomUUID().toString();

        return "https://placehold.co/1024x1024/png"
                + "?text=FarMms-"
                + imageKey;
    }
}