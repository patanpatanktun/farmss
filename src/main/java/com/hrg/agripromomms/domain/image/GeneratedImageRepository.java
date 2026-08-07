package com.hrg.agripromomms.domain.image;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

/** generated_image 테이블 저장소입니다. */
public interface GeneratedImageRepository extends JpaRepository<GeneratedImage, Long> {

    @Query("""
        select i from GeneratedImage i
        join fetch i.product
        where i.imageId = :imageId
          and i.user.userNum = :userNum
        """)
    Optional<GeneratedImage> findOwnedImage(
            @Param("imageId") Long imageId,
            @Param("userNum") Long userNum);

    @Query("""
        select i from GeneratedImage i
        join fetch i.product
        where i.user.userNum = :userNum
        order by i.createDay desc
        """)
    List<GeneratedImage> findAllOwnedBy(@Param("userNum") Long userNum);
}
