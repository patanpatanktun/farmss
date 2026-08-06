package com.farmms.backend.service;

import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.farmms.backend.common.util.PhoneNumberUtils;
import com.farmms.backend.domain.contact.Contact;
import com.farmms.backend.domain.contact.ContactRepository;
import com.farmms.backend.domain.image.GeneratedImage;
import com.farmms.backend.domain.image.GeneratedImageRepository;
import com.farmms.backend.domain.mms.MmsHistory;
import com.farmms.backend.domain.mms.MmsHistoryRepository;
import com.farmms.backend.dto.MmsHistoryResponse;
import com.farmms.backend.dto.MmsSendRequest;
import com.farmms.backend.dto.MmsSendResponse;
import com.farmms.backend.gateway.MmsGateway;
import com.farmms.backend.gateway.MmsSendCommand;
import com.farmms.backend.gateway.MmsSendResult;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;

/**
 * 실제 contact, generated_image, mms_history 테이블을 사용하는
 * MMS 일괄 발송 Service입니다.
 */
@Service
@RequiredArgsConstructor
public class MmsService {

    private final ContactRepository contactRepository;
    private final GeneratedImageRepository generatedImageRepository;
    private final MmsHistoryRepository mmsHistoryRepository;
    private final MmsGateway mmsGateway;

    /**
     * 선택한 고객들에게 MMS를 일괄 발송합니다.
     *
     * 현재는 실제 문자 업체 대신 MockMmsGateway를 사용합니다.
     */
    @Transactional
    public MmsSendResponse send(
            Long userNum,
            MmsSendRequest request
    ) {
        // 로그인한 회원이 소유한 이미지인지 확인합니다.
        GeneratedImage image = generatedImageRepository
                .findByImageIdAndUserNum(
                        request.getImageId(),
                        userNum
                )
                .orElseThrow(() ->
                        new EntityNotFoundException(
                                "선택한 홍보 이미지를 찾을 수 없습니다."
                        ));

        // 중복된 고객 번호를 제거합니다.
        Set<Long> distinctContactNums =
                new LinkedHashSet<>(
                        request.getContactNums()
                );

        // 로그인한 회원이 등록한 고객만 조회합니다.
        List<Contact> contacts = contactRepository
                .findAllByUserNumAndConNumIn(
                        userNum,
                        distinctContactNums
                );

        // 다른 회원의 고객이나 존재하지 않는 고객이 포함됐는지 검사합니다.
        if (contacts.size() != distinctContactNums.size()) {
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
                PhoneNumberUtils.normalize(
                        request.getFromNumber()
                );

        int successCount = 0;
        int failCount = 0;

        // 선택한 고객들에게 한 명씩 Mock MMS를 발송합니다.
        for (Contact contact : contacts) {

            try {
                MmsSendCommand command =
                        new MmsSendCommand(
                                normalizedFromNumber,
                                contact.getPhone(),
                                request.getTitle(),
                                request.getContent(),
                                image.getImageUrl()
                        );

                MmsSendResult result =
                        mmsGateway.send(command);

                if (result.success()) {
                    successCount++;
                } else {
                    failCount++;
                }

            } catch (Exception exception) {
                failCount++;
            }
        }

        // 일괄 발송 한 번에 대해 MMS 이력 한 행을 생성합니다.
        MmsHistory history = MmsHistory.create(
                image.getImageId(),
                request.getContent(),
                "N"
        );

        String status;

        if (failCount == 0) {
            status = "SUCCESS";
            history.markSuccess();

        } else if (successCount == 0) {
            status = "FAILED";
            history.markFailed();

        } else {
            status = "PARTIAL_FAILED";
            history.markPartialFailed();
        }

        mmsHistoryRepository.save(history);

        return new MmsSendResponse(
                contacts.size(),
                successCount,
                failCount,
                status,
                "MMS 발송 처리가 완료되었습니다."
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
                .findAllByUserNumOrderByMmsNumDesc(userNum)
                .stream()
                .map(history ->
                        new MmsHistoryResponse(
                                history.getMmsNum(),
                                history.getImageId(),
                                history.getMmsText(),
                                history.getSendStatus(),
                                history.getReserveFlag()
                        ))
                .toList();
    }
}