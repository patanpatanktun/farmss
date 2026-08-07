package com.hrg.agripromomms.gateway;

/** Mock 또는 SOLAPI 구현체가 공통으로 지켜야 할 MMS 발송 규칙입니다. */
public interface MmsGateway {
    MmsSendResult send(MmsSendCommand command);
}
