package com.agri.mms.client;

import org.springframework.stereotype.Component;

/**
 * SMS 발송 클라이언트 (단문 문자)
 * Solapi를 통한 SMS 발송 처리
 */
@Component
public class SmsClient {

    private final SolapiClient solapiClient;

    public SmsClient(SolapiClient solapiClient) {
        this.solapiClient = solapiClient;
    }

    /**
     * SMS 단건 발송
     * @param to 수신 번호
     * @param text 문자 내용 (최대 90 bytes)
     */
    public void sendSms(String to, String text) {
        // TODO: SMS 발송 구현 (SolapiClient 활용)
    }

    /**
     * SMS 다건 발송
     * @param recipients 수신자 목록 (번호, 메시지)
     */
    public void sendSmsBulk(java.util.List<java.util.Map<String, String>> recipients) {
        // TODO: SMS 다건 발송 구현
    }
}
