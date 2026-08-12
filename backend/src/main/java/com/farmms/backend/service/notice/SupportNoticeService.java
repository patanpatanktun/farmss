package com.farmms.backend.service.notice;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.farmms.backend.domain.notice.SupportNotice;
import com.farmms.backend.domain.notice.SupportNoticeRepository;
import com.farmms.backend.dto.notice.SupportNoticeResponse;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;

/**
 * 정부 지원사업 공고 조회 및
 * 검색 기능을 처리하는 Service입니다.
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class SupportNoticeService {

    private final SupportNoticeRepository
            supportNoticeRepository;

    /**
     * 정부 지원사업 공고 목록을 조회합니다.
     *
     * 검색어가 없으면 전체 공고를 조회하고,
     * 검색어가 있으면 제목, 출처명, 요약을
     * 기준으로 검색합니다.
     */
    public List<SupportNoticeResponse> search(
            String keyword
    ) {
        String normalizedKeyword =
                normalizeKeyword(keyword);

        return supportNoticeRepository
                .search(normalizedKeyword)
                .stream()
                .map(
                        SupportNoticeResponse::from
                )
                .toList();
    }

    /**
     * 공고 번호로 정부 지원사업 공고
     * 한 건을 조회합니다.
     */
    public SupportNoticeResponse findOne(
            Long noticeId
    ) {
        if (noticeId == null) {
            throw new IllegalArgumentException(
                    "공고 번호가 필요합니다."
            );
        }

        SupportNotice notice =
                supportNoticeRepository
                        .findById(noticeId)
                        .orElseThrow(() ->
                                new EntityNotFoundException(
                                        "정부 지원사업 공고를 찾을 수 없습니다."
                                )
                        );

        return SupportNoticeResponse.from(
                notice
        );
    }

    /**
     * 검색어가 null이거나 공백인 경우
     * 검색 조건이 없는 상태로 변환합니다.
     */
    private String normalizeKeyword(
            String keyword
    ) {
        if (
                keyword == null ||
                keyword.isBlank()
        ) {
            return null;
        }

        return keyword.trim();
    }
}