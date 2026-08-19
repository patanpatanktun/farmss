package com.farmms.backend.service.chatbot;

import java.util.Arrays;
import java.util.List;
import java.util.Locale;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.farmms.backend.domain.chatbot.ChatbotFaq;
import com.farmms.backend.domain.chatbot.ChatbotFaqRepository;
import com.farmms.backend.dto.chatbot.ChatbotResponse;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ChatbotService {

    private final ChatbotFaqRepository chatbotFaqRepository;

    /**
     * 사용자의 질문을 분석하여
     * DB에 등록된 FAQ 중 가장 알맞은 답변을 반환합니다.
     */
    @Transactional(readOnly = true)
    public ChatbotResponse ask(
            String message
    ) {

        String normalizedMessage =
                normalize(message);

        List<ChatbotFaq> faqList =
                chatbotFaqRepository
                        .findByEnabledTrueOrderByPriorityDescFaqIdAsc();

        for (ChatbotFaq faq : faqList) {

            boolean matched =
                    Arrays.stream(
                                    faq.getKeywords()
                                            .split(",")
                            )
                            .map(this::normalize)
                            .filter(
                                    keyword ->
                                            !keyword.isBlank()
                            )
                            .anyMatch(
                                    normalizedMessage::contains
                            );

            if (matched) {

                return new ChatbotResponse(
                        faq.getAnswer(),
                        faq.getActionType(),
                        faq.getButtonText(),
                        faq.getTargetUrl()
                );
            }
        }

        /*
         * 어떤 키워드에도 매칭되지 않았을 때
         * 기본 답변을 반환합니다.
         */
        return new ChatbotResponse(
                "질문을 정확히 이해하지 못했습니다. "
                        + "상품 등록, 연락처 등록, 이미지 생성, "
                        + "MMS 발송 등의 기능을 물어보실 수 있습니다.",
                "NONE",
                null,
                null
        );
    }

    /**
     * 띄어쓰기나 대소문자가 달라도
     * 같은 질문으로 인식할 수 있도록 정리합니다.
     *
     * 예:
     * "상품 등록 하고 싶어"
     *      ↓
     * "상품등록하고싶어"
     */
    private String normalize(
            String text
    ) {

        if (text == null) {
            return "";
        }

        return text
                .toLowerCase(Locale.KOREAN)
                .replaceAll(
                        "[^0-9a-zA-Z가-힣]",
                        ""
                );
    }
}