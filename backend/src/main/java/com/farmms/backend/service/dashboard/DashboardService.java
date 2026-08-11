package com.farmms.backend.service.dashboard;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.farmms.backend.domain.contact.ContactRepository;
import com.farmms.backend.domain.image.GeneratedImageRepository;
import com.farmms.backend.domain.mms.MmsHistory;
import com.farmms.backend.domain.mms.MmsHistoryRepository;
import com.farmms.backend.domain.product.ProductRepository;
import com.farmms.backend.dto.dashboard.DashboardResponse;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DashboardService {

    private final ContactRepository
            contactRepository;

    private final ProductRepository
            productRepository;

    private final GeneratedImageRepository
            generatedImageRepository;

    private final MmsHistoryRepository
            mmsHistoryRepository;

    /**
     * 로그인한 사용자의 대시보드 통계를 조회합니다.
     */
    public DashboardResponse getDashboard(
            Long userNum
    ) {
        /**
         * 등록한 전체 고객 수입니다.
         */
        long contactCount =
                contactRepository.countByUserNum(
                        userNum
                );

        /**
         * 등록한 전체 상품 수입니다.
         */
        long productCount =
                productRepository.countByUserNum(
                        userNum
                );

        /**
         * 생성한 전체 이미지 수입니다.
         */
        long imageCount =
                generatedImageRepository
                        .countByUserNum(
                                userNum
                        );

        /**
         * 로그인한 회원의 고객별 MMS 발송 이력을
         * 최신순으로 조회합니다.
         */
        List<MmsHistory> mmsHistories =
                mmsHistoryRepository
                        .findAllByUserNumOrderByMmsNumDesc(
                                userNum
                        );

        /**
         * 고객별 전체 MMS 발송 건수입니다.
         */
        long mmsTotalCount =
                mmsHistories.size();

        /**
         * MMS 발송 성공 건수입니다.
         */
        long mmsSuccessCount =
                mmsHistories.stream()
                        .filter(history ->
                                "SUCCESS".equals(
                                        history.getSendStatus()
                                )
                        )
                        .count();

        /**
         * MMS 발송 실패 건수입니다.
         */
        long mmsFailCount =
                mmsHistories.stream()
                        .filter(history ->
                                "FAILED".equals(
                                        history.getSendStatus()
                                ) ||
                                "PARTIAL_FAILED".equals(
                                        history.getSendStatus()
                                )
                        )
                        .count();

        /**
         * MMS 발송 성공률입니다.
         *
         * 발송 이력이 없으면 0%로 처리하고,
         * 소수점 첫째 자리까지 표시합니다.
         */
        double mmsSuccessRate;

        if (mmsTotalCount == 0) {
            mmsSuccessRate = 0.0;
        } else {
            double calculatedRate =
                    (double) mmsSuccessCount
                    / mmsTotalCount
                    * 100.0;

            mmsSuccessRate =
                    Math.round(
                            calculatedRate * 10.0
                    ) / 10.0;
        }

        /**
         * 생성 이미지의 전체 다운로드 횟수입니다.
         */
        long totalDownloadCount =
                generatedImageRepository
                        .sumDownloadByUserNum(
                                userNum
                        );

        return new DashboardResponse(
                contactCount,
                productCount,
                imageCount,
                mmsTotalCount,
                mmsSuccessCount,
                mmsFailCount,
                mmsSuccessRate,
                totalDownloadCount
        );
    }
}