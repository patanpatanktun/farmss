package com.farmms.backend.domain.inquiry;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

/**
 * 문의사항 DB 작업을 처리하는 Repository입니다.
 */
public interface InquiryRepository
        extends JpaRepository<Inquiry, Long> {

    /**
     * 로그인한 사용자의 모든 문의를
     * 최신 작성순으로 조회합니다.
     */
    List<Inquiry>
    findAllByUserIdOrderByCreateDateDesc(
            String userId
    );

    /**
     * 로그인한 사용자의 문의 중
     * 제목에 검색어가 포함된 문의를 조회합니다.
     */
    List<Inquiry>
    findAllByUserIdAndTitleContainingIgnoreCaseOrderByCreateDateDesc(
            String userId,
            String keyword
    );

    /**
     * 로그인한 사용자의 문의 중
     * 내용에 검색어가 포함된 문의를 조회합니다.
     */
    List<Inquiry>
    findAllByUserIdAndContentContainingIgnoreCaseOrderByCreateDateDesc(
            String userId,
            String keyword
    );

    /**
     * 로그인한 사용자의 문의 중
     * 제목 또는 내용에 검색어가 포함된 문의를 조회합니다.
     *
     * 제목 검색과 내용 검색에 동일한 userId와
     * 동일한 keyword를 각각 전달합니다.
     */
    List<Inquiry>
    findAllByUserIdAndTitleContainingIgnoreCaseOrUserIdAndContentContainingIgnoreCaseOrderByCreateDateDesc(
            String titleUserId,
            String titleKeyword,
            String contentUserId,
            String contentKeyword
    );

    /**
     * 문의 번호와 작성자 아이디가 모두 일치하는
     * 문의 한 건을 조회합니다.
     *
     * 다른 사용자의 문의 조회 및 삭제를 방지합니다.
     */
    Optional<Inquiry>
    findByBoardNumAndUserId(
            Long boardNum,
            String userId
    );
}