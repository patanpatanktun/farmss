package com.farmms.backend.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.farmms.backend.dto.notice.NoticeRequest;
import com.farmms.backend.dto.notice.NoticeResponse;
import com.farmms.backend.service.notice.NoticeService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/notices")
@RequiredArgsConstructor
public class NoticeController {

    private final NoticeService noticeService;

    @GetMapping
    public ResponseEntity<List<NoticeResponse>> search(
            @RequestParam(required = false) String keyword
    ) {
        return ResponseEntity.ok(noticeService.search(keyword));
    }

    @GetMapping("/{boardNum}")
    public ResponseEntity<NoticeResponse> findOne(
            @PathVariable Long boardNum
    ) {
        return ResponseEntity.ok(noticeService.findOne(boardNum));
    }

    @PostMapping
    public ResponseEntity<NoticeResponse> create(
            @AuthenticationPrincipal Long userNum,
            @Valid @RequestBody NoticeRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(noticeService.create(userNum, request));
    }

    @PatchMapping("/{boardNum}")
    public ResponseEntity<NoticeResponse> update(
            @AuthenticationPrincipal Long userNum,
            @PathVariable Long boardNum,
            @Valid @RequestBody NoticeRequest request
    ) {
        return ResponseEntity.ok(
                noticeService.update(userNum, boardNum, request)
        );
    }

    @DeleteMapping("/{boardNum}")
    public ResponseEntity<Void> delete(
            @AuthenticationPrincipal Long userNum,
            @PathVariable Long boardNum
    ) {
        noticeService.delete(userNum, boardNum);
        return ResponseEntity.noContent().build();
    }
}
