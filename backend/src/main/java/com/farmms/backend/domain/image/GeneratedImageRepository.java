package com.farmms.backend.domain.image;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface GeneratedImageRepository
        extends JpaRepository<GeneratedImage, Long> {

    /**
     * 이미지 번호와 회원 번호가 모두 일치하는
     * 생성 이미지를 조회합니다.
     */
    Optional<GeneratedImage> findByImageIdAndUserNum(
            Long imageId,
            Long userNum
    );

    /**
     * 로그인한 회원이 생성한 이미지를 최신순으로 조회합니다.
     */
    List<GeneratedImage>
    findAllByUserNumOrderByCreateDayDesc(
            Long userNum
    );

    /**
     * 로그인한 회원의 이미지 중
     * 특정 상태의 이미지만 최신순으로 조회합니다.
     *
     * ManageImage에서는 COMPLETED 상태만 조회하여
     * 생성 중인 PENDING / PROCESSING 이미지가
     * 깨진 카드 형태로 노출되지 않도록 사용합니다.
     */
    List<GeneratedImage>
    findAllByUserNumAndStatusOrderByCreateDayDesc(
            Long userNum,
            String status
    );

    /**
     * 특정 상품으로 생성한 이미지를 최신순으로 조회합니다.
     */
    List<GeneratedImage>
    findAllByProNumOrderByCreateDayDesc(
            Long proNum
    );

    /**
     * 특정 상품으로 생성한 이미지가 존재하는지 확인합니다.
     */
    boolean existsByProNum(Long proNum);

    /**
     * 로그인한 회원이 생성한 전체 이미지 수를 조회합니다.
     */
    long countByUserNum(Long userNum);

    /**
     * 로그인한 회원이 생성한 이미지의
     * 전체 다운로드 횟수를 합산합니다.
     */
    @Query("""
            SELECT COALESCE(
                    SUM(image.download),
                    0
            )
            FROM GeneratedImage image
            WHERE image.userNum = :userNum
            """)
    long sumDownloadByUserNum(
            @Param("userNum") Long userNum
    );
}