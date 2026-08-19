package com.farmms.backend.domain.chatbot;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface ChatbotFaqRepository
        extends JpaRepository<ChatbotFaq, Long> {

    /**
     * 활성화된 FAQ를 우선순위가 높은 순서로 조회합니다.
     */
    List<ChatbotFaq>
    findByEnabledTrueOrderByPriorityDescFaqIdAsc();
}