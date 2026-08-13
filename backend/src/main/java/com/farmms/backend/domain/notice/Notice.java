package com.farmms.backend.domain.notice;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "notice")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Notice {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "board_num")
    private Long boardNum;

    @Column(name = "title", nullable = false, length = 200)
    private String title;

    @Column(name = "content", nullable = false, columnDefinition = "TEXT")
    private String content;

    @Column(name = "create_date", nullable = false)
    private LocalDateTime createDate;

    private Notice(String title, String content) {
        this.title = normalizeTitle(title);
        this.content = normalizeContent(content);
    }

    public static Notice create(String title, String content) {
        return new Notice(title, content);
    }

    public void update(String title, String content) {
        this.title = normalizeTitle(title);
        this.content = normalizeContent(content);
    }

    @PrePersist
    private void prePersist() {
        if (createDate == null) {
            createDate = LocalDateTime.now();
        }
    }

    private static String normalizeTitle(String title) {
        if (title == null || title.isBlank()) {
            throw new IllegalArgumentException("공지사항 제목을 입력해주세요.");
        }

        String normalized = title.trim();

        if (normalized.length() > 200) {
            throw new IllegalArgumentException("공지사항 제목은 200자 이하로 입력해주세요.");
        }

        return normalized;
    }

    private static String normalizeContent(String content) {
        if (content == null || content.isBlank()) {
            throw new IllegalArgumentException("공지사항 내용을 입력해주세요.");
        }

        return content.trim();
    }
}
