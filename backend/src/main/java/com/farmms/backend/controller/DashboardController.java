package com.farmms.backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.farmms.backend.dto.dashboard.DashboardResponse;
import com.farmms.backend.service.dashboard.DashboardService;

import lombok.RequiredArgsConstructor;

/**
 * 메인 대시보드 통계 요청을 처리하는 Controller입니다.
 */
@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    /**
     * 로그인한 사용자의 주요 서비스 이용 통계를 조회합니다.
     */
    @GetMapping
    public ResponseEntity<DashboardResponse> getDashboard(
            @AuthenticationPrincipal Long userNum
    ) {
        DashboardResponse response =
                dashboardService.getDashboard(userNum);

        return ResponseEntity.ok(response);
    }
}