package com.farmms.backend.dto.contactgroup;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * 고객 그룹 수정 요청 데이터입니다.
 */
public record ContactGroupUpdateRequest(

        @NotBlank(message = "그룹 이름은 필수입니다.")
        @Size(max = 100, message = "그룹 이름은 100자 이하여야 합니다.")
        String groupName,

        String conDescription

) {
}