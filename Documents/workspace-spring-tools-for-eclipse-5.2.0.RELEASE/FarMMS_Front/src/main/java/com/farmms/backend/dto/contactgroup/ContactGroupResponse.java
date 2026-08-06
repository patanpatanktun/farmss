package com.farmms.backend.dto.contactgroup;

import com.farmms.backend.domain.contactgroup.ContactGroup;

/**
 * 고객 그룹 정보를 반환하는 응답 데이터입니다.
 */
public record ContactGroupResponse(

        Long groupNum,
        String groupName,
        String conDescription

) {

    /**
     * ContactGroup Entity를 응답 DTO로 변환합니다.
     */
    public static ContactGroupResponse from(
            ContactGroup contactGroup
    ) {
        return new ContactGroupResponse(
                contactGroup.getGroupNum(),
                contactGroup.getGroupName(),
                contactGroup.getConDescription()
        );
    }
}