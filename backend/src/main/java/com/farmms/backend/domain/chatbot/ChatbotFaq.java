package com.farmms.backend.domain.chatbot;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "chatbot_faq")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class ChatbotFaq {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "faq_id")
    private Long faqId;

    /**
     * 해당 답변을 선택할 때 사용할 키워드입니다.
     *
     * 예:
     * 상품등록,상품 등록,제품등록
     */
    @Column(
            name = "keywords",
            nullable = false,
            length = 500
    )
    private String keywords;

    /**
     * 사용자에게 보여줄 챗봇 답변입니다.
     */
    @Column(
            name = "answer",
            nullable = false,
            length = 500
    )
    private String answer;

    /**
     * NONE      : 답변만 표시
     * MOVE_PAGE : 페이지 이동 버튼 표시
     */
    @Column(
            name = "action_type",
            nullable = false,
            length = 30
    )
    private String actionType;

    /**
     * 페이지 이동 버튼에 표시할 문구입니다.
     */
    @Column(
            name = "button_text",
            length = 100
    )
    private String buttonText;

    /**
     * React에서 이동할 페이지 주소입니다.
     */
    @Column(
            name = "target_url",
            length = 255
    )
    private String targetUrl;

    /**
     * 여러 FAQ가 동시에 매칭됐을 때
     * 높은 우선순위부터 검사합니다.
     */
    @Column(
            name = "priority",
            nullable = false
    )
    private Integer priority;

    /**
     * 챗봇에서 사용할 FAQ인지 여부입니다.
     */
    @Column(
            name = "enabled",
            nullable = false
    )
    private Boolean enabled;
}