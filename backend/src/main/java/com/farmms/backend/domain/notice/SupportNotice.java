package com.farmms.backend.domain.notice;

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
 * 외부에서 수집한 정부 지원사업 공고 Entity입니다.
 *
 * support_notice 테이블에 저장된 공고를
 * FarMMS 공지사항 화면에서 조회할 때 사용합니다.
 */
@Entity
@Table(name = "support_notice")
@Getter
@NoArgsConstructor(
        access = AccessLevel.PROTECTED
)
public class SupportNotice {

    /**
     * 공고 번호입니다.
     */
    @Id
    @GeneratedValue(
            strategy = GenerationType.IDENTITY
    )
    @Column(name = "notice_id")
    private Long noticeId;

    /**
     * 외부 공고를 수집한 날짜와 시간입니다.
     */
    @Column(
            name = "crawled_at",
            nullable = false
    )
    private LocalDateTime crawledAt;

    /**
     * 원본 정부 지원사업 공고 주소입니다.
     */
    @Column(
            name = "notice_url",
            nullable = false,
            length = 1000
    )
    private String noticeUrl;

    /**
     * 공고를 제공한 기관 또는 사이트 이름입니다.
     */
    @Column(
            name = "source_name",
            nullable = false,
            length = 150
    )
    private String sourceName;

    /**
     * 공고의 주요 내용을 정리한 요약문입니다.
     */
    @Column(
            name = "summary",
            columnDefinition = "TEXT"
    )
    private String summary;

    /**
     * 정부 지원사업 공고 제목입니다.
     */
    @Column(
            name = "title",
            nullable = false,
            length = 500
    )
    private String title;
}