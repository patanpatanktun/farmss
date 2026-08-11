package com.farmms.backend.domain.contact;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ContactRepository
        extends JpaRepository<Contact, Long> {

    /**
     * 로그인한 사용자가 등록한 전체 고객을 최신순으로 조회합니다.
     */
    List<Contact> findAllByUserNumOrderByConNumDesc(
            Long userNum
    );

    /**
     * 고객 번호와 회원 번호가 모두 일치하는 고객을 조회합니다.
     */
    Optional<Contact> findByConNumAndUserNum(
            Long conNum,
            Long userNum
    );

    /**
     * 같은 회원에게 동일한 전화번호가 등록되어 있는지 확인합니다.
     */
    boolean existsByUserNumAndPhone(
            Long userNum,
            String phone
    );

    /**
     * 고객 수정 시 현재 고객을 제외하고
     * 동일한 전화번호가 등록되어 있는지 확인합니다.
     */
    boolean existsByUserNumAndPhoneAndConNumNot(
            Long userNum,
            String phone,
            Long conNum
    );

    /**
     * MMS 발송 대상으로 선택한 고객들을 조회합니다.
     */
    List<Contact> findAllByUserNumAndConNumIn(
            Long userNum,
            Collection<Long> conNums
    );

    /**
     * 지역 또는 재배작물에 검색어가 포함된 고객을 조회합니다.
     *
     * 예:
     * 지역: "전남 나주시, 전남 담양군"
     * 검색어: "나주"
     * 결과: 해당 고객 조회
     *
     * 재배작물: "배, 벼"
     * 검색어: "벼"
     * 결과: 해당 고객 조회
     */
    @Query("""
            SELECT DISTINCT c
            FROM Contact c
            LEFT JOIN c.crops crop
            WHERE c.userNum = :userNum
              AND (
                    :region IS NULL
                    OR LOWER(c.region) LIKE LOWER(
                        CONCAT('%', :region, '%')
                    )
              )
              AND (
                    :crop IS NULL
                    OR LOWER(crop) LIKE LOWER(
                        CONCAT('%', :crop, '%')
                    )
              )
            ORDER BY c.conNum DESC
            """)
    List<Contact> search(
            @Param("userNum") Long userNum,
            @Param("region") String region,
            @Param("crop") String crop
    );

    /**
     * 로그인한 회원이 등록한 고객 수를 조회합니다.
     */
    long countByUserNum(Long userNum);

    /**
     * 특정 그룹에 포함된 고객 목록을 조회합니다.
     */
    List<Contact> findAllByUserNumAndGroupNum(
            Long userNum,
            Long groupNum
    );
}