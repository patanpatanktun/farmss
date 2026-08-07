package com.hrg.agripromomms.controller;

import com.hrg.agripromomms.dto.MmsHistoryResponse;
import com.hrg.agripromomms.dto.MmsSendRequest;
import com.hrg.agripromomms.dto.MmsSendResponse;
import com.hrg.agripromomms.service.MmsService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/** MMS 발송과 마이페이지 발송 이력 조회 API입니다. */
@RestController
@RequestMapping("/api/mms")
@RequiredArgsConstructor
public class MmsController {

    private final MmsService mmsService;

    /** 브라우저 GET 접속 시 POST 사용법을 안내합니다. */
    @GetMapping("/send")
    public Map<String, Object> sendGuide() {
        return Map.of(
                "message", "MMS 발송은 POST 요청으로 실행해야 합니다.",
                "header", "X-USER-NUM",
                "body", "title, content, contactNums, imageNum(선택)");
    }

    /** 선택한 연락처에 문자 메시지를 일괄 발송합니다. */
    @PostMapping("/send")
    public ResponseEntity<MmsSendResponse> send(
            @RequestHeader("X-USER-NUM") Long userNum,
            @Valid @RequestBody MmsSendRequest request) {
        return ResponseEntity.ok(mmsService.requestSend(userNum, request));
    }

    /** 로그인한 판매업자의 전체 MMS 이력을 조회합니다. */
    @GetMapping("/history")
    public ResponseEntity<List<MmsHistoryResponse>> history(
            @RequestHeader("X-USER-NUM") Long userNum) {
        return ResponseEntity.ok(mmsService.getHistories(userNum));
    }

    /** 특정 MMS 이력 한 건을 조회합니다. */
    @GetMapping("/history/{mmsNum}")
    public ResponseEntity<MmsHistoryResponse> historyDetail(
            @RequestHeader("X-USER-NUM") Long userNum,
            @PathVariable Long mmsNum) {
        return ResponseEntity.ok(mmsService.getHistory(userNum, mmsNum));
    }
}
