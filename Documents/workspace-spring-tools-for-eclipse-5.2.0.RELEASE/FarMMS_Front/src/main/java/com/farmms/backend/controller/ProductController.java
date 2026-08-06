package com.farmms.backend.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.farmms.backend.dto.product.ProductResponse;
import com.farmms.backend.service.product.ProductService;

import lombok.RequiredArgsConstructor;

/**
 * 농자재 상품 조회 요청을 처리하는 Controller입니다.
 */
@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    /**
     * 로그인한 회원의 상품을 상품명과 카테고리 조건으로 검색합니다.
     */
    @GetMapping
    public ResponseEntity<List<ProductResponse>> search(
            @AuthenticationPrincipal Long userNum,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String category
    ) {
        List<ProductResponse> response =
                productService.search(
                        userNum,
                        keyword,
                        category
                );

        return ResponseEntity.ok(response);
    }

    /**
     * 로그인한 회원이 등록한 상품 한 개를 조회합니다.
     */
    @GetMapping("/{proNum}")
    public ResponseEntity<ProductResponse> findOne(
            @AuthenticationPrincipal Long userNum,
            @PathVariable Long proNum
    ) {
        ProductResponse response =
                productService.findOne(
                        userNum,
                        proNum
                );

        return ResponseEntity.ok(response);
    }
}