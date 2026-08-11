package com.farmms.backend.dto.user;

import jakarta.validation.constraints.NotBlank;

/**
 * 회원정보 수정 전 현재 비밀번호 확인 요청입니다.
 */
public record CurrentPasswordRequest(

        @NotBlank(message = "현재 비밀번호를 입력해주세요.")
        String currentPassword

) {
}