package com.farmms.backend.controller;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

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
 * MMS 발송과 발송 이력 조회 요청을 처리하는 Controller입니다.
 */
@RestController
@RequestMapping("/api/mms")
@RequiredArgsConstructor
public class MmsController {

    private final MmsService mmsService;

    /**
     * 로그인한 판매업자의 MMS 발송 요청을 처리합니다.
     *
     * 회원 번호는 요청에서 직접 입력받지 않고
     * 검증된 JWT에서 가져옵니다.
     *
     * 예약 여부와 예약시간은
     * MmsSendRequest에 담겨 MmsService로 전달됩니다.
     */
    @PostMapping("/send")
    public ResponseEntity<MmsSendResponse> send(
            @AuthenticationPrincipal Long userNum,
            @Valid @RequestBody MmsSendRequest request
    ) {

        /*
         * Controller에서는
         * 즉시발송 / 예약발송을 직접 판단하지 않습니다.
         *
         * 요청 전체를 Service에 전달하고
         * 실제 비즈니스 로직은 Service에서 처리합니다.
         */
        MmsSendResponse response =
                mmsService.send(
                        userNum,
                        request
                );

        return ResponseEntity.ok(response);
    }

    /**
     * MMS 발송 API 사용 방법을 안내합니다.
     *
     * 즉시발송과 예약발송 요청 예시를 함께 제공합니다.
     */
    @GetMapping("/send")
    public ResponseEntity<Map<String, Object>>
    sendGuide(
            @AuthenticationPrincipal Long userNum
    ) {

        Map<String, Object> response =
                new LinkedHashMap<>();

        response.put(
                "message",
                "MMS 발송은 POST 요청으로 실행해야 합니다."
        );

        response.put(
                "method",
                "POST"
        );

        response.put(
                "url",
                "/api/mms/send"
        );

        response.put(
                "requiredHeader",
                "Authorization: Bearer {accessToken}"
        );

        response.put(
                "contentType",
                "application/json"
        );

        response.put(
                "authenticatedUserNum",
                userNum
        );

        response.put(
                "senderNumber",
                mmsService.getConfiguredSenderNumber()
        );

        /*
         * 즉시발송 요청 예시
         */
        Map<String, Object> immediateExample =
                new LinkedHashMap<>();

        immediateExample.put(
                "content",
                "신상품 비료가 입고되었습니다."
        );

        immediateExample.put(
                "imageId",
                1L
        );

        immediateExample.put(
                "contactNums",
                List.of(1L)
        );

        immediateExample.put(
                "reserve",
                false
        );

        immediateExample.put(
                "reserveDate",
                null
        );

        response.put(
                "immediateSendExample",
                immediateExample
        );

        /*
         * 예약발송 요청 예시
         */
        Map<String, Object> reservationExample =
                new LinkedHashMap<>();

        reservationExample.put(
                "content",
                "예약 MMS 발송 테스트입니다."
        );

        reservationExample.put(
                "imageId",
                1L
        );

        reservationExample.put(
                "contactNums",
                List.of(1L)
        );

        reservationExample.put(
                "reserve",
                true
        );

        reservationExample.put(
                "reserveDate",
                "2026-08-12T09:00:00+09:00"
        );

        response.put(
                "reservationSendExample",
                reservationExample
        );

        return ResponseEntity.ok(response);
    }

    /**
     * FarMMS에서 공통으로 사용하는
     * 운영자 대표 발신번호를 조회합니다.
     *
     * 프론트에서는 이 번호를 읽기 전용으로 표시합니다.
     */
    @GetMapping("/sender")
    public ResponseEntity<Map<String, String>>
    getSenderNumber(
            @AuthenticationPrincipal Long userNum
    ) {

        String senderNumber =
                mmsService
                        .getConfiguredSenderNumber();

        Map<String, String> response =
                Map.of(
                        "senderNumber",
                        senderNumber,
                        "message",
                        "FarMMS 운영자 대표 발신번호입니다."
                );

        return ResponseEntity.ok(response);
    }

    /**
     * 로그인한 사용자가 발송한 MMS 이력을 조회합니다.
     */
    @GetMapping("/history")
    public ResponseEntity<List<MmsHistoryResponse>>
    getHistory(
            @AuthenticationPrincipal Long userNum
    ) {

        List<MmsHistoryResponse> response =
                mmsService.getHistory(
                        userNum
                );

        return ResponseEntity.ok(response);
    }
}