package com.hrg.agripromomms.domain.history;

import com.hrg.agripromomms.domain.image.GeneratedImage;
import com.hrg.agripromomms.domain.user.UserEntity;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/** 이미지 다운로드와 재생성 여부를 기록합니다. */
@Getter
@Entity
@Table(name = "generation_history")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class GenerationHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "history_id")
    private Long historyId;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_num", nullable = false)
    private UserEntity user;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "image_id", nullable = false)
    private GeneratedImage generatedImage;

    @Column(name = "download_count", nullable = false)
    private Integer downloadCount;

    @Enumerated(EnumType.STRING)
    @Column(name = "regenerate_flag", nullable = false, columnDefinition = "CHAR(1)")
    private YesNoFlag regenerateFlag;

    @Column(name = "create_day", nullable = false)
    private LocalDateTime createDay;
}
