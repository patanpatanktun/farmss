package com.farmms.backend.service.contactgroup;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.farmms.backend.dto.contactgroup.ContactGroupUpdateRequest;
import com.farmms.backend.domain.contactgroup.ContactGroup;
import com.farmms.backend.domain.contactgroup.ContactGroupRepository;
import com.farmms.backend.dto.contactgroup.ContactGroupCreateRequest;
import com.farmms.backend.dto.contactgroup.ContactGroupResponse;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ContactGroupService {

    private final ContactGroupRepository contactGroupRepository;

    /**
     * 로그인한 사용자의 고객 그룹을 등록합니다.
     */
    @Transactional
    public ContactGroupResponse create(
            Long userNum,
            ContactGroupCreateRequest request
    ) {
        String groupName = request.groupName().trim();

        // 같은 사용자가 동일한 그룹 이름을 등록하지 못하게 합니다.
        if (contactGroupRepository.existsByUserNumAndGroupName(
                userNum,
                groupName
        )) {
            throw new IllegalArgumentException(
                    "이미 등록된 그룹 이름입니다."
            );
        }

        ContactGroup contactGroup = ContactGroup.create(
                userNum,
                groupName,
                request.conDescription()
        );

        ContactGroup savedContactGroup =
                contactGroupRepository.save(contactGroup);

        return ContactGroupResponse.from(savedContactGroup);
    }
    
    /**
     * 로그인한 사용자의 고객 그룹 목록을 조회합니다.
     */
    public List<ContactGroupResponse> findAll(Long userNum) {

        return contactGroupRepository
                .findAllByUserNumOrderByGroupNumDesc(userNum)
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
        ContactGroup contactGroup = contactGroupRepository
                .findByGroupNumAndUserNum(groupNum, userNum)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "고객 그룹을 찾을 수 없습니다."
                        ));

        return ContactGroupResponse.from(contactGroup);
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
        ContactGroup contactGroup = contactGroupRepository
                .findByGroupNumAndUserNum(groupNum, userNum)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "고객 그룹을 찾을 수 없습니다."
                        ));

        String groupName = request.groupName().trim();

        // 현재 그룹을 제외한 다른 그룹과 이름이 중복되는지 확인합니다.
        if (contactGroupRepository
                .existsByUserNumAndGroupNameAndGroupNumNot(
                        userNum,
                        groupName,
                        groupNum
                )) {
            throw new IllegalArgumentException(
                    "이미 등록된 그룹 이름입니다."
            );
        }

        contactGroup.update(
                groupName,
                request.conDescription()
        );

        return ContactGroupResponse.from(contactGroup);
    }
    
    /**
     * 로그인한 사용자의 고객 그룹을 삭제합니다.
     */
    @Transactional
    public void delete(
            Long userNum,
            Long groupNum
    ) {
        ContactGroup contactGroup = contactGroupRepository
                .findByGroupNumAndUserNum(groupNum, userNum)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "고객 그룹을 찾을 수 없습니다."
                        ));

        contactGroupRepository.delete(contactGroup);
    }
    
}