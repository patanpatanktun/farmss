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
     * 이미지 생성 요청이 접수된 상태입니다.
     *
     * 아직 실제 OpenAI 이미지 생성은
     * 시작되지 않았을 수 있습니다.
     */
    public static final String STATUS_PENDING =
            "PENDING";

    /**
     * 백그라운드에서 실제 이미지 생성이
     * 진행 중인 상태입니다.
     */
    public static final String STATUS_PROCESSING =
            "PROCESSING";

    /**
     * 이미지 생성이 정상적으로
     * 완료된 상태입니다.
     */
    public static final String STATUS_COMPLETED =
            "COMPLETED";

    /**
     * 이미지 생성 중 오류가 발생한 상태입니다.
     */
    public static final String STATUS_FAILED =
            "FAILED";


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
     * 이미지 생성에 사용된
     * 프롬프트 이력 번호입니다.
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
     *
     * 비동기 생성 중에는 이미지가 아직 없으므로
     * NULL일 수 있습니다.
     */
    @Column(
            name = "image_url",
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
     * 이미지 생성 요청 시각입니다.
     */
    @Column(
            name = "create_day",
            nullable = false
    )
    private LocalDateTime createDay;


    /**
     * 현재 이미지 생성 상태입니다.
     *
     * PENDING
     * PROCESSING
     * COMPLETED
     * FAILED
     */
    @Column(
            name = "status",
            nullable = false,
            length = 20
    )
    private String status;


    /**
     * 이미지 생성 실패 시
     * 오류 내용을 저장합니다.
     *
     * 정상 상태에서는 NULL입니다.
     */
    @Column(
            name = "error_message",
            length = 500
    )
    private String errorMessage;


    /**
     * 내부 생성자입니다.
     */
    private GeneratedImage(
            Long userNum,
            Long proNum,
            Long promptId,
            String imageUrl,
            String status
    ) {

        this.userNum =
                userNum;

        this.proNum =
                proNum;

        this.promptId =
                promptId;

        this.imageUrl =
                imageUrl;

        /*
         * 새 이미지이므로 다운로드 횟수는
         * 0부터 시작합니다.
         */
        this.download =
                0L;

        /*
         * 이미지 생성 요청 시간을 저장합니다.
         */
        this.createDay =
                LocalDateTime.now();

        this.status =
                status;

        this.errorMessage =
                null;
    }


    /**
     * 이미지 생성이 이미 완료된 상태의
     * GeneratedImage를 생성합니다.
     *
     * 기존 이미지 재생성 기능에서도
     * 계속 사용할 수 있습니다.
     */
    public static GeneratedImage create(
            Long userNum,
            Long proNum,
            Long promptId,
            String imageUrl
    ) {

        validateBase(
                userNum,
                proNum,
                promptId
        );

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
                imageUrl.trim(),
                STATUS_COMPLETED
        );
    }


    /**
     * 비동기 이미지 생성 요청을
     * PENDING 상태로 먼저 저장합니다.
     *
     * 이 시점에서는 아직 이미지가 생성되지 않았기 때문에
     * imageUrl은 NULL입니다.
     */
    public static GeneratedImage createPending(
            Long userNum,
            Long proNum,
            Long promptId
    ) {

        validateBase(
                userNum,
                proNum,
                promptId
        );

        return new GeneratedImage(
                userNum,
                proNum,
                promptId,
                null,
                STATUS_PENDING
        );
    }


    /**
     * 기존 이미지를 기반으로
     * 재생성한 이미지입니다.
     *
     * 현재 재생성 기능은 기존 동기 방식을
     * 그대로 유지하므로 create()를 사용합니다.
     */
    public static GeneratedImage createRegenerated(
            Long userNum,
            Long proNum,
            Long promptId,
            String imageUrl
    ) {

        return create(
                userNum,
                proNum,
                promptId,
                imageUrl
        );
    }


    /**
     * 실제 백그라운드 이미지 생성이
     * 시작된 상태로 변경합니다.
     *
     * PENDING → PROCESSING
     */
    public void markProcessing() {

        this.status =
                STATUS_PROCESSING;

        this.errorMessage =
                null;
    }


    /**
     * 이미지 생성이 성공하면
     * 최종 이미지 URL을 저장하고
     * 완료 상태로 변경합니다.
     *
     * PROCESSING → COMPLETED
     */
    public void markCompleted(
            String imageUrl
    ) {

        if (
                imageUrl == null ||
                imageUrl.isBlank()
        ) {

            throw new IllegalArgumentException(
                    "완료된 이미지 주소가 필요합니다."
            );
        }

        this.imageUrl =
                imageUrl.trim();

        this.status =
                STATUS_COMPLETED;

        this.errorMessage =
                null;
    }


    /**
     * 이미지 생성 중 오류가 발생하면
     * FAILED 상태와 오류 메시지를 저장합니다.
     *
     * PROCESSING → FAILED
     */
    public void markFailed(
            String errorMessage
    ) {

        this.status =
                STATUS_FAILED;

        /*
         * 오류 메시지가 없을 경우
         * 기본 메시지를 저장합니다.
         */
        if (
                errorMessage == null ||
                errorMessage.isBlank()
        ) {

            this.errorMessage =
                    "이미지 생성 중 오류가 발생했습니다.";

            return;
        }


        String normalizedMessage =
                errorMessage.trim();


        /*
         * DB 컬럼이 VARCHAR(500)이므로
         * 너무 긴 오류 메시지는 500자로 제한합니다.
         */
        if (
                normalizedMessage.length() > 500
        ) {

            normalizedMessage =
                    normalizedMessage.substring(
                            0,
                            500
                    );
        }


        this.errorMessage =
                normalizedMessage;
    }


    /**
     * 이미지 생성이 완료되었는지 확인합니다.
     *
     * 다운로드나 재생성 전에 사용할 수 있습니다.
     */
    public boolean isCompleted() {

        return STATUS_COMPLETED.equals(
                this.status
        );
    }


    /**
     * 현재 이미지가 생성 중인지 확인합니다.
     *
     * 삭제 등의 작업을 제한할 때 사용합니다.
     */
    public boolean isGenerating() {

        return STATUS_PENDING.equals(
                this.status
        )
                ||
                STATUS_PROCESSING.equals(
                        this.status
                );
    }


    /**
     * 사용자가 이미지를 다운로드하면
     * 다운로드 횟수를 1 증가시킵니다.
     */
    public void increaseDownload() {

        if (download == null) {

            download =
                    0L;
        }

        download++;
    }


    /**
     * GeneratedImage 생성에 필요한
     * 공통 값을 검증합니다.
     */
    private static void validateBase(
            Long userNum,
            Long proNum,
            Long promptId
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
    }
}