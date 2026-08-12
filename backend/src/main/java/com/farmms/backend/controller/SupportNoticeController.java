package com.farmms.backend.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.farmms.backend.dto.notice.SupportNoticeResponse;
import com.farmms.backend.service.notice.SupportNoticeService;

import lombok.RequiredArgsConstructor;

/**
 * 정부 지원사업 공고 조회 요청을 처리하는 Controller입니다.
 */
@RestController
@RequestMapping("/api/notices")
@RequiredArgsConstructor
public class SupportNoticeController {

    private final SupportNoticeService
            supportNoticeService;

    /**
     * 정부 지원사업 공고 목록을 조회하거나 검색합니다.
     *
     * 전체 조회:
     * GET /api/notices
     *
     * 검색:
     * GET /api/notices?keyword=비료
     */
    @GetMapping
    public ResponseEntity<
            List<SupportNoticeResponse>
    > search(
            @RequestParam(
                    required = false
            )
            String keyword
    ) {
        List<SupportNoticeResponse> response =
                supportNoticeService.search(
                        keyword
                );

        return ResponseEntity.ok(response);
    }

    /**
     * 공고 번호로 정부 지원사업 공고
     * 한 건을 조회합니다.
     *
     * GET /api/notices/1
     */
    @GetMapping("/{noticeId}")
    public ResponseEntity<
            SupportNoticeResponse
    > findOne(
            @PathVariable Long noticeId
    ) {
        SupportNoticeResponse response =
                supportNoticeService.findOne(
                        noticeId
                );

        return ResponseEntity.ok(response);
    }
}