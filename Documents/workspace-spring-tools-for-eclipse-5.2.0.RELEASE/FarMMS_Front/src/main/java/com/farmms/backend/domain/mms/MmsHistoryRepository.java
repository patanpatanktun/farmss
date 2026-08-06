package com.farmms.backend.domain.mms;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface MmsHistoryRepository
        extends JpaRepository<MmsHistory, Long> {

    /**
     * 로그인한 회원의 MMS 발송 이력을
     * MMS 번호 최신순으로 조회합니다.
     */
    @Query("""
            SELECT history
            FROM MmsHistory history,
                 GeneratedImage image,
                 Product product
            WHERE history.imageId = image.imageId
              AND image.proNum = product.proNum
              AND product.userNum = :userNum
            ORDER BY history.mmsNum DESC
            """)
    List<MmsHistory> findAllByUserNumOrderByMmsNumDesc(
            @Param("userNum") Long userNum
    );

    /**
     * MMS 번호와 회원 번호를 함께 확인하여
     * 로그인한 회원이 소유한 발송 이력만 조회합니다.
     */
    @Query("""
            SELECT history
            FROM MmsHistory history,
                 GeneratedImage image,
                 Product product
            WHERE history.imageId = image.imageId
              AND image.proNum = product.proNum
              AND history.mmsNum = :mmsNum
              AND product.userNum = :userNum
            """)
    Optional<MmsHistory> findByMmsNumAndUserNum(
            @Param("mmsNum") Long mmsNum,
            @Param("userNum") Long userNum
    );
}