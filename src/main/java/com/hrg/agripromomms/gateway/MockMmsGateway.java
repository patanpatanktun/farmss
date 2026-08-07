package com.hrg.agripromomms.gateway;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

import java.util.UUID;

/**
 * 실제 휴대전화로 문자를 보내지 않고 성공 결과만 만드는 테스트용 Gateway입니다.
 *
 * application.yml에서 app.mms.provider=mock일 때 사용합니다.
 */
@Component
@ConditionalOnProperty(name = "app.mms.provider", havingValue = "mock", matchIfMissing = true)
public class MockMmsGateway implements MmsGateway {

    @Override
    public MmsSendResult send(MmsSendCommand command) {
        // 전화번호에서 하이픈을 제거한 뒤 최소 길이를 검사합니다.
        String phone = normalizePhone(command.toNumber());
        if (phone.length() < 10) {
            return MmsSendResult.fail("전화번호 형식이 올바르지 않습니다.");
        }

        // 제목과 내용이 비어 있으면 테스트 발송도 실패로 처리합니다.
        if (command.title() == null || command.title().isBlank()) {
            return MmsSendResult.fail("문자 제목이 없습니다.");
        }
        if (command.content() == null || command.content().isBlank()) {
            return MmsSendResult.fail("문자 내용이 없습니다.");
        }

        // 실제 업체 메시지 ID 대신 테스트용 UUID를 반환합니다.
        return MmsSendResult.success("MOCK-" + UUID.randomUUID());
    }

    private String normalizePhone(String phone) {
        return phone == null ? "" : phone.replaceAll("[^0-9]", "");
    }
}
