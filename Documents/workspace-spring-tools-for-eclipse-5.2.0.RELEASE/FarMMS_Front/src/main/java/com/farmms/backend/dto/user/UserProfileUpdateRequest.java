package com.farmms.backend.dto.user;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/**
 * 회원 기본정보 수정 요청 데이터입니다.
 */
public record UserProfileUpdateRequest(

        @NotBlank(message = "이메일은 필수입니다.")
        @Email(message = "올바른 이메일 형식이 아닙니다.")
        @Size(max = 100, message = "이메일은 100자 이하여야 합니다.")
        String email,

        @NotBlank(message = "이름은 필수입니다.")
        @Size(max = 30, message = "이름은 30자 이하여야 합니다.")
        String name,

        @NotBlank(message = "성별은 필수입니다.")
        @Pattern(
                regexp = "^[MF]$",
                message = "성별은 M 또는 F로 입력해야 합니다."
        )
        String gender,

        @Min(value = 1, message = "나이는 1 이상이어야 합니다.")
        @Max(value = 120, message = "나이는 120 이하여야 합니다.")
        Integer age,

        @NotBlank(message = "전화번호는 필수입니다.")
        @Pattern(
                regexp = "^0[0-9-]{9,12}$",
                message = "올바른 전화번호 형식이 아닙니다."
        )
        String phone

) {
}