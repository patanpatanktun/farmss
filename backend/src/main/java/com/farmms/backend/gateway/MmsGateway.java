package com.farmms.backend.gateway;

/**
 * 외부 문자 발송 업체와 연결되는 공통 인터페이스입니다.
 *
 * MMS 발송에 필요한 세부 정보는
 * MmsSendCommand 객체를 통해 전달합니다.
 *
 * 실제 외부 문자 서비스와 연결하는 구현체가
 * 이 인터페이스를 구현합니다.
 */
public interface MmsGateway {

    /**
     * 고객 한 명에게 MMS 발송을 요청합니다.
     *
     * MmsSendCommand에는 다음 정보가 들어 있습니다.
     *
     * - 발신번호
     * - 수신번호
     * - 제목
     * - 내용
     * - 이미지 URL
     * - 예약발송 시간
     *
     * scheduledDate가 null이면 즉시발송,
     * 값이 존재하면 예약발송으로 처리합니다.
     *
     * @param command MMS 발송 정보
     * @return 문자 업체의 접수 성공 또는 실패 결과
     */
    MmsSendResult send(MmsSendCommand command);
}