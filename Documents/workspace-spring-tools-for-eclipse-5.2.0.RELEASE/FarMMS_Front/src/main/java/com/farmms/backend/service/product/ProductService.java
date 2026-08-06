package com.farmms.backend.service.product;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.farmms.backend.domain.product.Product;
import com.farmms.backend.domain.product.ProductRepository;
import com.farmms.backend.dto.product.ProductResponse;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ProductService {

    private final ProductRepository productRepository;

    /**
     * 로그인한 회원의 상품 목록을 검색합니다.
     */
    public List<ProductResponse> search(
            Long userNum,
            String keyword,
            String category
    ) {
        String searchKeyword = normalize(keyword);
        String searchCategory = normalize(category);

        return productRepository
                .search(
                        userNum,
                        searchKeyword,
                        searchCategory
                )
                .stream()
                .map(ProductResponse::from)
                .toList();
    }

    /**
     * 로그인한 회원이 등록한 상품 한 개를 조회합니다.
     */
    public ProductResponse findOne(
            Long userNum,
            Long proNum
    ) {
        Product product = productRepository
                .findByProNumAndUserNum(proNum, userNum)
                .orElseThrow(() ->
                        new EntityNotFoundException(
                                "상품을 찾을 수 없습니다."
                        ));

        return ProductResponse.from(product);
    }

    /**
     * null 또는 빈 문자열을 검색 조건이 없는 상태로 변환합니다.
     */
    private String normalize(String value) {

        if (value == null || value.isBlank()) {
            return null;
        }

        return value.trim();
    }
}