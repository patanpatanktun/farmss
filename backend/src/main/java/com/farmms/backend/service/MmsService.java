package com.farmms.backend.service;

import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.farmms.backend.common.util.PhoneNumberUtils;
import com.farmms.backend.domain.contact.Contact;
import com.farmms.backend.domain.contact.ContactRepository;
import com.farmms.backend.domain.image.GeneratedImage;
import com.farmms.backend.domain.image.GeneratedImageRepository;
import com.farmms.backend.domain.mms.MmsHistory;
import com.farmms.backend.domain.mms.MmsHistoryRepository;
import com.farmms.backend.domain.product.Product;
import com.farmms.backend.domain.product.ProductRepository;
import com.farmms.backend.dto.MmsHistoryResponse;
import com.farmms.backend.dto.MmsSendRequest;
import com.farmms.backend.dto.MmsSendResponse;
import com.farmms.backend.gateway.MmsGateway;
import com.farmms.backend.gateway.MmsSendCommand;
import com.farmms.backend.gateway.MmsSendResult;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;

/**
 * MMS 일괄 발송과 발송 내역 조회를 처리하는 Service입니다.
 */
@Service
@RequiredArgsConstructor
public class MmsService {

    private final ContactRepository contactRepository;

    private final GeneratedImageRepository generatedImageRepository;

    private final ProductRepository productRepository;

    private final MmsHistoryRepository mmsHistoryRepository;

    private final MmsGateway mmsGateway;

    /**
     * 모든 FarMMS 회원이 공통으로 사용하는
     * SOLAPI 등록 대표 발신번호입니다.
     */
    @Value("${solapi.sender-number}")
    private String configuredSenderNumber;

