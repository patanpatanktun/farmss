package com.farmms.backend.dto.contact;

import com.farmms.backend.domain.contact.Contact;

import lombok.Getter;

/**
 * 고객 연락처 정보를 반환하는 응답 데이터입니다.
 */
@Getter
public class ContactResponse {

    private final Long conNum;
    private final Long groupNum;
    private final String conName;
    private final String phone;
    private final String region;
    private final String crop;

    private ContactResponse(
            Long conNum,
            Long groupNum,
            String conName,
            String phone,
            String region,
            String crop
    ) {
        this.conNum = conNum;
        this.groupNum = groupNum;
        this.conName = conName;
        this.phone = phone;
        this.region = region;
        this.crop = crop;
    }

    /**
     * Contact Entity를 응답 DTO로 변환합니다.
     */
    public static ContactResponse from(
            Contact contact
    ) {
        return new ContactResponse(
                contact.getConNum(),
                contact.getGroupNum(),
                contact.getConName(),
                contact.getPhone(),
                contact.getRegion(),
                contact.getCrop()
        );
    }
}