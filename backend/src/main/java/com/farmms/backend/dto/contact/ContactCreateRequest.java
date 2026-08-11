package com.farmms.backend.dto.contact;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 고객 연락처 등록 요청 데이터입니다.
 */
@Getter
@NoArgsConstructor
public class ContactCreateRequest {

    /**
     * 고객이 소속될 그룹 번호입니다.
     * 그룹을 선택하지 않으면 null입니다.
     */
    private Long groupNum;

    @NotBlank(message = "고객 이름은 필수입니다.")
    @Size(
            max = 50,
            message = "고객 이름은 50자 이하여야 합니다."
    )
    private String conName;

    @NotBlank(message = "전화번호는 필수입니다.")
    @Size(
            max = 20,
            message = "전화번호는 20자 이하여야 합니다."
    )
    private String phone;

    @NotBlank(message = "지역은 필수입니다.")
    @Size(
            max = 100,
            message = "지역은 100자 이하여야 합니다."
    )
    private String region;

    @Size(
            max = 100,
            message = "재배 작물은 100자 이하여야 합니다."
    )
    private String crop;
}