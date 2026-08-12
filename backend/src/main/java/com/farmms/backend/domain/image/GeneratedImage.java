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

    /**
     * 생성 이미지 번호입니다.
     */
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
     *
     * 일반 이미지 생성뿐만 아니라
     * 이미지 재생성 시에도 새로운 프롬프트 이력 번호를
     * 저장할 수 있습니다.
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

    /**
     * GeneratedImage 내부 생성자입니다.
     */
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

        /*
         * 새 이미지이므로 다운로드 횟수는 0부터 시작합니다.
         */
        this.download = 0L;

        /*
         * 이미지가 생성된 현재 시간을 저장합니다.
         */
        this.createDay =
                LocalDateTime.now();

        /*
         * 현재는 이미지 생성이 완료된 뒤
         * Entity를 저장하기 때문에 COMPLETED 상태입니다.
         */
        this.status =
                STATUS_COMPLETED;
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

        /*
         * 회원 번호 검증
         */
        if (userNum == null) {

            throw new IllegalArgumentException(
                    "회원 번호가 필요합니다."
            );
        }

        /*
         * 상품 번호 검증
         */
        if (proNum == null) {

            throw new IllegalArgumentException(
                    "상품 번호가 필요합니다."
            );
        }

        /*
         * 프롬프트 이력 번호 검증
         */
        if (promptId == null) {

            throw new IllegalArgumentException(
                    "프롬프트 번호가 필요합니다."
            );
        }

        /*
         * 생성된 이미지 주소 검증
         */
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
     * 기존 이미지를 기반으로 재생성한 이미지 결과를
     * 저장할 Entity를 생성합니다.
     *
     * 기존 이미지를 수정해서 덮어쓰는 방식이 아니라
     * 새로운 generated_image 행으로 저장합니다.
     *
     * 예:
     *
     * 원본
     * image_id = 10
     * prompt_id = 5
     *
     * 재생성
     * image_id = 11
     * prompt_id = 6
     *
     * 원본 이미지는 그대로 보존됩니다.
     */
    public static GeneratedImage createRegenerated(
            Long userNum,
            Long proNum,
            Long promptId,
            String imageUrl
    ) {

        /*
         * 재생성 이미지도 GeneratedImage이므로
         * 기존 create()의 검증 및 생성 로직을
         * 그대로 재사용합니다.
         */
        return create(
                userNum,
                proNum,
                promptId,
                imageUrl
        );
    }

    /**
     * 사용자가 이미지를 다운로드하면
     * 다운로드 횟수를 1 증가시킵니다.
     */
    public void increaseDownload() {

        if (download == null) {

            download = 0L;
        }

        download++;
    }
}