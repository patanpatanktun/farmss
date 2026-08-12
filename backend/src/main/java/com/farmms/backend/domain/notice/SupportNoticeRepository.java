package com.farmms.backend.domain.notice;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

/**
 * 정부 지원사업 공고를 조회하는 Repository입니다.
 */
public interface SupportNoticeRepository
extends JpaRepository<SupportNotice, Long> {

    /**
     * 정부 지원사업 공고를 검색합니다.
     *
     * 검색어가 없으면 전체 공고를 조회합니다.
     *
     * 검색어가 있으면 다음 항목 중 하나에
     * 검색어가 포함된 공고를 조회합니다.
     *
     * - 공고 제목
     * - 출처명
     * - 공고 요약
     *
     * 최신 수집 공고가 먼저 표시됩니다.
     */
    @Query("""
            SELECT notice
            FROM SupportNotice notice
            WHERE (
                    :keyword IS NULL
                    OR LOWER(notice.title)
                        LIKE LOWER(
                            CONCAT(
                                '%',
                                :keyword,
                                '%'
                            )
                        )
                    OR LOWER(notice.sourceName)
                        LIKE LOWER(
                            CONCAT(
                                '%',
                                :keyword,
                                '%'
                            )
                        )
                    OR LOWER(
                            COALESCE(
                                notice.summary,
                                ''
                            )
                        )
                        LIKE LOWER(
                            CONCAT(
                                '%',
                                :keyword,
                                '%'
                            )
                        )
            )
            ORDER BY
                notice.crawledAt DESC,
                notice.noticeId DESC
            """)
    List<SupportNotice> search(
            @Param("keyword")
            String keyword
    );

    /**
     * 전체 정부 지원사업 공고를
     * 최신 수집순으로 조회합니다.
     */
    List<SupportNotice>
    findAllByOrderByCrawledAtDescNoticeIdDesc();
}