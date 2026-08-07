package com.hrg.agripromomms.domain.image;

import com.hrg.agripromomms.domain.prompt.PromptHistory;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

/** 재생성된 이미지의 URL을 저장합니다. */
@Getter
@Entity
@Table(name = "regenerated_image")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class RegeneratedImage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "re_image_id")
    private Long reImageId;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "prompt_id", nullable = false)
    private PromptHistory promptHistory;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "image_id", nullable = false)
    private GeneratedImage generatedImage;

    @Column(name = "image_url", nullable = false, length = 255)
    private String imageUrl;
}
