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
 * 상품이나 생성 이미지가 삭제돼도 발송 내역을 유지하기 위해
 * 발송 당시 회원 번호, 상품명, 이미지 주소를 별도로 저장합니다.
 */
@Entity
@Table(name = "mms_history")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class MmsHistory {

    @Id
    @GeneratedValue(
            strategy = GenerationType.IDENTITY
    )
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
     * 생성 이미지가 삭제되면 NULL이 될 수 있습니다.
     */
    @Column(
            name = "image_id"
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
     */
    @Column(
            name = "product_name",
            nullable = false,
            length = 100
    )
    private String productName;

    /**
     * 발송 당시 생성 이미지 주소입니다.
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
     * REQUESTED : SOLAPI 요청 전
     * RESERVED  : 예약 발송 대기
     * SUCCESS   : 실제 발송 성공
     * FAILED    : 실제 발송 실패
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
     * Y = 예약 발송
     * N = 즉시 발송
     */
    @Column(
            name = "reserve_flag",
            nullable = false,
            length = 1
    )
    private String reserveFlag;

    /**
     * 예약 발송 시간입니다.
     *
     * 즉시 발송이면 NULL입니다.
     */
    @Column(name = "reserve_date")
    private LocalDateTime reserveDate;

    /**
     * SOLAPI에서 반환받은 그룹 ID입니다.
     *
     * 예약 시간이 지난 후 실제 발송 결과를
     * 조회할 때 사용합니다.
     */
    @Column(
            name = "provider_message_id",
            length = 100
    )
    private String providerMessageId;

    /**
     * MMS 발송 요청 또는 상태가 마지막으로
     * 변경된 시간입니다.
     */
    @Column(
            name = "send_date",
            nullable = false
    )
    private LocalDateTime sendDate;

    /**
     * Entity 생성자입니다.
     */
    private MmsHistory(
            Long userNum,
            Long imageId,
            Long conNum,
            String productName,
            String imageUrl,
            String mmsText,
            String reserveFlag,
            LocalDateTime reserveDate
    ) {
        this.userNum = userNum;
        this.imageId = imageId;
        this.conNum = conNum;
        this.productName = productName;
        this.imageUrl = imageUrl;
        this.mmsText = mmsText;

        /*
         * SOLAPI 요청 전 최초 상태입니다.
         */
        this.sendStatus = "REQUESTED";

        this.reserveFlag =
                normalizeReserveFlag(
                        reserveFlag
                );

        this.reserveDate = reserveDate;

        /*
         * SOLAPI 그룹 ID는 발송 요청이 성공한 뒤
         * 별도 메서드를 통해 저장합니다.
         */
        this.providerMessageId = null;

        this.sendDate =
                LocalDateTime.now();
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
            String reserveFlag,
            LocalDateTime reserveDate
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

        String normalizedReserveFlag =
                normalizeReserveFlag(
                        reserveFlag
                );

        /*
         * 예약 발송이면 예약 시간이 반드시 필요합니다.
         */
        if (
                "Y".equals(normalizedReserveFlag) &&
                reserveDate == null
        ) {
            throw new IllegalArgumentException(
                    "예약 발송인 경우 예약 시간이 필요합니다."
            );
        }

        /*
         * 즉시 발송이면 예약 시간을 저장하지 않습니다.
         */
        if ("N".equals(normalizedReserveFlag)) {
            reserveDate = null;
        }

        return new MmsHistory(
                userNum,
                imageId,
                conNum,
                productName.trim(),
                normalizeImageUrl(imageUrl),
                mmsText.trim(),
                normalizedReserveFlag,
                reserveDate
        );
    }

    /**
     * SOLAPI에서 반환한 그룹 ID를 저장합니다.
     */
    public void updateProviderMessageId(
            String providerMessageId
    ) {
        if (
                providerMessageId == null ||
                providerMessageId.isBlank()
        ) {
            throw new IllegalArgumentException(
                    "SOLAPI 메시지 그룹 ID가 필요합니다."
            );
        }

        this.providerMessageId =
                providerMessageId.trim();
    }

    /**
     * MMS 실제 발송 성공 상태로 변경합니다.
     *
     * 즉시 발송 성공 또는 예약 발송 완료 후
     * SOLAPI에서 성공을 확인했을 때 호출합니다.
     */
    public void markSuccess() {
        this.sendStatus = "SUCCESS";
        this.sendDate = LocalDateTime.now();
    }

    /**
     * MMS 예약 등록 성공 상태로 변경합니다.
     *
     * 아직 실제 발송 성공 상태는 아닙니다.
     */
    public void markReserved() {
        this.sendStatus = "RESERVED";
        this.sendDate = LocalDateTime.now();
    }

    /**
     * MMS 실제 발송 실패 상태로 변경합니다.
     */
    public void markFailed() {
        this.sendStatus = "FAILED";
        this.sendDate = LocalDateTime.now();
    }

    /**
     * 현재 예약 발송 대기 상태인지 확인합니다.
     */
    public boolean isReserved() {
        return "RESERVED".equals(
                this.sendStatus
        );
    }

    /**
     * 예약 시간이 지났는지 확인합니다.
     */
    public boolean isReservationDue(
            LocalDateTime currentDateTime
    ) {
        if (
                currentDateTime == null ||
                reserveDate == null
        ) {
            return false;
        }

        return !reserveDate.isAfter(
                currentDateTime
        );
    }

    /**
     * SOLAPI 발송 결과를 조회할 수 있는지 확인합니다.
     */
    public boolean hasProviderMessageId() {
        return
                providerMessageId != null &&
                !providerMessageId.isBlank();
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
                !"Y".equals(normalized) &&
                !"N".equals(normalized)
        ) {
            throw new IllegalArgumentException(
                    "예약 발송 여부는 Y 또는 N이어야 합니다."
            );
        }

        return normalized;
    }
}