package com.hrg.agripromomms.domain.mms;

import com.hrg.agripromomms.domain.contact.Contact;
import com.hrg.agripromomms.domain.image.GeneratedImage;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * 수신자 한 명에 대한 문자 발송 결과를 저장합니다.
 * 연락처 3명에게 발송하면 mms_history에는 3행이 생성됩니다.
 */
@Getter
@Entity
@Table(name = "mms_history")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class MmsHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "mms_num")
    private Long mmsNum;

    /**
     * 현재 텍스트 발송 단계에서는 이미지가 없어도 되므로 nullable입니다.
     * 실제 AI 이미지 MMS 기능을 붙이면 generated_image와 연결됩니다.
     */
    @ManyToOne(fetch = FetchType.LAZY, optional = true)
    @JoinColumn(name = "image_num", nullable = true)
    private GeneratedImage generatedImage;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "con_num", nullable = false)
    private Contact contact;

    @Column(name = "send_date", nullable = false)
    private LocalDateTime sendDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "send_status", nullable = false, length = 20)
    private MmsSendStatus sendStatus;

    @Enumerated(EnumType.STRING)
    @Column(name = "reserve_flag", nullable = false, columnDefinition = "CHAR(1)")
    private ReserveFlag reserveFlag;

    /** 발송 요청 시 WAIT 상태의 이력을 생성합니다. */
    public static MmsHistory waiting(
            GeneratedImage image,
            Contact contact,
            LocalDateTime sendDate,
            ReserveFlag reserveFlag) {

        MmsHistory history = new MmsHistory();
        history.generatedImage = image;
        history.contact = contact;
        history.sendDate = sendDate;
        history.sendStatus = MmsSendStatus.WAIT;
        history.reserveFlag = reserveFlag;
        return history;
    }

    /** SOLAPI가 요청을 정상 접수하면 상태를 SUCCESS로 바꿉니다. */
    public void markSuccess() {
        this.sendStatus = MmsSendStatus.SUCCESS;
    }

    /** SOLAPI 요청이 실패하면 상태를 FAIL로 바꿉니다. */
    public void markFail() {
        this.sendStatus = MmsSendStatus.FAIL;
    }
}
