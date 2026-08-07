package com.hrg.agripromomms.domain.prompt;

import org.springframework.data.jpa.repository.JpaRepository;

/** prompt_history 테이블 저장소입니다. */
public interface PromptHistoryRepository extends JpaRepository<PromptHistory, Long> {
}
