package com.farmms.backend.dto;

import java.time.OffsetDateTime;
import java.util.List;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 프런트엔드가 MMS 일괄 발송을 요청할 때 보내는
 * JSON 데이터를 받는 DTO입니다.
 */
@Getter
@NoArgsConstructor
public class MmsSendRequest {

    /**
     * 문자 업체에 등록된 발신번호입니다.
     *
     * 회원가입 시 입력한 전화번호를 기본값으로 사용하지만,
     * 사용자가 가게 전화번호 등으로 수정할 수 있습니다.
     */
    @NotBlank(message = "발신번호는 필수입니다.")
    @Pattern(
        regexp = "^0[0-9]{8,10}$",
        message = "발신번호는 하이픈 없이 9~11자리 숫자로 입력하세요."
    )
    private String fromNumber;

    /**
     * MMS 본문 내용입니다.
     */
    @NotBlank(message = "내용은 필수입니다.")
    @Size(
        max = 2000,
        message = "내용은 2000자 이하로 입력하세요."
    )
    private String content;

    /**
     * 이미지 관리 화면에서 선택한
     * AI 홍보 이미지 번호입니다.
     */
    @NotNull(
        message = "홍보 이미지를 선택해야 합니다."
    )
    private Long imageId;

    /**
     * MMS를 보낼 고객 번호 목록입니다.
     */
    @NotEmpty(
        message = "발송 대상 고객을 한 명 이상 선택해야 합니다."
    )
    private List<
        @NotNull(
            message = "고객 번호에는 null을 사용할 수 없습니다."
        )
        Long
    > contactNums;

    /**
     * 예약발송 여부입니다.
     *
     * false = 즉시발송
     * true  = 예약발송
     *
     * 기존 프런트에서 이 값을 보내지 않아도
     * 기본값 false가 적용되어 즉시발송으로 처리됩니다.
     */
    private boolean reserve = false;

    /**
     * 예약발송 시간입니다.
     *
     * ISO-8601 형식으로 전달합니다.
     * 예:
     * 2026-08-12T09:00:00+09:00
     *
     * 즉시발송이면 null이어도 됩니다.
     */
    @Future(message = "예약발송 시간은 현재 시간 이후여야 합니다.")
    private OffsetDateTime reserveDate;
}