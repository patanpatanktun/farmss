package com.hrg.agripromomms.service;

import com.hrg.agripromomms.common.util.PhoneMaskingUtils;
import com.hrg.agripromomms.domain.contact.Contact;
import com.hrg.agripromomms.domain.contact.ContactRepository;
import com.hrg.agripromomms.domain.image.GeneratedImage;
import com.hrg.agripromomms.domain.image.GeneratedImageRepository;
import com.hrg.agripromomms.domain.mms.*;
import com.hrg.agripromomms.domain.user.UserRepository;
import com.hrg.agripromomms.dto.MmsHistoryResponse;
import com.hrg.agripromomms.dto.MmsSendRequest;
import com.hrg.agripromomms.dto.MmsSendResponse;
import com.hrg.agripromomms.event.MmsRequestedEvent;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

/** 문자 발송 접수와 발송 이력 조회를 담당합니다. */
@Service
@RequiredArgsConstructor
public class MmsService {

    private final UserRepository userRepository;
    private final ContactRepository contactRepository;
    private final GeneratedImageRepository generatedImageRepository;
    private final MmsHistoryRepository mmsHistoryRepository;
    private final ApplicationEventPublisher eventPublisher;

    /**
     * 선택한 연락처를 검증하고, 수신자별 WAIT 이력을 생성합니다.
     * imageNum은 현재 텍스트 발송 단계에서 선택값입니다.
     */
    @Transactional
    public MmsSendResponse requestSend(Long userNum, MmsSendRequest request) {
        // 1. 요청한 판매업자가 실제 회원인지 확인합니다.
        if (!userRepository.existsById(userNum)) {
            throw new EntityNotFoundException("회원 번호 " + userNum + "을 찾을 수 없습니다.");
        }

        // 2. 이미지 번호가 전달된 경우에만 소유권을 확인합니다.
        GeneratedImage image = null;
        if (request.getImageNum() != null) {
            image = generatedImageRepository
                    .findOwnedImage(request.getImageNum(), userNum)
                    .orElseThrow(() -> new EntityNotFoundException(
                            "선택한 홍보 이미지가 없거나 접근 권한이 없습니다."));
        }

        // 3. 현재 판매업자가 소유한 연락처만 조회합니다.
        Set<Long> uniqueNums = new HashSet<>(request.getContactNums());
        List<Contact> contacts = contactRepository.findOwnedContacts(userNum, uniqueNums);

        // 4. 다른 판매업자 소유 연락처가 섞여 있으면 발송을 중단합니다.
        if (contacts.size() != uniqueNums.size()) {
            throw new IllegalArgumentException("일부 연락처가 없거나 현재 판매업자의 연락처가 아닙니다.");
        }

        ReserveFlag reserveFlag = parseReserveFlag(request.getReserveFlag());
        LocalDateTime sendDate = resolveSendDate(reserveFlag, request.getSendDate());

        // 5. mms_history는 수신자 한 명당 한 행을 저장합니다.
        GeneratedImage selectedImage = image;
        List<MmsHistory> histories = contacts.stream()
                .map(contact -> MmsHistory.waiting(selectedImage, contact, sendDate, reserveFlag))
                .toList();

        List<MmsHistory> saved = mmsHistoryRepository.saveAll(histories);
        List<Long> mmsNums = saved.stream().map(MmsHistory::getMmsNum).toList();

        // 6. 즉시 발송이면 DB 커밋 후 비동기로 SOLAPI 또는 Mock Gateway를 호출합니다.
        if (reserveFlag == ReserveFlag.N) {
            eventPublisher.publishEvent(new MmsRequestedEvent(
                    mmsNums,
                    request.getTitle(),
                    request.getContent()));
        }

        String message = reserveFlag == ReserveFlag.N
                ? "문자 발송 요청이 접수되었습니다."
                : "예약 이력이 저장되었습니다. 현재 버전은 예약 시각 자동 실행 기능이 아직 없습니다.";

        return new MmsSendResponse(mmsNums, mmsNums.size(), MmsSendStatus.WAIT.name(), message);
    }

    /** 판매업자의 전체 문자 발송 이력을 조회합니다. */
    @Transactional(readOnly = true)
    public List<MmsHistoryResponse> getHistories(Long userNum) {
        return mmsHistoryRepository.findAllOwnedBy(userNum).stream()
                .map(this::toResponse)
                .toList();
    }

    /** 특정 문자 이력 한 건을 조회합니다. */
    @Transactional(readOnly = true)
    public MmsHistoryResponse getHistory(Long userNum, Long mmsNum) {
        MmsHistory history = mmsHistoryRepository.findOwnedHistory(mmsNum, userNum)
                .orElseThrow(() -> new EntityNotFoundException("문자 발송 이력이 없습니다."));
        return toResponse(history);
    }

    private MmsHistoryResponse toResponse(MmsHistory history) {
        // 이미지가 없는 텍스트 발송 이력은 imageNum을 null로 반환합니다.
        Long imageNum = history.getGeneratedImage() == null
                ? null
                : history.getGeneratedImage().getImageId();

        return new MmsHistoryResponse(
                history.getMmsNum(),
                imageNum,
                history.getContact().getConNum(),
                history.getContact().getConName(),
                PhoneMaskingUtils.mask(history.getContact().getPhone()),
                history.getSendDate(),
                history.getSendStatus().name(),
                history.getReserveFlag().name());
    }

    private ReserveFlag parseReserveFlag(String value) {
        try {
            return ReserveFlag.valueOf(value == null ? "N" : value.toUpperCase());
        } catch (IllegalArgumentException ex) {
            throw new IllegalArgumentException("reserveFlag는 Y 또는 N만 사용할 수 있습니다.");
        }
    }

    private LocalDateTime resolveSendDate(ReserveFlag flag, LocalDateTime requestedDate) {
        if (flag == ReserveFlag.N) {
            return LocalDateTime.now();
        }
        if (requestedDate == null || !requestedDate.isAfter(LocalDateTime.now())) {
            throw new IllegalArgumentException("예약 발송은 현재 시간 이후의 sendDate가 필요합니다.");
        }
        return requestedDate;
    }
}