    /**
     * 선택한 고객들에게 MMS를 일괄 발송합니다.
     */
    @Transactional
    public MmsSendResponse send(
            Long userNum,
            MmsSendRequest request
    ) {

        /*
         * 1. 사용자가 선택한 이미지가
         * 실제 로그인 사용자의 이미지인지 확인합니다.
         */
        GeneratedImage image =
                generatedImageRepository
                        .findByImageIdAndUserNum(
                                request.getImageId(),
                                userNum
                        )
                        .orElseThrow(() ->
                                new EntityNotFoundException(
                                        "선택한 홍보 이미지를 찾을 수 없습니다."
                                )
                        );

        /*
         * 2. 이미지와 연결된 상품을 조회합니다.
         */
        Product product =
                productRepository
                        .findByProNumAndUserNum(
                                image.getProNum(),
                                userNum
                        )
                        .orElseThrow(() ->
                                new EntityNotFoundException(
                                        "홍보 이미지에 연결된 상품을 찾을 수 없습니다."
                                )
                        );

        /*
         * 3. 같은 고객 번호가 여러 번 들어오는 것을 방지합니다.
         */
        Set<Long> distinctContactNums =
                new LinkedHashSet<>(
                        request.getContactNums()
                );

        /*
         * 4. 로그인한 사용자가 등록한 고객만 조회합니다.
         */
        List<Contact> contacts =
                contactRepository
                        .findAllByUserNumAndConNumIn(
                                userNum,
                                distinctContactNums
                        );

        /*
         * 요청한 고객 수와 실제 DB에서 조회된 고객 수가 다르면
         * 잘못된 고객 번호가 포함된 것입니다.
         */
        if (
                contacts.size()
                != distinctContactNums.size()
        ) {
            throw new IllegalArgumentException(
                    "발송 대상에 존재하지 않거나 접근할 수 없는 고객이 포함되어 있습니다."
            );
        }

        if (contacts.isEmpty()) {
            throw new IllegalArgumentException(
                    "발송할 고객이 없습니다."
            );
        }

        /*
         * 5. 서버에 설정된 SOLAPI 대표 발신번호를 가져옵니다.
         */
        String normalizedFromNumber =
                normalizeConfiguredSenderNumber();

        /*
         * 6. 예약발송 여부와 예약시간을 확인합니다.
         *
         * 즉시발송
         * -> scheduledDate = null
         *
         * 예약발송
         * -> scheduledDate = 예약시간
         */
        OffsetDateTime scheduledDate =
                resolveScheduledDate(request);

        /*
         * DB에 저장할 예약 여부입니다.
         *
         * N = 즉시발송
         * Y = 예약발송
         */
        String reserveFlag =
                scheduledDate == null
                        ? "N"
                        : "Y";

        /*
         * DB의 reserve_date 컬럼에 저장할 예약시간입니다.
         *
         * MmsSendRequest / Gateway에서는
         * OffsetDateTime을 사용하지만,
         *
         * MmsHistory Entity에서는 LocalDateTime을 사용합니다.
         *
         * 즉시발송이면 null입니다.
         */
        LocalDateTime reserveDate =
                scheduledDate == null
                        ? null
                        : scheduledDate
                                .atZoneSameInstant(
                                        ZoneId.of("Asia/Seoul")
                                )
                                .toLocalDateTime();

        int successCount = 0;
        int failCount = 0;

        /*
         * 첫 번째 발송 실패 사유를 저장합니다.
         */
        String firstFailureMessage = null;

        /*
         * 화면에서 제목을 직접 받지 않는 경우
         * 사용할 기본 MMS 제목입니다.
         */
        String defaultTitle =
                "FarMMS 농자재 홍보 안내";

        /*
         * 7. 선택한 고객들에게 각각 MMS 발송 요청을 합니다.
         */
        for (Contact contact : contacts) {

            /*
             * MMS 발송 이력을 먼저 생성합니다.
             *
             * 예약발송이면
             * reserveFlag = Y
             * reserveDate = 예약시간
             *
             * 즉시발송이면
             * reserveFlag = N
             * reserveDate = null
             */
            MmsHistory history =
                    MmsHistory.create(
                            userNum,
                            image.getImageId(),
                            contact.getConNum(),
                            product.getProName(),
                            image.getImageUrl(),
                            request.getContent(),
                            reserveFlag,
                            reserveDate
                    );

            try {

                /*
                 * SOLAPI Gateway에 전달할 MMS 발송 정보입니다.
                 *
                 * scheduledDate == null
                 * -> 즉시발송
                 *
                 * scheduledDate != null
                 * -> 예약발송
                 */
                MmsSendCommand command =
                        new MmsSendCommand(
                                normalizedFromNumber,
                                contact.getPhone(),
                                defaultTitle,
                                request.getContent(),
                                image.getImageUrl(),
                                scheduledDate
                        );

                /*
                 * 실제 Gateway를 통해
                 * SOLAPI에 발송 또는 예약발송 요청을 보냅니다.
                 */
                MmsSendResult result =
                        mmsGateway.send(command);

                /*
                 * result.success()는
                 * SOLAPI가 요청을 정상적으로 접수했는지를 의미합니다.
                 */
                if (result.success()) {

                    successCount++;

                    /*
                     * 예약발송과 즉시발송 상태를 구분합니다.
                     *
                     * 예약발송
                     * -> RESERVED
                     *
                     * 즉시발송
                     * -> SUCCESS
                     */
                    if (scheduledDate != null) {

                        history.markReserved();

                    } else {

                        history.markSuccess();
                    }

                } else {

                    failCount++;

                    history.markFailed();

                    /*
                     * 여러 명 중 첫 번째 실패 이유만
                     * 응답 메시지에 사용합니다.
                     */
                    if (
                            firstFailureMessage == null
                            && result.errorMessage() != null
                            && !result.errorMessage().isBlank()
                    ) {

                        firstFailureMessage =
                                result.errorMessage();
                    }
                }

            } catch (Exception exception) {

                failCount++;

                history.markFailed();

                /*
                 * 예외가 발생한 경우에도
                 * 첫 번째 실패 이유를 저장합니다.
                 */
                if (firstFailureMessage == null) {

                    firstFailureMessage =
                            exception.getMessage();

                    if (
                            firstFailureMessage == null
                            || firstFailureMessage.isBlank()
                    ) {

                        firstFailureMessage =
                                "솔라피 MMS 발송 중 알 수 없는 오류가 발생했습니다.";
                    }
                }
            }

            /*
             * 고객 한 명에 대한 발송 이력을 DB에 저장합니다.
             */
            mmsHistoryRepository.save(history);
        }

        /*
         * 8. 전체 MMS 처리 결과를 계산합니다.
         */
        String status;

        /*
         * 모든 요청이 정상적으로 접수된 경우입니다.
         */
        if (failCount == 0) {

            /*
             * 예약발송이면 RESERVED,
             * 즉시발송이면 SUCCESS
             */
            if (scheduledDate != null) {

                status = "RESERVED";

            } else {

                status = "SUCCESS";
            }

        /*
         * 모든 고객 발송이 실패한 경우입니다.
         */
        } else if (successCount == 0) {

            status = "FAILED";

        /*
         * 일부 고객은 성공하고
         * 일부 고객은 실패한 경우입니다.
         */
        } else {

            status = "PARTIAL_FAILED";
        }

        /*
         * 9. 프론트에 전달할 응답 메시지를 생성합니다.
         */
        String responseMessage;

        /*
         * 실패한 고객이 존재하는 경우
         */
        if (
                failCount > 0
                && firstFailureMessage != null
                && !firstFailureMessage.isBlank()
        ) {

            responseMessage =
                    "MMS 발송 실패: "
                    + firstFailureMessage;

        /*
         * 모든 예약발송 요청이 정상 접수된 경우
         */
        } else if (scheduledDate != null) {

            responseMessage =
                    "MMS 예약발송이 정상적으로 등록되었습니다.";

        /*
         * 즉시발송 요청이 정상 처리된 경우
         */
        } else {

            responseMessage =
                    "MMS 발송 처리가 완료되었습니다.";
        }

        /*
         * 최종 발송 결과를 프론트에 반환합니다.
         */
        return new MmsSendResponse(
                contacts.size(),
                successCount,
                failCount,
                status,
                responseMessage
        );
    }

