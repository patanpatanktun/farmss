package com.farmms.backend.controller;

import java.util.LinkedHashMap;
import java.util.Map;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.farmms.backend.dto.MmsHistoryResponse;
import com.farmms.backend.dto.MmsSendRequest;
import com.farmms.backend.dto.MmsSendResponse;
import com.farmms.backend.service.MmsService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

/**
 * MMS 발송과 발송 이력 조회 요청을 처리하는 컨트롤러입니다.
 */
@RestController
@RequestMapping("/api/mms")
@RequiredArgsConstructor
public class MmsController {

    private final MmsService mmsService;

    /**
     * 로그인한 판매업자의 MMS 발송 요청을 처리합니다.
     *
     * userNum은 요청에서 직접 입력받지 않고,
     * 검증된 JWT에서 자동으로 가져옵니다.
     */
    @PostMapping("/send")
    public ResponseEntity<MmsSendResponse> send(
            @AuthenticationPrincipal Long userNum,
            @Valid @RequestBody MmsSendRequest request) {

        MmsSendResponse response =
                mmsService.send(userNum, request);

        return ResponseEntity.ok(response);
    }

    /**
     * MMS 발송 API 사용 방법을 안내합니다.
     */
    @GetMapping("/send")
    public ResponseEntity<Map<String, Object>> sendGuide(
            @AuthenticationPrincipal Long userNum) {

        Map<String, Object> response = new LinkedHashMap<>();

        response.put(
                "message",
                "MMS 발송은 POST 요청으로 실행해야 합니다."
        );
        response.put("method", "POST");
        response.put("url", "/api/mms/send");
        response.put(
                "requiredHeader",
                "Authorization: Bearer {accessToken}"
        );
        response.put("contentType", "application/json");
        response.put("authenticatedUserNum", userNum);

        return ResponseEntity.ok(response);
    }
    
    /**
     * 로그인한 사용자의 고객들에게 발송한 MMS 이력을 조회합니다.
     */
    @GetMapping("/history")
    public ResponseEntity<List<MmsHistoryResponse>> getHistory(
            @AuthenticationPrincipal Long userNum
    ) {
        List<MmsHistoryResponse> response =
                mmsService.getHistory(userNum);

        return ResponseEntity.ok(response);
    }
    
}