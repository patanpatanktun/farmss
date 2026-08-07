package com.hrg.agripromomms.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;

/** 프론트엔드가 문자 발송 시 보내는 JSON 요청입니다. */
@Getter
@Setter
@NoArgsConstructor
public class MmsSendRequest {

    /**
     * 기존 Postman 요청과의 호환을 위해 남겨 둔 값입니다.
     * 보안상 실제 발신번호는 이 값을 사용하지 않고 SOLAPI_SENDER 환경변수를 사용합니다.
     */
    private String fromNumber;

    @NotBlank(message = "문자 제목은 필수입니다.")
    private String title;

    @NotBlank(message = "문자 내용은 필수입니다.")
    private String content;

    /**
     * 현재는 이미지 기능을 사용하지 않으므로 생략할 수 있습니다.
     * 추후 AI 이미지 MMS 기능을 붙이면 generated_image의 image_id를 전달합니다.
     */
    private Long imageNum;

    @NotEmpty(message = "수신 연락처를 한 명 이상 선택해야 합니다.")
    private List<Long> contactNums;

    /** N: 즉시 발송, Y: 예약 이력 저장. 기본값은 N입니다. */
    private String reserveFlag = "N";

    /** 예약 발송 시각입니다. 즉시 발송이면 생략합니다. */
    private LocalDateTime sendDate;
}
