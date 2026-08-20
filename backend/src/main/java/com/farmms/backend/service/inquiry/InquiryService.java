package com.farmms.backend.service.inquiry;

import java.util.List;
import java.util.Locale;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.farmms.backend.domain.inquiry.Inquiry;
import com.farmms.backend.domain.inquiry.InquiryRepository;
import com.farmms.backend.domain.user.User;
import com.farmms.backend.domain.user.UserRepository;
import com.farmms.backend.dto.inquiry.InquiryCreateRequest;
import com.farmms.backend.dto.inquiry.InquiryResponse;

import lombok.RequiredArgsConstructor;

/**
 * 문의사항 등록, 조회, 검색, 삭제를 처리하는 서비스입니다.
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class InquiryService {

    private final InquiryRepository inquiryRepository;
    private final UserRepository userRepository;

    /**
     * 로그인한 사용자의 문의를 등록합니다.
     */
    @Transactional
    public InquiryResponse create(
            Long userNum,
            InquiryCreateRequest request
    ) {
        User user = findUser(userNum);

        Inquiry inquiry = Inquiry.create(
                user.getUserId(),
                request.title().trim(),
                request.content().trim()
        );

        Inquiry savedInquiry =
                inquiryRepository.save(inquiry);

        return InquiryResponse.from(savedInquiry);
    }

    /**
     * 로그인한 사용자의 문의 목록을 조회하거나 검색합니다.
     *
     * type:
     * - all: 제목 또는 내용 검색
     * - title: 제목 검색
     * - content: 내용 검색
     */
    public List<InquiryResponse> search(
            Long userNum,
            String keyword,
            String type
    ) {
        User user = findUser(userNum);

        String userId = user.getUserId();
        String normalizedKeyword =
                normalizeKeyword(keyword);
        String normalizedType =
                normalizeSearchType(type);

        List<Inquiry> inquiries;

        if (normalizedKeyword.isBlank()) {
            inquiries =
                    inquiryRepository
                            .findAllByUserIdOrderByCreateDateDesc(
                                    userId
                            );
        } else {
            inquiries = switch (normalizedType) {
                case "title" ->
                        inquiryRepository
                                .findAllByUserIdAndTitleContainingIgnoreCaseOrderByCreateDateDesc(
                                        userId,
                                        normalizedKeyword
                                );

                case "content" ->
                        inquiryRepository
                                .findAllByUserIdAndContentContainingIgnoreCaseOrderByCreateDateDesc(
                                        userId,
                                        normalizedKeyword
                                );

                case "all" ->
                        inquiryRepository
                                .findAllByUserIdAndTitleContainingIgnoreCaseOrUserIdAndContentContainingIgnoreCaseOrderByCreateDateDesc(
                                        userId,
                                        normalizedKeyword,
                                        userId,
                                        normalizedKeyword
                                );

                default -> throw new IllegalArgumentException(
                        "지원하지 않는 문의 검색 유형입니다."
                );
            };
        }

        return inquiries
                .stream()
                .map(InquiryResponse::from)
                .toList();
    }

    /**
     * 로그인한 사용자의 문의 한 건을 조회합니다.
     */
    public InquiryResponse findOne(
            Long userNum,
            Long inquiryNum
    ) {
        User user = findUser(userNum);

        Inquiry inquiry = findOwnedInquiry(
                inquiryNum,
                user.getUserId()
        );

        return InquiryResponse.from(inquiry);
    }

    /**
     * 로그인한 사용자의 문의를 삭제합니다.
     *
     * 문의 번호와 작성자 아이디를 함께 확인하므로
     * 다른 사용자의 문의는 삭제할 수 없습니다.
     */
    @Transactional
    public void delete(
            Long userNum,
            Long inquiryNum
    ) {
        User user = findUser(userNum);

        Inquiry inquiry = findOwnedInquiry(
                inquiryNum,
                user.getUserId()
        );

        inquiryRepository.delete(inquiry);
    }

    /**
     * 회원번호로 로그인 사용자를 조회합니다.
     */
    private User findUser(Long userNum) {
        if (userNum == null) {
            throw new IllegalArgumentException(
                    "로그인 정보가 없습니다."
            );
        }

        return userRepository
                .findById(userNum)
                .orElseThrow(
                        () -> new IllegalArgumentException(
                                "회원 정보를 찾을 수 없습니다."
                        )
                );
    }

    /**
     * 문의 번호와 작성자 아이디가 일치하는 문의를 조회합니다.
     */
    private Inquiry findOwnedInquiry(
            Long inquiryNum,
            String userId
    ) {
        return inquiryRepository
                .findByBoardNumAndUserId(
                        inquiryNum,
                        userId
                )
                .orElseThrow(
                        () -> new IllegalArgumentException(
                                "문의사항을 찾을 수 없습니다."
                        )
                );
    }

    /**
     * 검색어 앞뒤의 불필요한 공백을 제거합니다.
     */
    private String normalizeKeyword(
            String keyword
    ) {
        return keyword == null
                ? ""
                : keyword.trim();
    }

    /**
     * 검색 유형을 소문자로 통일합니다.
     *
     * 검색 유형이 전달되지 않으면 전체 검색을 사용합니다.
     */
    private String normalizeSearchType(
            String type
    ) {
        if (type == null || type.isBlank()) {
            return "all";
        }

        return type
                .trim()
                .toLowerCase(Locale.ROOT);
    }
}