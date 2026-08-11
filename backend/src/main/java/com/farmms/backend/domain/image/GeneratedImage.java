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

    /**
     * 이미지 생성 완료 상태입니다.
     */
    public static final String STATUS_COMPLETED =
            "COMPLETED";

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "image_id")
    private Long imageId;

    /**
     * 홍보 이미지에 사용된 상품 번호입니다.
     */
    @Column(
            name = "pro_num",
            nullable = false
    )
    private Long proNum;

    /**
     * 이미지 생성에 사용된 프롬프트 내역 번호입니다.
     */
    @Column(
            name = "prompt_id",
            nullable = false
    )
    private Long promptId;

    /**
     * 이미지를 생성한 회원 번호입니다.
     */
    @Column(
            name = "user_num",
            nullable = false
    )
    private Long userNum;

    /**
     * 생성된 이미지의 접근 주소입니다.
     */
    @Column(
            name = "image_url",
            nullable = false,
            length = 255
    )
    private String imageUrl;

    /**
     * 이미지 다운로드 횟수입니다.
     */
    @Column(
            name = "download",
            nullable = false
    )
    private Long download;

    /**
     * 이미지 생성 시각입니다.
     */
    @Column(
            name = "create_day",
            nullable = false
    )
    private LocalDateTime createDay;

    /**
     * 이미지 생성 상태입니다.
     *
     * 현재는 이미지 생성이 완료된 후 DB에 저장하므로
     * COMPLETED 상태로 저장합니다.
     */
    @Column(
            name = "status",
            nullable = false,
            length = 20
    )
    private String status;

    private GeneratedImage(
            Long userNum,
            Long proNum,
            Long promptId,
            String imageUrl
    ) {
        this.userNum = userNum;
        this.proNum = proNum;
        this.promptId = promptId;
        this.imageUrl = imageUrl;
        this.download = 0L;
        this.createDay = LocalDateTime.now();
        this.status = STATUS_COMPLETED;
    }

    /**
     * AI 이미지 생성 결과를 저장할 Entity를 생성합니다.
     */
    public static GeneratedImage create(
            Long userNum,
            Long proNum,
            Long promptId,
            String imageUrl
    ) {
        if (userNum == null) {
            throw new IllegalArgumentException(
                    "회원 번호가 필요합니다."
            );
        }

        if (proNum == null) {
            throw new IllegalArgumentException(
                    "상품 번호가 필요합니다."
            );
        }

        if (promptId == null) {
            throw new IllegalArgumentException(
                    "프롬프트 번호가 필요합니다."
            );
        }

        if (
                imageUrl == null ||
                imageUrl.isBlank()
        ) {
            throw new IllegalArgumentException(
                    "생성된 이미지 주소가 필요합니다."
            );
        }

        return new GeneratedImage(
                userNum,
                proNum,
                promptId,
                imageUrl.trim()
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