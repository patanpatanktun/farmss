package com.farmms.backend.dto.dashboard;

/**
 * 메인 대시보드에 표시할 요약 통계입니다.
 */
public record DashboardResponse(

        long contactCount,
        long imageCount,
        long mmsTotalCount,
        long mmsSuccessCount,
        long mmsFailCount,
        long totalDownloadCount

) {
}