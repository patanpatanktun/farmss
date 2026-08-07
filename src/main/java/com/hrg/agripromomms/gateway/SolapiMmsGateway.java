package com.hrg.agripromomms.gateway;

import com.solapi.sdk.SolapiClient;
import com.solapi.sdk.message.model.Message;
import com.solapi.sdk.message.model.MessageType;
import com.solapi.sdk.message.service.DefaultMessageService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

/**
 * SOLAPI 공식 SDK를 이용해 실제 문자를 발송하는 Gateway입니다.
 *
 * 중요:
 * 1. 현재는 이미지를 첨부하지 않으므로 실제 통신사 메시지 타입은 LMS입니다.
 * 2. 추후 이미지를 업로드하고 imageId를 설정하면 MMS로 확장할 수 있습니다.
 * 3. API Key, Secret, 발신번호는 환경변수에서만 읽습니다.
 */
@Component
@ConditionalOnProperty(name = "app.mms.provider", havingValue = "solapi")
public class SolapiMmsGateway implements MmsGateway {

    // SOLAPI 실제 발송 기능을 제공하는 공식 SDK 서비스 객체입니다.
    private final DefaultMessageService messageService;

    // SOLAPI 콘솔에 등록된 발신번호입니다.
    private final String sender;

    /**
     * Spring Boot가 환경변수 값을 주입하여 SOLAPI 클라이언트를 생성합니다.
     */
    public SolapiMmsGateway(
            @Value("${app.solapi.api-key:}") String apiKey,
            @Value("${app.solapi.api-secret:}") String apiSecret,
            @Value("${app.solapi.sender:}") String sender) {

        // 실제 발송 모드인데 인증 정보가 없으면 서버 시작 단계에서 명확하게 중단합니다.
        if (isBlank(apiKey)) {
            throw new IllegalStateException("SOLAPI_API_KEY 환경변수가 없습니다.");
        }
        if (isBlank(apiSecret)) {
            throw new IllegalStateException("SOLAPI_API_SECRET 환경변수가 없습니다.");
        }
        if (isBlank(sender)) {
            throw new IllegalStateException("SOLAPI_SENDER 환경변수가 없습니다.");
        }

        this.sender = normalizePhone(sender);

        // 공식 SDK에 API Key와 Secret을 전달하여 메시지 서비스 객체를 생성합니다.
        this.messageService = SolapiClient.INSTANCE.createInstance(apiKey, apiSecret);
    }

    /**
     * 연락처 한 명에게 실제 SOLAPI 문자 발송을 요청합니다.
     */
    @Override
    public MmsSendResult send(MmsSendCommand command) {
        String receiver = normalizePhone(command.toNumber());

        if (receiver.length() < 10) {
            return MmsSendResult.fail("수신번호 형식이 올바르지 않습니다.");
        }
        if (isBlank(command.content())) {
            return MmsSendResult.fail("문자 내용이 없습니다.");
        }

        try {
            // SOLAPI SDK가 요구하는 메시지 객체를 생성합니다.
            Message message = new Message();

            // 현재 이미지를 첨부하지 않으므로 장문문자(LMS)로 고정합니다.
            message.setType(MessageType.LMS);

            // 발신번호는 프론트 요청값이 아니라 서버 환경변수의 등록된 번호를 사용합니다.
            message.setFrom(sender);
            message.setTo(receiver);
            message.setSubject(command.title());
            message.setText(command.content());

            // SOLAPI 서버에 실제 발송을 요청합니다.
            var response = messageService.send(message, null);

            // SOLAPI가 반환한 그룹 ID를 발송 식별값으로 사용합니다.
            String groupId = response.getGroupInfo() == null
                    ? "SOLAPI-ACCEPTED"
                    : response.getGroupInfo().getGroupId();

            return MmsSendResult.success(groupId);

        } catch (Exception ex) {
            // API 인증 오류, 발신번호 미등록, 잔액 부족 등의 내용을 상위 서비스에 전달합니다.
            String errorMessage = ex.getMessage() == null
                    ? ex.getClass().getSimpleName()
                    : ex.getMessage();
            return MmsSendResult.fail(errorMessage);
        }
    }

    /** 전화번호에서 하이픈, 공백 등 숫자가 아닌 문자를 제거합니다. */
    private String normalizePhone(String phone) {
        return phone == null ? "" : phone.replaceAll("[^0-9]", "");
    }

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }
}
