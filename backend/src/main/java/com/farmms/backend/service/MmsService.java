package com.farmms.backend.service;

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

    private final ContactRepository
            contactRepository;

    private final GeneratedImageRepository
            generatedImageRepository;

    private final ProductRepository
            productRepository;

    private final MmsHistoryRepository
            mmsHistoryRepository;

    private final MmsGateway
            mmsGateway;

    /**
     * 모든 FarMMS 회원이 공통으로 사용하는
     * 솔라피 등록 대표 발신번호입니다.
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

        Set<Long> distinctContactNums =
                new LinkedHashSet<>(
                        request.getContactNums()
                );

        List<Contact> contacts =
                contactRepository
                        .findAllByUserNumAndConNumIn(
                                userNum,
                                distinctContactNums
                        );

        if (
                contacts.size() !=
                distinctContactNums.size()
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

        String normalizedFromNumber =
                normalizeConfiguredSenderNumber();

        int successCount = 0;
        int failCount = 0;

        /*
         * 첫 번째 발송 실패 사유를 보관해
         * 프론트 화면에 전달합니다.
         */
        String firstFailureMessage = null;

        String defaultTitle =
                "FarMMS 농자재 홍보 안내";

        for (Contact contact : contacts) {
            MmsHistory history =
                    MmsHistory.create(
                            userNum,
                            image.getImageId(),
                            contact.getConNum(),
                            product.getProName(),
                            image.getImageUrl(),
                            request.getContent(),
                            "N"
                    );

            try {
                MmsSendCommand command =
                        new MmsSendCommand(
                                normalizedFromNumber,
                                contact.getPhone(),
                                defaultTitle,
                                request.getContent(),
                                image.getImageUrl()
                        );

                MmsSendResult result =
                        mmsGateway.send(command);

                if (result.success()) {
                    successCount++;
                    history.markSuccess();

                } else {
                    failCount++;
                    history.markFailed();

                    if (
                            firstFailureMessage == null &&
                            result.errorMessage() != null &&
                            !result.errorMessage().isBlank()
                    ) {
                        firstFailureMessage =
                                result.errorMessage();
                    }
                }

            } catch (Exception exception) {
                failCount++;
                history.markFailed();

                if (firstFailureMessage == null) {
                    firstFailureMessage =
                            exception.getMessage();

                    if (
                            firstFailureMessage == null ||
                            firstFailureMessage.isBlank()
                    ) {
                        firstFailureMessage =
                                "솔라피 MMS 발송 중 알 수 없는 오류가 발생했습니다.";
                    }
                }
            }

            mmsHistoryRepository.save(history);
        }

        String status;

        if (failCount == 0) {
            status = "SUCCESS";

        } else if (successCount == 0) {
            status = "FAILED";

        } else {
            status = "PARTIAL_FAILED";
        }

        String responseMessage;

        if (
                failCount > 0 &&
                firstFailureMessage != null &&
                !firstFailureMessage.isBlank()
        ) {
            responseMessage =
                    "MMS 발송 실패: "
                    + firstFailureMessage;

        } else {
            responseMessage =
                    "MMS 발송 처리가 완료되었습니다.";
        }

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
     * 공통 대표 발신번호를 반환합니다.
     */
    public String getConfiguredSenderNumber() {
        return normalizeConfiguredSenderNumber();
    }

    /**
     * 공통 대표 발신번호의 형식을 검사합니다.
     */
    private String normalizeConfiguredSenderNumber() {
        if (
                configuredSenderNumber == null ||
                configuredSenderNumber.isBlank()
        ) {
            throw new IllegalStateException(
                    "솔라피 대표 발신번호가 설정되지 않았습니다."
            );
        }

        String normalizedSenderNumber =
                PhoneNumberUtils.normalize(
                        configuredSenderNumber
                );

        if (
                normalizedSenderNumber == null ||
                normalizedSenderNumber.length() < 8 ||
                normalizedSenderNumber.length() > 11
        ) {
            throw new IllegalStateException(
                    "솔라피 대표 발신번호 형식이 올바르지 않습니다."
            );
        }

        return normalizedSenderNumber;
    }
}