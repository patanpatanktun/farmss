package com.farmms.backend.domain.mms;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface MmsHistoryRepository
        extends JpaRepository<MmsHistory, Long> {

    /**
     * 로그인한 회원의 MMS 발송 내역을
     * MMS 번호 최신순으로 조회합니다.
     *
     * 상품이나 생성 이미지가 삭제돼도
     * mms_history의 user_num을 기준으로 조회할 수 있습니다.
     */
    List<MmsHistory> findAllByUserNumOrderByMmsNumDesc(
            Long userNum
    );

    /**
     * MMS 번호와 회원 번호가 모두 일치하는
     * 발송 내역 한 건을 조회합니다.
     */
    Optional<MmsHistory> findByMmsNumAndUserNum(
            Long mmsNum,
            Long userNum
    );

    /**
     * 특정 생성 이미지가 MMS 발송 내역에
     * 사용됐는지 확인합니다.
     */
    boolean existsByImageId(Long imageId);

    /**
     * 특정 생성 이미지에 연결된 발송 내역을 조회합니다.
     */
    List<MmsHistory> findAllByImageIdOrderByMmsNumDesc(
            Long imageId
    );

    /**
     * 특정 생성 이미지에 연결된 MMS 발송 내역을 삭제합니다.
     */
    void deleteAllByImageId(Long imageId);

    /**
     * 특정 회원의 MMS 발송 내역을 모두 삭제합니다.
     */
    void deleteAllByUserNum(Long userNum);
}