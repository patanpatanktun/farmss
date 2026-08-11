package com.farmms.backend.domain.prompt;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

/**
 * AI 이미지 생성 프롬프트 내역 Repository입니다.
 */
public interface PromptHistoryRepository
        extends JpaRepository<PromptHistory, Long> {

    /**
     * 로그인한 회원이 사용한 프롬프트를
     * 최신 생성순으로 조회합니다.
     */
    List<PromptHistory>
    findAllByUserNumOrderByCreateDayDesc(
            Long userNum
    );

    /**
     * 특정 고객에게 연결된 프롬프트 내역을 삭제합니다.
     */
    void deleteAllByConNum(Long conNum);

    /**
     * 특정 회원의 전체 프롬프트 내역을 삭제합니다.
     *
     * 회원 탈퇴 처리 시 사용합니다.
     */
    void deleteAllByUserNum(Long userNum);
}