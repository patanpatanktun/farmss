package com.farmms.backend.service.contact;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.farmms.backend.common.util.PhoneNumberUtils;
import com.farmms.backend.domain.contact.Contact;
import com.farmms.backend.domain.contact.ContactRepository;
import com.farmms.backend.domain.contactgroup.ContactGroupRepository;
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
    private final ContactGroupRepository contactGroupRepository;

    /**
     * 로그인한 사용자의 고객을 등록합니다.
     */
    @Transactional
    public ContactResponse create(
            Long userNum,
            ContactCreateRequest request
    ) {
        validateGroupOwnership(
                userNum,
                request.getGroupNum()
        );

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
                request.getGroupNum(),
                request.getConName().trim(),
                normalizedPhone,
                request.getRegion().trim(),
                normalizeCrop(request.getCrop())
        );

        Contact savedContact =
                contactRepository.save(contact);

        return ContactResponse.from(savedContact);
    }

    /**
     * 로그인한 사용자의 전체 고객을 조회합니다.
     *
     * 목록에서는 개인정보 보호를 위해
     * 전화번호를 마스킹해서 반환합니다.
     */
    public List<ContactResponse> findAll(
            Long userNum
    ) {
        return contactRepository
                .findAllByUserNumOrderByConNumDesc(
                        userNum
                )
                .stream()
                .map(ContactResponse::fromMasked)
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
                        )
                );

        validateGroupOwnership(
                userNum,
                request.groupNum()
        );

        String normalizedPhone =
                PhoneNumberUtils.normalize(
                        request.phone()
                );

        boolean duplicatedPhone =
                contactRepository
                        .existsByUserNumAndPhoneAndConNumNot(
                                userNum,
                                normalizedPhone,
                                conNum
                        );

        if (duplicatedPhone) {
            throw new IllegalArgumentException(
                    "이미 등록된 전화번호입니다."
            );
        }

        contact.update(
                request.groupNum(),
                request.conName().trim(),
                normalizedPhone,
                request.region().trim(),
                normalizeCrop(request.crop())
        );

        return ContactResponse.from(contact);
    }

    /**
     * 로그인한 사용자의 고객 한 명을 조회합니다.
     *
     * 상세 조회에서는 수정 등에 사용할 수 있도록
     * 원본 전화번호를 반환합니다.
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
                        )
                );

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
                        )
                );

        contactRepository.delete(contact);
    }

    /**
     * 지역과 재배작물 조건으로 고객을 검색합니다.
     *
     * 검색 결과도 목록이므로
     * 전화번호를 마스킹해서 반환합니다.
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
                .map(ContactResponse::fromMasked)
                .toList();
    }

    /**
     * 선택한 그룹이 로그인한 사용자의 그룹인지 확인합니다.
     */
    private void validateGroupOwnership(
            Long userNum,
            Long groupNum
    ) {
        if (groupNum == null) {
            return;
        }

        boolean groupExists =
                contactGroupRepository
                        .findByGroupNumAndUserNum(
                                groupNum,
                                userNum
                        )
                        .isPresent();

        if (!groupExists) {
            throw new IllegalArgumentException(
                    "선택한 고객 그룹을 찾을 수 없습니다."
            );
        }
    }

    /**
     * 작물값의 공백을 정리합니다.
     */
    private String normalizeCrop(
            String crop
    ) {
        if (crop == null || crop.isBlank()) {
            return null;
        }

        return crop.trim();
    }
}