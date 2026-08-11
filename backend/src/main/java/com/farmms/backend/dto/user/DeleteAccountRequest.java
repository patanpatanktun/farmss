package com.farmms.backend.dto.user;

import jakarta.validation.constraints.NotBlank;

/**
 * 회원 탈퇴 요청 데이터입니다.
 */
public record DeleteAccountRequest(

        @NotBlank(message = "현재 비밀번호를 입력해주세요.")
        String currentPassword

) {
}