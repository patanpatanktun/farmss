package com.farmms.backend.dto.contact;

import com.farmms.backend.domain.contact.Contact;
import com.farmms.backend.util.PhoneMaskingUtil;

import lombok.Getter;

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
     * 고객 상세조회용
     * 전화번호 원본을 반환합니다.
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

    /**
     * 고객 목록조회용
     * 전화번호를 마스킹해서 반환합니다.
     */
    public static ContactResponse fromMasked(
            Contact contact
    ) {
        return new ContactResponse(
                contact.getConNum(),
                contact.getGroupNum(),
                contact.getConName(),
                PhoneMaskingUtil.mask(
                        contact.getPhone()
                ),
                contact.getRegion(),
                contact.getCrop()
        );
    }
}