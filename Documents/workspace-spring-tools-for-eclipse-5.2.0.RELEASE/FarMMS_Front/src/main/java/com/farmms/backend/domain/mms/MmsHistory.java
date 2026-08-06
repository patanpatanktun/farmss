package com.farmms.backend.domain.mms;

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
 * MMS 일괄 발송 이력을 저장하는 Entity입니다.
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
     * MMS에 첨부한 generated_image의 image_id입니다.
     */
    @Column(name = "image_id", nullable = false)
    private Long imageId;

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
     * REQUESTED, SUCCESS, FAILED 등의 발송 상태입니다.
     */
    @Column(
            name = "send_status",
            nullable = false,
            length = 20
    )
    private String sendStatus;

    /**
     * 예약 발송 여부이며 Y 또는 N을 저장합니다.
     */
    @Column(
            name = "reserve_flag",
            nullable = false,
            length = 1
    )
    private String reserveFlag;

    private MmsHistory(
            Long imageId,
            String mmsText,
            String reserveFlag
    ) {
        this.imageId = imageId;
        this.mmsText = mmsText;
        this.sendStatus = "REQUESTED";
        this.reserveFlag = normalizeReserveFlag(
                reserveFlag
        );
    }

    /**
     * MMS 발송 이력을 생성합니다.
     */
    public static MmsHistory create(
            Long imageId,
            String mmsText,
            String reserveFlag
    ) {
        if (mmsText == null || mmsText.isBlank()) {
            throw new IllegalArgumentException(
                    "MMS 내용은 비어 있을 수 없습니다."
            );
        }

        return new MmsHistory(
                imageId,
                mmsText.trim(),
                reserveFlag
        );
    }

    /**
     * MMS 발송 성공 상태로 변경합니다.
     */
    public void markSuccess() {
        this.sendStatus = "SUCCESS";
    }

    /**
     * MMS 발송 실패 상태로 변경합니다.
     */
    public void markFailed() {
        this.sendStatus = "FAILED";
    }
    
    /**
     * 일부 고객에게만 발송된 상태로 변경합니다.
     */
    public void markPartialFailed() {
        this.sendStatus = "PARTIAL_FAILED";
    }

    /**
     * 예약 발송 값이 없으면 즉시 발송인 N으로 처리합니다.
     */
    private static String normalizeReserveFlag(
            String reserveFlag
    ) {
        if (reserveFlag == null || reserveFlag.isBlank()) {
            return "N";
        }

        String normalized =
                reserveFlag.trim().toUpperCase();

        if (!normalized.equals("Y")
                && !normalized.equals("N")) {
            throw new IllegalArgumentException(
                    "예약 발송 여부는 Y 또는 N이어야 합니다."
            );
        }

        return normalized;
    }
}