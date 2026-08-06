package com.farmms.backend.service.contact;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.farmms.backend.common.util.PhoneNumberUtils;
import com.farmms.backend.domain.contact.Contact;
import com.farmms.backend.domain.contact.ContactRepository;
import com.farmms.backend.dto.contact.ContactCreateRequest;
import com.farmms.backend.dto.contact.ContactResponse;
import com.farmms.backend.dto.contact.ContactUpdateRequest;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ContactService {

    private final ContactRepository contactRepository;

    /**
     * 로그인한 사용자의 고객을 등록합니다.
     */
    @Transactional
    public ContactResponse create(
            Long userNum,
            ContactCreateRequest request
    ) {
        String normalizedPhone =
                PhoneNumberUtils.normalize(
                        request.getPhone()
                );

        if (contactRepository.existsByUserNumAndPhone(
                userNum,
                normalizedPhone
        )) {
            throw new IllegalArgumentException(
                    "이미 등록된 전화번호입니다."
            );
        }

        Contact contact = Contact.create(
                userNum,
                request.getConName(),
                normalizedPhone,
                request.getRegion(),
                request.getCrop()
        );

        Contact savedContact =
                contactRepository.save(contact);

        return ContactResponse.from(savedContact);
    }

    /**
     * 로그인한 사용자의 전체 고객을 조회합니다.
     */
    public List<ContactResponse> findAll(Long userNum) {

        return contactRepository
                .findAllByUserNumOrderByConNumDesc(userNum)
                .stream()
                .map(ContactResponse::from)
                .toList();
    }

    /**
     * 로그인한 사용자의 고객 정보를 수정합니다.
     */
    @Transactional
    public ContactResponse update(
            Long userNum,
            Long conNum,
            ContactUpdateRequest request
    ) {
        Contact contact = contactRepository
                .findByConNumAndUserNum(
                        conNum,
                        userNum
                )
                .orElseThrow(() ->
                        new EntityNotFoundException(
                                "고객 정보를 찾을 수 없습니다."
                        ));

        String normalizedPhone =
                PhoneNumberUtils.normalize(
                        request.phone()
                );

        // 현재 고객을 제외한 다른 고객과 전화번호가 중복되는지 확인합니다.
        if (contactRepository
                .existsByUserNumAndPhoneAndConNumNot(
                        userNum,
                        normalizedPhone,
                        conNum
                )) {
            throw new IllegalArgumentException(
                    "이미 등록된 전화번호입니다."
            );
        }

        contact.update(
                request.conName(),
                normalizedPhone,
                request.region(),
                request.crop()
        );

        return ContactResponse.from(contact);
    }

    /**
     * 로그인한 사용자의 고객 한 명을 조회합니다.
     */
    public ContactResponse findOne(
            Long userNum,
            Long conNum
    ) {
        Contact contact = contactRepository
                .findByConNumAndUserNum(
                        conNum,
                        userNum
                )
                .orElseThrow(() ->
                        new EntityNotFoundException(
                                "고객 정보를 찾을 수 없습니다."
                        ));

        return ContactResponse.from(contact);
    }

    /**
     * 로그인한 사용자의 고객을 삭제합니다.
     */
    @Transactional
    public void delete(
            Long userNum,
            Long conNum
    ) {
        Contact contact = contactRepository
                .findByConNumAndUserNum(
                        conNum,
                        userNum
                )
                .orElseThrow(() ->
                        new EntityNotFoundException(
                                "고객 정보를 찾을 수 없습니다."
                        ));

        contactRepository.delete(contact);
    }

    /**
     * 지역과 재배 작물 조건으로 고객을 검색합니다.
     */
    public List<ContactResponse> search(
            Long userNum,
            String region,
            String crop
    ) {
        String searchRegion =
                region == null || region.isBlank()
                        ? null
                        : region.trim();

        String searchCrop =
                crop == null || crop.isBlank()
                        ? null
                        : crop.trim();

        return contactRepository
                .search(
                        userNum,
                        searchRegion,
                        searchCrop
                )
                .stream()
                .map(ContactResponse::from)
                .toList();
    }
}