package com.farmms.backend.dto.product;

import com.farmms.backend.domain.product.Product;

/**
 * 상품 정보를 반환하는 DTO입니다.
 */
public record ProductResponse(

        Long proNum,
        Long userNum,
        String proName,
        String category,
        Integer price,
        String company,
        String proDescription,
        String promptText

) {

    /**
     * Product Entity를 응답 DTO로 변환합니다.
     */
    public static ProductResponse from(Product product) {

        return new ProductResponse(
                product.getProNum(),
                product.getUserNum(),
                product.getProName(),
                product.getCategory(),
                product.getPrice(),
                product.getCompany(),
                product.getProDescription(),
                product.getPromptText()
        );
    }
}