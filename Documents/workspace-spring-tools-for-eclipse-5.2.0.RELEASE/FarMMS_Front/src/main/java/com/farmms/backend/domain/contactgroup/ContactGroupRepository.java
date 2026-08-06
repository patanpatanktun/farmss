package com.farmms.backend.domain.contactgroup;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface ContactGroupRepository
        extends JpaRepository<ContactGroup, Long> {

    /**
     * 로그인한 사용자의 그룹 목록을 최신순으로 조회합니다.
     */
    List<ContactGroup> findAllByUserNumOrderByGroupNumDesc(
            Long userNum
    );

    /**
     * 그룹 번호와 회원 번호가 모두 일치하는 그룹을 조회합니다.
     */
    Optional<ContactGroup> findByGroupNumAndUserNum(
            Long groupNum,
            Long userNum
    );

    /**
     * 같은 사용자가 동일한 그룹 이름을 사용하고 있는지 확인합니다.
     */
    boolean existsByUserNumAndGroupName(
            Long userNum,
            String groupName
    );

    /**
     * 그룹 수정 시 현재 그룹을 제외하고 이름 중복을 확인합니다.
     */
    boolean existsByUserNumAndGroupNameAndGroupNumNot(
            Long userNum,
            String groupName,
            Long groupNum
    );
}