package com.hrg.agripromomms.domain.group;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

/** contact_group 테이블 저장소입니다. */
public interface ContactGroupRepository extends JpaRepository<ContactGroup, Long> {
    List<ContactGroup> findAllByUserUserNumOrderByGroupNumAsc(Long userNum);
}
