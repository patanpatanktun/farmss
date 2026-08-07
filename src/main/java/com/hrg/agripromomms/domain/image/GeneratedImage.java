package com.hrg.agripromomms.domain.image;

import com.hrg.agripromomms.domain.product.Product;
import com.hrg.agripromomms.domain.prompt.PromptHistory;
import com.hrg.agripromomms.domain.user.UserEntity;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/** AI가 생성한 홍보 이미지 정보입니다. */
@Getter
@Entity
@Table(name = "generated_image")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class GeneratedImage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "image_id")
    private Long imageId;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "prompt_id", nullable = false)
    private PromptHistory promptHistory;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_num", nullable = false)
    private UserEntity user;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "pro_num", nullable = false)
    private Product product;

    @Column(name = "image_url", nullable = false, length = 255)
    private String imageUrl;

    @Column(name = "status", nullable = false, length = 20)
    private String status;

    @Column(name = "create_day", nullable = false)
    private LocalDateTime createDay;
}
