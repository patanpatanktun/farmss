package com.hrg.agripromomms.domain.product;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

/** AI 홍보 이미지 제작에 사용하는 농자재 상품 정보입니다. */
@Getter
@Entity
@Table(name = "product")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "pro_num")
    private Long proNum;

    @Column(name = "pro_name", nullable = false, length = 100)
    private String proName;

    @Column(name = "category", nullable = false, length = 50)
    private String category;

    @Column(name = "price", nullable = false)
    private Integer price;

    @Column(name = "company", nullable = false, length = 100)
    private String company;

    @Column(name = "crop", length = 100)
    private String crop;

    @Column(name = "pro_description", columnDefinition = "TEXT")
    private String description;
}
