package com.farmms.backend.dto.user;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * 비밀번호 변경 요청 데이터입니다.
 */
public record PasswordChangeRequest(

        @NotBlank(message = "현재 비밀번호는 필수입니다.")
        String currentPassword,

        @NotBlank(message = "새 비밀번호는 필수입니다.")
        @Size(
                min = 8,
                max = 100,
                message = "새 비밀번호는 8자 이상 100자 이하여야 합니다."
        )
        String newPassword

) {
}