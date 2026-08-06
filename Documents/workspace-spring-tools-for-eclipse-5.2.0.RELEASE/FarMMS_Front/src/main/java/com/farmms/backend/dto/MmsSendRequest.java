package com.farmms.backend.dto;

import java.util.List;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 프론트엔드가 MMS 일괄 발송을 요청할 때 보내는 JSON 데이터를 받는 DTO입니다.
 */
@Getter
@NoArgsConstructor
public class MmsSendRequest {

    // 문자 업체에 사전 등록된 발신번호입니다.
    @NotBlank(message = "발신번호는 필수입니다.")
    @Pattern(regexp = "^0[0-9]{9,10}$", message = "발신번호는 하이픈 없이 10~11자리 숫자로 입력하세요.")
    private String fromNumber;

    // MMS 제목입니다.
    @NotBlank(message = "제목은 필수입니다.")
    @Size(max = 100, message = "제목은 100자 이하로 입력하세요.")
    private String title;

    // MMS 본문 내용입니다.
    @NotBlank(message = "내용은 필수입니다.")
    @Size(max = 2000, message = "내용은 2000자 이하로 입력하세요.")
    private String content;

    // 이미지 관리 화면에서 선택한 AI 홍보 이미지 ID입니다.
    @NotNull(message = "홍보 이미지를 선택해야 합니다.")
    private Long imageId;

 // MMS를 보낼 고객의 con_num 목록입니다.
    @NotEmpty(message = "발송 대상 고객을 한 명 이상 선택해야 합니다.")
    private List<
            @NotNull(message = "고객 번호에는 null을 사용할 수 없습니다.")
            Long
    > contactNums;
}
