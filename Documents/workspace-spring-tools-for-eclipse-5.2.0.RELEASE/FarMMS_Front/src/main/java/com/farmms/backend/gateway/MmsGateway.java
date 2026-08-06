package com.farmms.backend.gateway;

/**
 * 외부 문자 발송 업체와 연결되는 공통 인터페이스입니다.
 *
 * 현재는 MockMmsGateway가 구현하고 있으며,
 * 실제 서비스에서는 SOLAPI 또는 Naver Cloud 등의 구현체를 추가하면 됩니다.
 */
public interface MmsGateway {

    /**
     * 고객 한 명에게 MMS 발송을 요청합니다.
     *
     * @param command 발신번호, 수신번호, 제목, 내용, 이미지 URL
     * @return 문자 업체의 접수 성공 또는 실패 결과
     */
    MmsSendResult send(MmsSendCommand command);
}
