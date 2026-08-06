package com.farmms.backend.domain.image;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * AI로 생성한 농자재 홍보 이미지 Entity입니다.
 */
@Entity
@Table(name = "generated_image")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class GeneratedImage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "image_id")
    private Long imageId;

    /**
     * 홍보 이미지에 사용된 상품 번호입니다.
     */
    @Column(name = "pro_num", nullable = false)
    private Long proNum;

    @Column(
            name = "image_url",
            nullable = false,
            length = 255
    )
    private String imageUrl;

    /**
     * 이미지 다운로드 횟수입니다.
     */
    @Column(name = "download", nullable = false)
    private Long download;

    @Column(name = "create_day", nullable = false)
    private LocalDateTime createDay;

    private GeneratedImage(
            Long proNum,
            String imageUrl
    ) {
        this.proNum = proNum;
        this.imageUrl = imageUrl;
        this.download = 0L;
        this.createDay = LocalDateTime.now();
    }

    /**
     * AI 이미지 생성 결과를 저장할 Entity를 생성합니다.
     */
    public static GeneratedImage create(
            Long proNum,
            String imageUrl
    ) {
        return new GeneratedImage(
                proNum,
                imageUrl
        );
    }

    /**
     * 사용자가 이미지를 다운로드하면 횟수를 1 증가시킵니다.
     */
    public void increaseDownload() {

        if (download == null) {
            download = 0L;
        }

        download++;
    }
}