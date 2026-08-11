package com.farmms.backend.service.product;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.farmms.backend.domain.image.GeneratedImage;
import com.farmms.backend.domain.image.GeneratedImageRepository;
import com.farmms.backend.domain.product.Product;
import com.farmms.backend.domain.product.ProductRepository;
import com.farmms.backend.domain.prompt.PromptHistoryRepository;
import com.farmms.backend.dto.product.ProductCreateRequest;
import com.farmms.backend.dto.product.ProductDeleteResult;
import com.farmms.backend.dto.product.ProductResponse;
import com.farmms.backend.dto.product.ProductUpdateRequest;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ProductService {

    private final ProductRepository productRepository;

    private final GeneratedImageRepository
            generatedImageRepository;

    private final PromptHistoryRepository
            promptHistoryRepository;

    /**
     * 로그인한 회원의 상품을 등록합니다.
     */
    @Transactional
    public ProductResponse create(
            Long userNum,
            ProductCreateRequest request
    ) {
        Product product = Product.create(
                userNum,
                request.proName().trim(),
                request.category().trim(),
                request.price(),
                request.company().trim(),
                normalizeDescription(
                        request.proDescription()
                ),
                ""
        );

        Product savedProduct =
                productRepository.save(product);

        return ProductResponse.from(savedProduct);
    }

    /**
     * 로그인한 회원의 상품 목록을 검색합니다.
     */
    public List<ProductResponse> search(
            Long userNum,
            String keyword,
            String category
    ) {
        String searchKeyword =
                normalize(keyword);

        String searchCategory =
                normalize(category);

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
        Product product =
                findOwnedProduct(
                        userNum,
                        proNum
                );

        return ProductResponse.from(product);
    }

    /**
     * 로그인한 회원의 상품 기본정보를 수정합니다.
     */
    @Transactional
    public ProductResponse update(
            Long userNum,
            Long proNum,
            ProductUpdateRequest request
    ) {
        Product product =
                findOwnedProduct(
                        userNum,
                        proNum
                );

        String currentPromptText =
                product.getPromptText();

        if (currentPromptText == null) {
            currentPromptText = "";
        }

        product.update(
                request.proName().trim(),
                request.category().trim(),
                request.price(),
                request.company().trim(),
                normalizeDescription(
                        request.proDescription()
                ),
                currentPromptText
        );

        return ProductResponse.from(product);
    }

    /**
     * 상품에 업로드한 참고 이미지 주소를 저장하거나 변경합니다.
     */
    @Transactional
    public ProductResponse updateReferenceImage(
            Long userNum,
            Long proNum,
            String referenceImageUrl
    ) {
        Product product =
                findOwnedProduct(
                        userNum,
                        proNum
                );

        product.updateReferenceImageUrl(
                referenceImageUrl
        );

        return ProductResponse.from(product);
    }

    /**
     * 상품에 등록된 참고 이미지 주소를 제거합니다.
     */
    @Transactional
    public ProductResponse removeReferenceImage(
            Long userNum,
            Long proNum
    ) {
        Product product =
                findOwnedProduct(
                        userNum,
                        proNum
                );

        product.removeReferenceImageUrl();

        return ProductResponse.from(product);
    }

    /**
     * 상품과 상품에 연결된 생성 이미지 및
     * 이미지 생성 프롬프트를 한 번에 삭제합니다.
     *
     * MMS 발송 내역은 삭제하지 않습니다.
     *
     * DB 삭제가 완료된 후 Controller에서 실제 이미지 파일을
     * 삭제할 수 있도록 파일 주소 목록을 반환합니다.
     */
    @Transactional
    public ProductDeleteResult delete(
            Long userNum,
            Long proNum
    ) {
        Product product =
                findOwnedProduct(
                        userNum,
                        proNum
                );

        /*
         * 상품 참고 이미지 주소를 상품 삭제 전에 보관합니다.
         */
        String referenceImageUrl =
                product.getReferenceImageUrl();

        /*
         * 해당 상품으로 생성한 이미지들을 조회합니다.
         */
        List<GeneratedImage> generatedImages =
                generatedImageRepository
                        .findAllByProNumOrderByCreateDayDesc(
                                proNum
                        );

        /*
         * OpenAI가 생성하여 서버에 저장한 실제 이미지 주소를
         * DB 삭제 전에 보관합니다.
         */
        List<String> generatedImageUrls =
                generatedImages
                        .stream()
                        .map(
                                GeneratedImage::getImageUrl
                        )
                        .filter(imageUrl ->
                                imageUrl != null &&
                                !imageUrl.isBlank()
                        )
                        .distinct()
                        .toList();

        /*
         * 생성 이미지 삭제 후 정리할 프롬프트 번호를 보관합니다.
         */
        List<Long> promptIds =
                generatedImages
                        .stream()
                        .map(
                                GeneratedImage::getPromptId
                        )
                        .filter(promptId ->
                                promptId != null
                        )
                        .distinct()
                        .toList();

        /*
         * 생성 이미지를 먼저 삭제합니다.
         *
         * mms_history의 image_id는 DB의
         * ON DELETE SET NULL 설정에 의해 NULL로 변경되고,
         * MMS 발송 내역 자체는 유지됩니다.
         */
        if (!generatedImages.isEmpty()) {
            generatedImageRepository.deleteAll(
                    generatedImages
            );

            generatedImageRepository.flush();
        }

        /*
         * 이미지 생성에 사용한 프롬프트를 삭제합니다.
         */
        if (!promptIds.isEmpty()) {
            promptHistoryRepository.deleteAllById(
                    promptIds
            );

            promptHistoryRepository.flush();
        }

        /*
         * 마지막으로 상품 정보를 삭제합니다.
         */
        productRepository.delete(product);
        productRepository.flush();

        /*
         * Controller에서 실제 파일들을 삭제할 수 있도록
         * 파일 주소를 반환합니다.
         */
        return new ProductDeleteResult(
                referenceImageUrl,
                generatedImageUrls
        );
    }

    /**
     * 로그인한 회원의 특정 상품을 조회합니다.
     */
    private Product findOwnedProduct(
            Long userNum,
            Long proNum
    ) {
        return productRepository
                .findByProNumAndUserNum(
                        proNum,
                        userNum
                )
                .orElseThrow(() ->
                        new EntityNotFoundException(
                                "상품을 찾을 수 없습니다."
                        )
                );
    }

    /**
     * null 또는 빈 문자열을 검색 조건이 없는 상태로 변환합니다.
     */
    private String normalize(String value) {
        if (
                value == null ||
                value.isBlank()
        ) {
            return null;
        }

        return value.trim();
    }

    /**
     * 상품 설명값을 정리합니다.
     */
    private String normalizeDescription(
            String description
    ) {
        if (
                description == null ||
                description.isBlank()
        ) {
            return null;
        }

        return description.trim();
    }
}