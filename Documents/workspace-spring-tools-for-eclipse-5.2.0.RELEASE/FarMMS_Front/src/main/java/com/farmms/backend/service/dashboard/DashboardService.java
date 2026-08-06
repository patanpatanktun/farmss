package com.farmms.backend.service.dashboard;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.farmms.backend.domain.contact.ContactRepository;
import com.farmms.backend.domain.image.GeneratedImageRepository;
import com.farmms.backend.domain.mms.MmsHistory;
import com.farmms.backend.domain.mms.MmsHistoryRepository;
import com.farmms.backend.dto.dashboard.DashboardResponse;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DashboardService {

    private final ContactRepository contactRepository;
    private final GeneratedImageRepository generatedImageRepository;
    private final MmsHistoryRepository mmsHistoryRepository;

    /**
     * 로그인한 사용자의 대시보드 통계를 조회합니다.
     */
    public DashboardResponse getDashboard(
            Long userNum
    ) {
        // 등록한 전체 고객 수
        long contactCount =
                contactRepository.countByUserNum(
                        userNum
                );

        // 생성한 전체 이미지 수
        long imageCount =
                generatedImageRepository.countByUserNum(
                        userNum
                );

        // 로그인한 회원의 MMS 발송 이력을 조회합니다.
        List<MmsHistory> mmsHistories =
                mmsHistoryRepository
                        .findAllByUserNumOrderByMmsNumDesc(
                                userNum
                        );

        // 전체 MMS 발송 요청 수
        long mmsTotalCount =
                mmsHistories.size();

        // 전체 성공 수
        long mmsSuccessCount =
                mmsHistories.stream()
                        .filter(history ->
                                "SUCCESS".equals(
                                        history.getSendStatus()
                                ))
                        .count();

        // 실패 또는 일부 실패 수
        long mmsFailCount =
                mmsHistories.stream()
                        .filter(history ->
                                "FAILED".equals(
                                        history.getSendStatus()
                                )
                                || "PARTIAL_FAILED".equals(
                                        history.getSendStatus()
                                ))
                        .count();

        // 생성한 이미지의 전체 다운로드 횟수
        long totalDownloadCount =
                generatedImageRepository
                        .sumDownloadByUserNum(
                                userNum
                        );

        return new DashboardResponse(
                contactCount,
                imageCount,
                mmsTotalCount,
                mmsSuccessCount,
                mmsFailCount,
                totalDownloadCount
        );
    }
}