package com.farmms.backend.domain.image;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface GeneratedImageRepository
        extends JpaRepository<GeneratedImage, Long> {

    /**
     * 이미지와 상품 테이블을 연결하여
     * 로그인한 회원이 소유한 이미지만 조회합니다.
     */
    @Query("""
            SELECT image
            FROM GeneratedImage image, Product product
            WHERE image.proNum = product.proNum
              AND image.imageId = :imageId
              AND product.userNum = :userNum
            """)
    Optional<GeneratedImage> findByImageIdAndUserNum(
            @Param("imageId") Long imageId,
            @Param("userNum") Long userNum
    );

    /**
     * 로그인한 회원이 생성한 이미지를 최신순으로 조회합니다.
     */
    @Query("""
            SELECT image
            FROM GeneratedImage image, Product product
            WHERE image.proNum = product.proNum
              AND product.userNum = :userNum
            ORDER BY image.createDay DESC
            """)
    List<GeneratedImage> findAllByUserNumOrderByCreateDayDesc(
            @Param("userNum") Long userNum
    );

    /**
     * 로그인한 회원이 생성한 전체 이미지 수를 조회합니다.
     */
    @Query("""
            SELECT COUNT(image)
            FROM GeneratedImage image, Product product
            WHERE image.proNum = product.proNum
              AND product.userNum = :userNum
            """)
    long countByUserNum(
            @Param("userNum") Long userNum
    );

    /**
     * 로그인한 회원이 생성한 이미지의
     * 전체 다운로드 횟수를 합산합니다.
     */
    @Query("""
            SELECT COALESCE(SUM(image.download), 0)
            FROM GeneratedImage image, Product product
            WHERE image.proNum = product.proNum
              AND product.userNum = :userNum
            """)
    long sumDownloadByUserNum(
            @Param("userNum") Long userNum
    );
}