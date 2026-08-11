package com.farmms.backend.domain.prompt;

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
 * AI 이미지 생성에 사용한 프롬프트 내역입니다.
 */
@Entity
@Table(name = "prompt_history")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class PromptHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "prompt_id")
    private Long promptId;

    /**
     * 프롬프트를 생성한 시각입니다.
     */
    @Column(
            name = "create_day",
            nullable = false
    )
    private LocalDateTime createDay;

    /**
     * AI 이미지 생성에 사용한 전체 프롬프트입니다.
     */
    @Column(
            name = "prompt_text",
            nullable = false,
            columnDefinition = "TEXT"
    )
    private String promptText;

    /**
     * 이미지 생성 시 선택한 고객 번호입니다.
     */
    @Column(
            name = "con_num",
            nullable = false
    )
    private Long conNum;

    /**
     * 프롬프트를 생성한 회원 번호입니다.
     */
    @Column(
            name = "user_num",
            nullable = false
    )
    private Long userNum;

    private PromptHistory(
            Long userNum,
            Long conNum,
            String promptText
    ) {
        this.userNum = userNum;
        this.conNum = conNum;
        this.promptText = promptText;
        this.createDay = LocalDateTime.now();
    }

    /**
     * 새로운 프롬프트 사용 내역을 생성합니다.
     */
    public static PromptHistory create(
            Long userNum,
            Long conNum,
            String promptText
    ) {
        if (userNum == null) {
            throw new IllegalArgumentException(
                    "회원 번호가 필요합니다."
            );
        }

        if (conNum == null) {
            throw new IllegalArgumentException(
                    "고객 번호가 필요합니다."
            );
        }

        if (
                promptText == null ||
                promptText.isBlank()
        ) {
            throw new IllegalArgumentException(
                    "프롬프트는 비어 있을 수 없습니다."
            );
        }

        return new PromptHistory(
                userNum,
                conNum,
                promptText.trim()
        );
    }
}