    /**
     * 로그인한 회원의 MMS 발송 이력을 조회합니다.
     */
    @Transactional(readOnly = true)
    public List<MmsHistoryResponse> getHistory(
            Long userNum
    ) {

        return mmsHistoryRepository
                .findAllByUserNumOrderByMmsNumDesc(
                        userNum
                )
                .stream()
                .map(MmsHistoryResponse::from)
                .toList();
    }

    /**
     * 서버에 등록된 공통 대표 발신번호를 반환합니다.
     */
    public String getConfiguredSenderNumber() {

        return normalizeConfiguredSenderNumber();
    }

    /**
     * 즉시발송인지 예약발송인지 확인하고
     * SOLAPI에 전달할 예약시간을 반환합니다.
     */
    private OffsetDateTime resolveScheduledDate(
            MmsSendRequest request
    ) {

        /*
         * reserve가 false이면 즉시발송입니다.
         */
        if (!request.isReserve()) {

            return null;
        }

        /*
         * 예약발송인데 예약시간이 없다면
         * 잘못된 요청입니다.
         */
        if (request.getReserveDate() == null) {

            throw new IllegalArgumentException(
                    "예약발송을 선택한 경우 예약시간은 필수입니다."
            );
        }

        OffsetDateTime now =
                OffsetDateTime.now();

        /*
         * 예약발송 최소 가능 시간
         * 현재 시간 + 10분
         */
        OffsetDateTime minimumReserveTime =
                now.plusMinutes(10);

        /*
         * 예약발송 최대 가능 시간
         * 현재 시간 + 6개월
         */
        OffsetDateTime maximumReserveTime =
                now.plusMonths(6);

        /*
         * 현재 시간보다 10분 이상 뒤의 시간인지 검사합니다.
         */
        if (
                request.getReserveDate()
                        .isBefore(minimumReserveTime)
        ) {

            throw new IllegalArgumentException(
                    "예약발송 시간은 현재 시간보다 최소 10분 이후여야 합니다."
            );
        }

        /*
         * 최대 6개월 이내인지 검사합니다.
         */
        if (
                request.getReserveDate()
                        .isAfter(maximumReserveTime)
        ) {

            throw new IllegalArgumentException(
                    "예약발송은 최대 6개월 이내로 설정할 수 있습니다."
            );
        }

        return request.getReserveDate();
    }

    /**
     * 공통 대표 발신번호의 형식을 검사합니다.
     */
    private String normalizeConfiguredSenderNumber() {

        if (
                configuredSenderNumber == null
                || configuredSenderNumber.isBlank()
        ) {

            throw new IllegalStateException(
                    "솔라피 대표 발신번호가 설정되지 않았습니다."
            );
        }

        /*
         * 하이픈 등의 문자를 제거하고
         * 숫자만 남깁니다.
         */
        String normalizedSenderNumber =
                PhoneNumberUtils.normalize(
                        configuredSenderNumber
                );

        if (
                normalizedSenderNumber == null
                || normalizedSenderNumber.length() < 8
                || normalizedSenderNumber.length() > 11
        ) {

            throw new IllegalStateException(
                    "솔라피 대표 발신번호 형식이 올바르지 않습니다."
            );
        }

        return normalizedSenderNumber;
    }
}