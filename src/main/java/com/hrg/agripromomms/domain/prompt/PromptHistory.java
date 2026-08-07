package com.hrg.agripromomms.domain.prompt;

import com.hrg.agripromomms.domain.contact.Contact;
import com.hrg.agripromomms.domain.user.UserEntity;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/** AI 이미지 생성에 사용한 프롬프트 기록입니다. */
@Getter
@Entity
@Table(name = "prompt_history")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class PromptHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "prompt_id")
    private Long promptId;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "con_num", nullable = false)
    private Contact contact;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_num", nullable = false)
    private UserEntity user;

    @Column(name = "prompt_text", nullable = false, columnDefinition = "TEXT")
    private String promptText;

    @Column(name = "create_day", nullable = false)
    private LocalDateTime createDay;
}
