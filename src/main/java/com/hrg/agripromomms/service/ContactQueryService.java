package com.hrg.agripromomms.service;

import com.hrg.agripromomms.common.util.PhoneMaskingUtils;
import com.hrg.agripromomms.domain.contact.ContactRepository;
import com.hrg.agripromomms.dto.ContactResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/** Postman 테스트와 프론트 화면을 위한 연락처 조회 서비스입니다. */
@Service
@RequiredArgsConstructor
public class ContactQueryService {

    private final ContactRepository contactRepository;

    @Transactional(readOnly = true)
    public List<ContactResponse> getContacts(Long userNum) {
        return contactRepository.findAllOwnedBy(userNum).stream()
                .map(c -> new ContactResponse(
                        c.getConNum(),
                        c.getConName(),
                        PhoneMaskingUtils.mask(c.getPhone()),
                        c.getRegion(),
                        c.getCrop()))
                .toList();
    }
}
