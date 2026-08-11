package com.farmms.backend.dto.contact;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * 고객 정보 수정 요청 데이터입니다.
 */
public record ContactUpdateRequest(

        /**
         * 고객이 소속될 그룹 번호입니다.
         * 그룹을 선택하지 않으면 null입니다.
         */
        Long groupNum,

        @NotBlank(message = "고객 이름은 필수입니다.")
        @Size(
                max = 50,
                message = "고객 이름은 50자 이하여야 합니다."
        )
        String conName,

        @NotBlank(message = "전화번호는 필수입니다.")
        @Size(
                max = 20,
                message = "전화번호는 20자 이하여야 합니다."
        )
        String phone,

        @NotBlank(message = "지역은 필수입니다.")
        @Size(
                max = 100,
                message = "지역은 100자 이하여야 합니다."
        )
        String region,

        @Size(
                max = 100,
                message = "작물은 100자 이하여야 합니다."
        )
        String crop

) {
}