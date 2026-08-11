package com.farmms.backend.domain.product;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 홍보 이미지 생성에 사용할 농자재 상품 Entity입니다.
 */
@Entity
@Table(name = "product")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "pro_num")
    private Long proNum;

    /**
     * 상품을 등록한 회원 번호입니다.
     */
    @Column(name = "user_num", nullable = false)
    private Long userNum;

    @Column(
            name = "pro_name",
            nullable = false,
            length = 100
    )
    private String proName;

    @Column(
            name = "category",
            nullable = false,
            length = 50
    )
    private String category;

    @Column(name = "price", nullable = false)
    private Integer price;

    @Column(
            name = "company",
            nullable = false,
            length = 100
    )
    private String company;

    @Column(
            name = "pro_description",
            columnDefinition = "TEXT"
    )
    private String proDescription;

    /**
     * AI 홍보 이미지 생성에 사용할 프롬프트 문구입니다.
     */
    @Column(
            name = "prompt_text",
            nullable = false,
            columnDefinition = "TEXT"
    )
    private String promptText;

    /**
     * 상품 등록 시 업로드한 참고 이미지의 접근 주소입니다.
     *
     * 이미지 파일 자체는 서버의 uploads/products 폴더에 저장하고,
     * DB에는 해당 이미지에 접근할 수 있는 주소만 저장합니다.
     */
    @Column(
            name = "reference_image_url",
            length = 500
    )
    private String referenceImageUrl;

    private Product(
            Long userNum,
            String proName,
            String category,
            Integer price,
            String company,
            String proDescription,
            String promptText
    ) {
        this.userNum = userNum;
        this.proName = proName;
        this.category = category;
        this.price = price;
        this.company = company;
        this.proDescription = proDescription;
        this.promptText = promptText;
        this.referenceImageUrl = null;
    }

    /**
     * 새로운 상품을 생성합니다.
     */
    public static Product create(
            Long userNum,
            String proName,
            String category,
            Integer price,
            String company,
            String proDescription,
            String promptText
    ) {
        validatePrice(price);

        return new Product(
                userNum,
                proName,
                category,
                price,
                company,
                proDescription,
                promptText
        );
    }

    /**
     * 상품 정보를 수정합니다.
     */
    public void update(
            String proName,
            String category,
            Integer price,
            String company,
            String proDescription,
            String promptText
    ) {
        validatePrice(price);

        this.proName = proName;
        this.category = category;
        this.price = price;
        this.company = company;
        this.proDescription = proDescription;
        this.promptText = promptText;
    }

    /**
     * 상품의 참고 이미지 주소를 저장하거나 변경합니다.
     */
    public void updateReferenceImageUrl(
            String referenceImageUrl
    ) {
        if (
                referenceImageUrl == null ||
                referenceImageUrl.isBlank()
        ) {
            throw new IllegalArgumentException(
                    "참고 이미지 주소는 비어 있을 수 없습니다."
            );
        }

        this.referenceImageUrl =
                referenceImageUrl.trim();
    }

    /**
     * 상품에 등록된 참고 이미지 주소를 제거합니다.
     */
    public void removeReferenceImageUrl() {
        this.referenceImageUrl = null;
    }

    /**
     * AI 이미지 생성에 사용한 최신 프롬프트를 저장합니다.
     */
    public void updatePromptText(String promptText) {
        if (
                promptText == null ||
                promptText.isBlank()
        ) {
            throw new IllegalArgumentException(
                    "프롬프트는 비어 있을 수 없습니다."
            );
        }

        this.promptText = promptText.trim();
    }

    /**
     * 가격이 음수로 저장되지 않도록 검사합니다.
     */
    private static void validatePrice(Integer price) {
        if (price == null || price < 0) {
            throw new IllegalArgumentException(
                    "상품 가격은 0원 이상이어야 합니다."
            );
        }
    }
}