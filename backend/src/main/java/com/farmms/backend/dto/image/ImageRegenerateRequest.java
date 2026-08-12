package com.farmms.backend.dto.image;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 기존 이미지를 수정하여 재생성할 때
 * 프론트엔드에서 전달받는 요청 DTO입니다.
 */
@Getter
@NoArgsConstructor
public class ImageRegenerateRequest {

    /**
     * 수정할 기존 이미지 번호입니다.
     *
     * 예:
     * imageId = 10
     */
    @NotNull(
            message = "재생성할 기존 이미지 번호는 필수입니다."
    )
    private Long imageId;

    /**
     * 사용자가 추가로 입력하는 수정 요청입니다.
     *
     * 예:
     * "35,000원을 25,000원으로 변경해주세요."
     */
    @NotBlank(
            message = "이미지 수정 요청은 필수입니다."
    )
    @Size(
            max = 1000,
            message = "수정 요청은 1000자 이하로 입력해주세요."
    )
    private String editPrompt;
}