package com.farmms.backend.dto.dashboard;

/**
 * 메인 대시보드에 표시할 요약 통계입니다.
 */
public record DashboardResponse(

        /**
         * 등록한 전체 고객 수입니다.
         */
        long contactCount,

        /**
         * 등록한 전체 상품 수입니다.
         */
        long productCount,

        /**
         * 생성한 전체 홍보 이미지 수입니다.
         */
        long imageCount,

        /**
         * 고객별 전체 MMS 발송 건수입니다.
         */
        long mmsTotalCount,

        /**
         * MMS 발송 성공 건수입니다.
         */
        long mmsSuccessCount,

        /**
         * MMS 발송 실패 건수입니다.
         */
        long mmsFailCount,

        /**
         * MMS 발송 성공률입니다.
         */
        double mmsSuccessRate,

        /**
         * 생성 이미지의 전체 다운로드 횟수입니다.
         */
        long totalDownloadCount

) {
}