package com.farmms.backend.service.notice;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.farmms.backend.domain.notice.Notice;
import com.farmms.backend.domain.notice.NoticeRepository;
import com.farmms.backend.domain.user.User;
import com.farmms.backend.domain.user.UserRepository;
import com.farmms.backend.dto.notice.NoticeRequest;
import com.farmms.backend.dto.notice.NoticeResponse;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class NoticeService {

    private final NoticeRepository noticeRepository;
    private final UserRepository userRepository;

    public List<NoticeResponse> search(String keyword) {
        String normalizedKeyword = normalizeKeyword(keyword);

        return noticeRepository.search(normalizedKeyword)
                .stream()
                .map(NoticeResponse::from)
                .toList();
    }

    public NoticeResponse findOne(Long boardNum) {
        return NoticeResponse.from(findNotice(boardNum));
    }

    @Transactional
    public NoticeResponse create(Long userNum, NoticeRequest request) {
        validateAdmin(userNum);

        Notice savedNotice = noticeRepository.save(
                Notice.create(request.title(), request.content())
        );

        return NoticeResponse.from(savedNotice);
    }

    @Transactional
    public NoticeResponse update(
            Long userNum,
            Long boardNum,
            NoticeRequest request
    ) {
        validateAdmin(userNum);

        Notice notice = findNotice(boardNum);
        notice.update(request.title(), request.content());

        return NoticeResponse.from(notice);
    }

    @Transactional
    public void delete(Long userNum, Long boardNum) {
        validateAdmin(userNum);
        noticeRepository.delete(findNotice(boardNum));
    }

    private Notice findNotice(Long boardNum) {
        if (boardNum == null) {
            throw new IllegalArgumentException("공지사항 번호가 필요합니다.");
        }

        return noticeRepository.findById(boardNum)
                .orElseThrow(() ->
                        new EntityNotFoundException("공지사항을 찾을 수 없습니다.")
                );
    }

    private void validateAdmin(Long userNum) {
        if (userNum == null) {
            throw new IllegalArgumentException("로그인이 필요합니다.");
        }

        User user = userRepository.findById(userNum)
                .orElseThrow(() ->
                        new EntityNotFoundException("회원 정보를 찾을 수 없습니다.")
                );

        if (!user.isAdmin()) {
            throw new IllegalArgumentException("관리자만 공지사항을 관리할 수 있습니다.");
        }
    }

    private String normalizeKeyword(String keyword) {
        return keyword == null || keyword.isBlank()
                ? null
                : keyword.trim();
    }
}
