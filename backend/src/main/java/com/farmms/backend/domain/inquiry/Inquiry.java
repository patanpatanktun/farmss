package com.farmms.backend.domain.inquiry;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 사용자가 작성한 문의사항을 저장하는 엔티티입니다.
 */
@Entity
@Table(name = "inquiry")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Inquiry {

    /**
     * 문의사항 고유 번호입니다.
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "board_num")
    private Long boardNum;

    /**
     * 문의를 작성한 사용자의 로그인 아이디입니다.
     *
     * DB에서 user.user_id를 참조하는 외래키입니다.
     */
    @Column(
            name = "user_id",
            nullable = false,
            length = 100
    )
    private String userId;

    /**
     * 문의 제목입니다.
     */
    @Column(
            name = "title",
            nullable = false,
            length = 200
    )
    private String title;

    /**
     * 문의 내용입니다.
     */
    @Column(
            name = "content",
            nullable = false,
            columnDefinition = "TEXT"
    )
    private String content;

    /**
     * 문의 작성일입니다.
     */
    @Column(
            name = "create_date",
            nullable = false
    )
    private LocalDateTime createDate;

    /**
     * 답변 처리 상태입니다.
     *
     * WAITING  : 답변 대기
     * ANSWERED : 답변 완료
     */
    @Column(
            name = "answer_status",
            nullable = false,
            length = 20
    )
    private String answerStatus;

    /**
     * 운영자가 작성한 답변 내용입니다.
     *
     * 답변 전에는 NULL입니다.
     */
    @Column(
            name = "answer_content",
            columnDefinition = "TEXT"
    )
    private String answerContent;

    private Inquiry(
            String userId,
            String title,
            String content
    ) {
        this.userId = userId;
        this.title = title;
        this.content = content;
        this.answerStatus = "WAITING";
    }

    /**
     * 새로운 문의 엔티티를 생성합니다.
     */
    public static Inquiry create(
            String userId,
            String title,
            String content
    ) {
        return new Inquiry(
                userId,
                title,
                content
        );
    }

    /**
     * 운영자가 문의에 답변합니다.
     */
    public void answer(String answerContent) {
        this.answerContent = answerContent;
        this.answerStatus = "ANSWERED";
    }

    /**
     * 문의가 처음 저장되기 전에
     * 작성일과 기본 답변 상태를 설정합니다.
     */
    @PrePersist
    public void prePersist() {
        if (createDate == null) {
            createDate = LocalDateTime.now();
        }

        if (
                answerStatus == null ||
                answerStatus.isBlank()
        ) {
            answerStatus = "WAITING";
        }
    }
}