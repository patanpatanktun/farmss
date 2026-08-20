package com.farmms.backend.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.farmms.backend.dto.inquiry.InquiryCreateRequest;
import com.farmms.backend.dto.inquiry.InquiryResponse;
import com.farmms.backend.service.inquiry.InquiryService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

/**
 * 문의사항 요청을 처리하는 Controller입니다.
 */
@RestController
@RequestMapping("/api/inquiries")
@RequiredArgsConstructor
public class InquiryController {

    private final InquiryService inquiryService;

    /**
     * 로그인한 사용자의 문의를 등록합니다.
     */
    @PostMapping
    public ResponseEntity<InquiryResponse> create(
            @AuthenticationPrincipal Long userNum,
            @Valid @RequestBody
            InquiryCreateRequest request
    ) {
        InquiryResponse response =
                inquiryService.create(
                        userNum,
                        request
                );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    /**
     * 로그인한 사용자의 문의 목록을 조회하거나 검색합니다.
     *
     * 요청 예시:
     * GET /api/inquiries
     * GET /api/inquiries?keyword=이미지&type=all
     * GET /api/inquiries?keyword=이미지&type=title
     * GET /api/inquiries?keyword=이미지&type=content
     */
    @GetMapping
    public ResponseEntity<List<InquiryResponse>> search(
            @AuthenticationPrincipal Long userNum,
            @RequestParam(required = false)
            String keyword,
            @RequestParam(
                    required = false,
                    defaultValue = "all"
            )
            String type
    ) {
        List<InquiryResponse> response =
                inquiryService.search(
                        userNum,
                        keyword,
                        type
                );

        return ResponseEntity.ok(response);
    }

    /**
     * 로그인한 사용자의 문의 한 건을 조회합니다.
     */
    @GetMapping("/{inquiryNum}")
    public ResponseEntity<InquiryResponse> findOne(
            @AuthenticationPrincipal Long userNum,
            @PathVariable Long inquiryNum
    ) {
        InquiryResponse response =
                inquiryService.findOne(
                        userNum,
                        inquiryNum
                );

        return ResponseEntity.ok(response);
    }

    /**
     * 로그인한 사용자의 문의를 삭제합니다.
     */
    @DeleteMapping("/{inquiryNum}")
    public ResponseEntity<Void> delete(
            @AuthenticationPrincipal Long userNum,
            @PathVariable Long inquiryNum
    ) {
        inquiryService.delete(
                userNum,
                inquiryNum
        );

        return ResponseEntity.noContent().build();
    }
}