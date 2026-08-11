package com.farmms.backend.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.farmms.backend.dto.product.ProductCreateRequest;
import com.farmms.backend.dto.product.ProductDeleteResult;
import com.farmms.backend.dto.product.ProductResponse;
import com.farmms.backend.dto.product.ProductUpdateRequest;
import com.farmms.backend.service.image.GeneratedImageStorageService;
import com.farmms.backend.service.product.ProductImageStorageService;
import com.farmms.backend.service.product.ProductService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

/**
 * 농자재 상품 요청을 처리하는 Controller입니다.
 */
@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    private final ProductImageStorageService
            productImageStorageService;

    private final GeneratedImageStorageService
            generatedImageStorageService;

    /**
     * 로그인한 회원의 상품을 등록합니다.
     */
    @PostMapping
    public ResponseEntity<ProductResponse> create(
            @AuthenticationPrincipal Long userNum,
            @Valid @RequestBody
            ProductCreateRequest request
    ) {
        ProductResponse response =
                productService.create(
                        userNum,
                        request
                );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    /**
     * 로그인한 회원의 상품을 검색합니다.
     */
    @GetMapping
    public ResponseEntity<List<ProductResponse>> search(
            @AuthenticationPrincipal Long userNum,
            @RequestParam(required = false)
            String keyword,
            @RequestParam(required = false)
            String category
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

    /**
     * 로그인한 회원의 상품 기본정보를 수정합니다.
     */
    @PatchMapping("/{proNum}")
    public ResponseEntity<ProductResponse> update(
            @AuthenticationPrincipal Long userNum,
            @PathVariable Long proNum,
            @Valid @RequestBody
            ProductUpdateRequest request
    ) {
        ProductResponse response =
                productService.update(
                        userNum,
                        proNum,
                        request
                );

        return ResponseEntity.ok(response);
    }

    /**
     * 상품에 참고 이미지를 업로드합니다.
     *
     * 기존 참고 이미지가 있으면 새 이미지로 교체합니다.
     */
    @PostMapping(
            value = "/{proNum}/reference-image",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public ResponseEntity<ProductResponse>
    uploadReferenceImage(
            @AuthenticationPrincipal Long userNum,
            @PathVariable Long proNum,
            @RequestParam("image")
            MultipartFile imageFile
    ) {
        ProductResponse currentProduct =
                productService.findOne(
                        userNum,
                        proNum
                );

        String oldImageUrl =
                currentProduct.referenceImageUrl();

        String newImageUrl =
                productImageStorageService.store(
                        imageFile
                );

        ProductResponse response;

        try {
            response =
                    productService.updateReferenceImage(
                            userNum,
                            proNum,
                            newImageUrl
                    );

        } catch (RuntimeException error) {
            /*
             * DB 저장 실패 시 새로 업로드한 파일을 제거합니다.
             */
            productImageStorageService.delete(
                    newImageUrl
            );

            throw error;
        }

        /*
         * 새 이미지 주소 저장에 성공하면
         * 기존 참고 이미지 파일을 제거합니다.
         */
        if (
                oldImageUrl != null &&
                !oldImageUrl.isBlank() &&
                !oldImageUrl.equals(newImageUrl)
        ) {
            productImageStorageService.delete(
                    oldImageUrl
            );
        }

        return ResponseEntity.ok(response);
    }

    /**
     * 상품에 등록된 참고 이미지만 삭제합니다.
     */
    @DeleteMapping("/{proNum}/reference-image")
    public ResponseEntity<ProductResponse>
    deleteReferenceImage(
            @AuthenticationPrincipal Long userNum,
            @PathVariable Long proNum
    ) {
        ProductResponse currentProduct =
                productService.findOne(
                        userNum,
                        proNum
                );

        String oldImageUrl =
                currentProduct.referenceImageUrl();

        ProductResponse response =
                productService.removeReferenceImage(
                        userNum,
                        proNum
                );

        if (
                oldImageUrl != null &&
                !oldImageUrl.isBlank()
        ) {
            productImageStorageService.delete(
                    oldImageUrl
            );
        }

        return ResponseEntity.ok(response);
    }

    /**
     * 상품과 상품에 연결된 생성 이미지 및 프롬프트를 삭제합니다.
     *
     * 함께 삭제되는 항목:
     * - 상품 정보
     * - 상품 참고 이미지 파일
     * - OpenAI 생성 이미지 DB 정보
     * - OpenAI 생성 PNG 파일
     * - 이미지 생성 프롬프트
     *
     * 유지되는 항목:
     * - MMS 발송 내역
     */
    @DeleteMapping("/{proNum}")
    public ResponseEntity<Map<String, String>>
    delete(
            @AuthenticationPrincipal Long userNum,
            @PathVariable Long proNum
    ) {
        /*
         * DB 데이터 삭제를 먼저 완료하고
         * 삭제할 실제 파일 주소를 반환받습니다.
         */
        ProductDeleteResult deleteResult =
                productService.delete(
                        userNum,
                        proNum
                );

        /*
         * 상품 참고 이미지 실제 파일을 삭제합니다.
         */
        if (
                deleteResult.referenceImageUrl() != null &&
                !deleteResult
                        .referenceImageUrl()
                        .isBlank()
        ) {
            productImageStorageService.delete(
                    deleteResult.referenceImageUrl()
            );
        }

        /*
         * 해당 상품으로 생성한 OpenAI PNG 파일을
         * 모두 삭제합니다.
         *
         * Mock 외부 URL은 StorageService 내부에서
         * 자동으로 무시됩니다.
         */
        for (
                String generatedImageUrl :
                deleteResult.generatedImageUrls()
        ) {
            generatedImageStorageService.delete(
                    generatedImageUrl
            );
        }

        return ResponseEntity.ok(
                Map.of(
                        "message",
                        "상품과 관련 생성 이미지가 삭제되었습니다. MMS 발송 내역은 유지됩니다."
                )
        );
    }
}