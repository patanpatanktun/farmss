package com.farmms.backend.gateway;

import java.util.UUID;

import org.springframework.stereotype.Component;

/**
 * 실제 문자 요금 없이 MMS 기능의 내부 흐름을 테스트하는 가짜 Gateway입니다.
 *
 * 실제 휴대전화에는 문자가 전송되지 않습니다.
 * 문자 업체를 결정한 뒤 이 클래스를 실제 API 연동 구현체로 교체해야 합니다.
 */
@Component
public class MockMmsGateway implements MmsGateway {

    /**
     * 테스트 규칙에 따라 성공 또는 실패 결과를 반환합니다.
     */
    @Override
    public MmsSendResult send(MmsSendCommand command) {
        // 전화번호가 없거나 10자리 미만이면 실패 처리합니다.
        if (command.toNumber() == null || command.toNumber().length() < 10) {
            return MmsSendResult.fail("잘못된 수신 전화번호입니다.");
        }

        // MMS는 이미지 첨부가 필요하므로 이미지 URL이 없으면 실패합니다.
        if (command.imageUrl() == null || command.imageUrl().isBlank()) {
            return MmsSendResult.fail("첨부 이미지 URL이 없습니다.");
        }

        // 테스트에서 성공 결과를 구분할 수 있도록 임의의 메시지 ID를 생성합니다.
        String mockMessageId = "MOCK-" + UUID.randomUUID();
        return MmsSendResult.success(mockMessageId);
    }
}
