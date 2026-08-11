package com.farmms.backend.service.contactgroup;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.farmms.backend.domain.contact.Contact;
import com.farmms.backend.domain.contact.ContactRepository;
import com.farmms.backend.domain.contactgroup.ContactGroup;
import com.farmms.backend.domain.contactgroup.ContactGroupRepository;
import com.farmms.backend.dto.contactgroup.ContactGroupCreateRequest;
import com.farmms.backend.dto.contactgroup.ContactGroupResponse;
import com.farmms.backend.dto.contactgroup.ContactGroupUpdateRequest;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ContactGroupService {

    private final ContactGroupRepository contactGroupRepository;
    private final ContactRepository contactRepository;

    /**
     * 로그인한 사용자의 고객 그룹을 등록합니다.
     */
    @Transactional
    public ContactGroupResponse create(
            Long userNum,
            ContactGroupCreateRequest request
    ) {
        String groupName =
                request.groupName().trim();

        if (
            contactGroupRepository
                    .existsByUserNumAndGroupName(
                            userNum,
                            groupName
                    )
        ) {
            throw new IllegalArgumentException(
                    "이미 등록된 그룹 이름입니다."
            );
        }

        ContactGroup contactGroup =
                ContactGroup.create(
                        userNum,
                        groupName,
                        normalizeDescription(
                                request.conDescription()
                        )
                );

        ContactGroup savedContactGroup =
                contactGroupRepository.save(
                        contactGroup
                );

        return ContactGroupResponse.from(
                savedContactGroup
        );
    }

    /**
     * 로그인한 사용자의 고객 그룹 목록을 조회합니다.
     */
    public List<ContactGroupResponse> findAll(
            Long userNum
    ) {
        return contactGroupRepository
                .findAllByUserNumOrderByGroupNumDesc(
                        userNum
                )
                .stream()
                .map(ContactGroupResponse::from)
                .toList();
    }

    /**
     * 로그인한 사용자의 고객 그룹 한 개를 조회합니다.
     */
    public ContactGroupResponse findOne(
            Long userNum,
            Long groupNum
    ) {
        ContactGroup contactGroup =
                findContactGroup(
                        userNum,
                        groupNum
                );

        return ContactGroupResponse.from(
                contactGroup
        );
    }

    /**
     * 로그인한 사용자의 고객 그룹 정보를 수정합니다.
     */
    @Transactional
    public ContactGroupResponse update(
            Long userNum,
            Long groupNum,
            ContactGroupUpdateRequest request
    ) {
        ContactGroup contactGroup =
                findContactGroup(
                        userNum,
                        groupNum
                );

        String groupName =
                request.groupName().trim();

        boolean duplicatedGroupName =
                contactGroupRepository
                        .existsByUserNumAndGroupNameAndGroupNumNot(
                                userNum,
                                groupName,
                                groupNum
                        );

        if (duplicatedGroupName) {
            throw new IllegalArgumentException(
                    "이미 등록된 그룹 이름입니다."
            );
        }

        contactGroup.update(
                groupName,
                normalizeDescription(
                        request.conDescription()
                )
        );

        return ContactGroupResponse.from(
                contactGroup
        );
    }

    /**
     * 고객 그룹을 삭제합니다.
     *
     * 해당 그룹에 소속된 고객은 삭제하지 않고,
     * 그룹 번호만 null로 변경하여 미분류 고객으로 유지합니다.
     */
    @Transactional
    public void delete(
            Long userNum,
            Long groupNum
    ) {
        ContactGroup contactGroup =
                findContactGroup(
                        userNum,
                        groupNum
                );

        List<Contact> contacts =
                contactRepository
                        .findAllByUserNumAndGroupNum(
                                userNum,
                                groupNum
                        );

        for (Contact contact : contacts) {
            contact.changeGroup(null);
        }

        /*
         * 고객의 group_num을 먼저 null로 반영하여
         * contact_group 외래키 오류를 방지합니다.
         */
        contactRepository.flush();

        contactGroupRepository.delete(
                contactGroup
        );

        contactGroupRepository.flush();
    }

    /**
     * 로그인한 사용자의 특정 그룹을 조회합니다.
     */
    private ContactGroup findContactGroup(
            Long userNum,
            Long groupNum
    ) {
        return contactGroupRepository
                .findByGroupNumAndUserNum(
                        groupNum,
                        userNum
                )
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "고객 그룹을 찾을 수 없습니다."
                        )
                );
    }

    /**
     * 그룹 설명값을 정리합니다.
     */
    private String normalizeDescription(
            String description
    ) {
        if (
            description == null ||
            description.isBlank()
        ) {
            return null;
        }

        return description.trim();
    }
}