package com.farmms.backend.dto.contact;

import com.farmms.backend.domain.contact.Contact;

import lombok.Getter;

@Getter
public class ContactResponse {

    private final Long conNum;
    private final String conName;
    private final String phone;
    private final String region;
    private final String crop;

    private ContactResponse(
            Long conNum,
            String conName,
            String phone,
            String region,
            String crop) {

        this.conNum = conNum;
        this.conName = conName;
        this.phone = phone;
        this.region = region;
        this.crop = crop;
    }

    public static ContactResponse from(Contact contact) {

        return new ContactResponse(
                contact.getConNum(),
                contact.getConName(),
                contact.getPhone(),
                contact.getRegion(),
                contact.getCrop()
        );
    }
}