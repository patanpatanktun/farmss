package com.hrg.agripromomms.domain.mms;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

/** mms_history 테이블 저장소입니다. */
public interface MmsHistoryRepository extends JpaRepository<MmsHistory, Long> {

    /** 이미지가 없는 문자 이력도 조회할 수 있도록 left join fetch를 사용합니다. */
    @Query("""
        select m from MmsHistory m
        join fetch m.contact c
        left join fetch m.generatedImage i
        where c.user.userNum = :userNum
        order by m.sendDate desc, m.mmsNum desc
        """)
    List<MmsHistory> findAllOwnedBy(@Param("userNum") Long userNum);

    /** 특정 판매업자 소유의 문자 이력 한 건을 조회합니다. */
    @Query("""
        select m from MmsHistory m
        join fetch m.contact c
        left join fetch m.generatedImage i
        where m.mmsNum = :mmsNum
          and c.user.userNum = :userNum
        """)
    Optional<MmsHistory> findOwnedHistory(
            @Param("mmsNum") Long mmsNum,
            @Param("userNum") Long userNum);
}
