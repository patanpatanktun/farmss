package com.hrg.agripromomms.domain.contact;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.List;

/** contact 테이블에 접근하는 저장소입니다. */
public interface ContactRepository extends JpaRepository<Contact, Long> {

    @Query("""
        select c from Contact c
        where c.user.userNum = :userNum
        order by c.conNum asc
        """)
    List<Contact> findAllOwnedBy(@Param("userNum") Long userNum);

    @Query("""
        select c from Contact c
        where c.user.userNum = :userNum
          and c.conNum in :contactNums
        """)
    List<Contact> findOwnedContacts(
            @Param("userNum") Long userNum,
            @Param("contactNums") Collection<Long> contactNums);
}
