package com.farmms.backend.gateway;

import java.util.UUID;

import org.springframework.boot.autoconfigure.condition
        .ConditionalOnProperty;
import org.springframework.stereotype.Component;

/**
 * 실제 문자 요금 없이 MMS 내부 흐름을 테스트하는
 * Mock Gateway입니다.
 *
 * application.yml의 farmms.mms.provider 값이
 * mock이거나 설정되지 않은 경우에만 활성화됩니다.
 */
@Component
@ConditionalOnProperty(
        name = "farmms.mms.provider",
        havingValue = "mock",
        matchIfMissing = true
)
public class MockMmsGateway
        implements MmsGateway {

    /**
     * 테스트 규칙에 따라 성공 또는 실패 결과를 반환합니다.
     */
    @Override
    public MmsSendResult send(
            MmsSendCommand command
    ) {
        if (
                command.toNumber() == null ||
                command.toNumber().length() < 10
        ) {
            return MmsSendResult.fail(
                    "잘못된 수신 전화번호입니다."
            );
        }

        if (
                command.imageUrl() == null ||
                command.imageUrl().isBlank()
        ) {
            return MmsSendResult.fail(
                    "첨부 이미지 URL이 없습니다."
            );
        }

        String mockMessageId =
                "MOCK-" + UUID.randomUUID();

        return MmsSendResult.success(
                mockMessageId
        );
    }
}