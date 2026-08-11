package com.farmms.backend.domain.mms;

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
 * 고객 한 명에게 발송한 MMS 이력을 저장하는 Entity입니다.
 *
 * 상품이나 생성 이미지가 삭제되더라도 발송 내역을 유지하기 위해
 * 발송 당시 회원 번호, 상품명, 이미지 주소를 별도로 저장합니다.
 */
@Entity
@Table(name = "mms_history")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class MmsHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "mms_num")
    private Long mmsNum;

    /**
     * MMS를 발송한 회원 번호입니다.
     */
    @Column(
            name = "user_num",
            nullable = false
    )
    private Long userNum;

    /**
     * MMS에 첨부한 생성 이미지 번호입니다.
     *
     * 생성 이미지가 삭제되면 DB의 ON DELETE SET NULL 설정에 의해
     * 이 값만 NULL로 변경되고 발송 내역은 유지됩니다.
     */
    @Column(
            name = "image_id",
            nullable = true
    )
    private Long imageId;

    /**
     * MMS를 수신한 고객 번호입니다.
     */
    @Column(
            name = "con_num",
            nullable = false
    )
    private Long conNum;

    /**
     * 발송 당시 상품명입니다.
     *
     * 원본 상품이 삭제되더라도 발송 내역 화면에서
     * 당시 상품명을 표시하기 위해 별도로 저장합니다.
     */
    @Column(
            name = "product_name",
            nullable = false,
            length = 100
    )
    private String productName;

    /**
     * 발송 당시 생성 이미지 주소입니다.
     *
     * 생성 이미지 정보가 삭제된 이후에도
     * 발송 당시 사용한 이미지 주소를 기록으로 보관합니다.
     */
    @Column(
            name = "image_url",
            length = 255
    )
    private String imageUrl;

    /**
     * MMS로 발송한 문자 내용입니다.
     */
    @Column(
            name = "mms_text",
            nullable = false,
            columnDefinition = "TEXT"
    )
    private String mmsText;

    /**
     * MMS 발송 처리 상태입니다.
     *
     * REQUESTED, SUCCESS, FAILED 등의 값을 저장합니다.
     */
    @Column(
            name = "send_status",
            nullable = false,
            length = 20
    )
    private String sendStatus;

    /**
     * 예약 발송 여부입니다.
     *
     * Y는 예약 발송, N은 즉시 발송입니다.
     */
    @Column(
            name = "reserve_flag",
            nullable = false,
            length = 1
    )
    private String reserveFlag;

    /**
     * MMS 발송 처리 시각입니다.
     */
    @Column(
            name = "send_date",
            nullable = false
    )
    private LocalDateTime sendDate;

    private MmsHistory(
            Long userNum,
            Long imageId,
            Long conNum,
            String productName,
            String imageUrl,
            String mmsText,
            String reserveFlag
    ) {
        this.userNum = userNum;
        this.imageId = imageId;
        this.conNum = conNum;
        this.productName = productName;
        this.imageUrl = imageUrl;
        this.mmsText = mmsText;
        this.sendStatus = "REQUESTED";
        this.reserveFlag =
                normalizeReserveFlag(reserveFlag);
        this.sendDate = LocalDateTime.now();
    }

    /**
     * 고객 한 명에게 발송할 MMS 이력을 생성합니다.
     */
    public static MmsHistory create(
            Long userNum,
            Long imageId,
            Long conNum,
            String productName,
            String imageUrl,
            String mmsText,
            String reserveFlag
    ) {
        if (userNum == null) {
            throw new IllegalArgumentException(
                    "발송 회원 번호가 필요합니다."
            );
        }

        if (imageId == null) {
            throw new IllegalArgumentException(
                    "발송 이미지 번호가 필요합니다."
            );
        }

        if (conNum == null) {
            throw new IllegalArgumentException(
                    "수신 고객 번호가 필요합니다."
            );
        }

        if (
                productName == null ||
                productName.isBlank()
        ) {
            throw new IllegalArgumentException(
                    "발송 상품명이 필요합니다."
            );
        }

        if (
                mmsText == null ||
                mmsText.isBlank()
        ) {
            throw new IllegalArgumentException(
                    "MMS 내용은 비어 있을 수 없습니다."
            );
        }

        return new MmsHistory(
                userNum,
                imageId,
                conNum,
                productName.trim(),
                normalizeImageUrl(imageUrl),
                mmsText.trim(),
                reserveFlag
        );
    }

    /**
     * MMS 발송 성공 상태로 변경합니다.
     */
    public void markSuccess() {
        this.sendStatus = "SUCCESS";
        this.sendDate = LocalDateTime.now();
    }

    /**
     * MMS 발송 실패 상태로 변경합니다.
     */
    public void markFailed() {
        this.sendStatus = "FAILED";
        this.sendDate = LocalDateTime.now();
    }

    /**
     * 이미지 주소를 정리합니다.
     */
    private static String normalizeImageUrl(
            String imageUrl
    ) {
        if (
                imageUrl == null ||
                imageUrl.isBlank()
        ) {
            return null;
        }

        return imageUrl.trim();
    }

    /**
     * 예약 발송 값을 Y 또는 N으로 정리합니다.
     */
    private static String normalizeReserveFlag(
            String reserveFlag
    ) {
        if (
                reserveFlag == null ||
                reserveFlag.isBlank()
        ) {
            return "N";
        }

        String normalized =
                reserveFlag
                        .trim()
                        .toUpperCase();

        if (
                !normalized.equals("Y") &&
                !normalized.equals("N")
        ) {
            throw new IllegalArgumentException(
                    "예약 발송 여부는 Y 또는 N이어야 합니다."
            );
        }

        return normalized;
    }
}