package com.farmms.backend.domain.mms;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface MmsHistoryRepository
        extends JpaRepository<MmsHistory, Long> {

    /**
     * 로그인한 회원의 MMS 발송 내역을
     * MMS 번호 최신순으로 조회합니다.
     */
    List<MmsHistory>
    findAllByUserNumOrderByMmsNumDesc(
            Long userNum
    );

    /**
     * MMS 번호와 회원 번호가 모두 일치하는
     * 발송 내역 한 건을 조회합니다.
     */
    Optional<MmsHistory>
    findByMmsNumAndUserNum(
            Long mmsNum,
            Long userNum
    );

    /**
     * 예약 시간이 지났지만 아직 RESERVED 상태인
     * 로그인 회원의 발송 내역을 조회합니다.
     *
     * SOLAPI의 실제 발송 결과를 확인할 때 사용합니다.
     */
    List<MmsHistory>
    findAllByUserNumAndSendStatusAndReserveDateLessThanEqual(
            Long userNum,
            String sendStatus,
            LocalDateTime reserveDate
    );

    /**
     * 전체 회원 중 예약 시간이 지났지만
     * 아직 RESERVED 상태인 발송 내역을 조회합니다.
     *
     * 추후 스케줄러를 이용해 자동으로 상태를
     * 갱신할 때 사용할 수 있습니다.
     */
    List<MmsHistory>
    findAllBySendStatusAndReserveDateLessThanEqual(
            String sendStatus,
            LocalDateTime reserveDate
    );

    /**
     * 특정 생성 이미지가 MMS 발송 내역에
     * 사용됐는지 확인합니다.
     */
    boolean existsByImageId(
            Long imageId
    );

    /**
     * 특정 생성 이미지에 연결된
     * 발송 내역을 최신순으로 조회합니다.
     */
    List<MmsHistory>
    findAllByImageIdOrderByMmsNumDesc(
            Long imageId
    );

    /**
     * 특정 생성 이미지에 연결된
     * MMS 발송 내역을 모두 삭제합니다.
     */
    void deleteAllByImageId(
            Long imageId
    );

    /**
     * 특정 회원의 MMS 발송 내역을
     * 모두 삭제합니다.
     */
    void deleteAllByUserNum(
            Long userNum
    );
}