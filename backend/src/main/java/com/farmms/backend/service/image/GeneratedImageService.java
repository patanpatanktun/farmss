package com.farmms.backend.service.image;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.farmms.backend.domain.contact.ContactRepository;
import com.farmms.backend.domain.image.GeneratedImage;
import com.farmms.backend.domain.image.GeneratedImageRepository;
import com.farmms.backend.domain.product.Product;
import com.farmms.backend.domain.product.ProductRepository;
import com.farmms.backend.domain.prompt.PromptHistory;
import com.farmms.backend.domain.prompt.PromptHistoryRepository;
import com.farmms.backend.dto.image.GeneratedImageResponse;
import com.farmms.backend.dto.image.ImageDownloadResponse;
import com.farmms.backend.dto.image.ImageGenerateRequest;
import com.farmms.backend.gateway.image.ImageGenerationGateway;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;

/**
 * AI 농자재 홍보 이미지의 생성, 조회, 다운로드,
 * 삭제 기능을 처리하는 Service입니다.
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class GeneratedImageService {

    private final GeneratedImageRepository
            generatedImageRepository;

    private final ContactRepository
            contactRepository;

    private final ProductRepository
            productRepository;

    private final PromptHistoryRepository
            promptHistoryRepository;

    private final ImageGenerationGateway
            imageGenerationGateway;

    private final GeneratedImageStorageService
            generatedImageStorageService;

    /**
     * 로그인한 사용자가 생성한 이미지 목록을 조회합니다.
     */
    public List<GeneratedImageResponse> findAll(
            Long userNum
    ) {
        return generatedImageRepository
                .findAllByUserNumOrderByCreateDayDesc(
                        userNum
                )
                .stream()
                .map(GeneratedImageResponse::from)
                .toList();
    }

    /**
     * 로그인한 사용자가 소유한 생성 이미지 한 개를 조회합니다.
     */
    public GeneratedImageResponse findOne(
            Long userNum,
            Long imageId
    ) {
        GeneratedImage image =
                findOwnedImage(
                        userNum,
                        imageId
                );

        return GeneratedImageResponse.from(
                image
        );
    }

    /**
     * 고객과 상품을 선택하고 프롬프트를 이용해
     * 농자재 홍보 이미지를 생성합니다.
     *
     * 처리 순서:
     * 1. 고객 소유권 확인
     * 2. 상품 소유권 확인
     * 3. 프롬프트 이력 저장
     * 4. Mock 또는 실제 OpenAI 이미지 생성
     * 5. 생성 이미지 정보 저장
     */
    @Transactional
    public GeneratedImageResponse generate(
            Long userNum,
            ImageGenerateRequest request
    ) {
        /*
         * 선택한 고객이 로그인한 회원의 고객인지 확인합니다.
         */
        contactRepository
                .findByConNumAndUserNum(
                        request.conNum(),
                        userNum
                )
                .orElseThrow(() ->
                        new EntityNotFoundException(
                                "고객을 찾을 수 없습니다."
                        )
                );

        /*
         * 선택한 상품이 로그인한 회원의 상품인지 확인합니다.
         */
        Product product =
                productRepository
                        .findByProNumAndUserNum(
                                request.proNum(),
                                userNum
                        )
                        .orElseThrow(() ->
                                new EntityNotFoundException(
                                        "상품을 찾을 수 없습니다."
                                )
                        );

        String promptText =
                request.promptText().trim();

        /*
         * 상품에 마지막으로 사용한 프롬프트를 저장합니다.
         */
        product.updatePromptText(
                promptText
        );

        /*
         * 이미지 생성에 사용한 프롬프트를
         * prompt_history 테이블에 저장합니다.
         */
        PromptHistory promptHistory =
                PromptHistory.create(
                        userNum,
                        request.conNum(),
                        promptText
                );

        PromptHistory savedPromptHistory =
                promptHistoryRepository.save(
                        promptHistory
                );

        /*
         * 상품에 참고 이미지가 있으면 참고 이미지 주소까지
         * Gateway에 전달합니다.
         *
         * Mock 모드에서는 참고 이미지가 사용되지 않고,
         * OpenAI 모드에서는 이미지 편집 API에 전달됩니다.
         */
        String imageUrl;

        try {
            imageUrl =
                    imageGenerationGateway.generate(
                            promptText,
                            product.getReferenceImageUrl()
                    );

        } catch (RuntimeException error) {
            /*
             * AI 이미지 생성이 실패하면 이번 요청에서 저장한
             * 프롬프트 기록을 제거합니다.
             */
            promptHistoryRepository.delete(
                    savedPromptHistory
            );

            promptHistoryRepository.flush();

            throw error;
        }

        /*
         * 생성된 이미지 정보를 generated_image에 저장합니다.
         */
        GeneratedImage generatedImage =
                GeneratedImage.create(
                        userNum,
                        product.getProNum(),
                        savedPromptHistory.getPromptId(),
                        imageUrl
                );

        GeneratedImage savedImage =
                generatedImageRepository.save(
                        generatedImage
                );

        return GeneratedImageResponse.from(
                savedImage
        );
    }

    /**
     * 이미지 다운로드 횟수를 1 증가시키고
     * 다운로드할 이미지 주소를 반환합니다.
     */
    @Transactional
    public ImageDownloadResponse download(
            Long userNum,
            Long imageId
    ) {
        GeneratedImage image =
                findOwnedImage(
                        userNum,
                        imageId
                );

        image.increaseDownload();

        return new ImageDownloadResponse(
                image.getImageId(),
                image.getImageUrl(),
                image.getDownload()
        );
    }

    /**
     * 생성 이미지와 해당 이미지의 프롬프트를 삭제합니다.
     *
     * MMS 발송 내역은 삭제하지 않습니다.
     * DB의 ON DELETE SET NULL 설정에 따라
     * 발송 내역의 image_id만 NULL로 변경됩니다.
     */
    @Transactional
    public void delete(
            Long userNum,
            Long imageId
    ) {
        GeneratedImage image =
                findOwnedImage(
                        userNum,
                        imageId
                );

        String imageUrl =
                image.getImageUrl();

        Long promptId =
                image.getPromptId();

        /*
         * 생성 이미지를 먼저 삭제합니다.
         *
         * mms_history의 image_id는 자동으로 NULL이 되고
         * 발송 당시 상품명, 이미지 주소, 문구는 유지됩니다.
         */
        generatedImageRepository.delete(
                image
        );

        generatedImageRepository.flush();

        /*
         * 이미지 생성에 사용한 프롬프트 기록을 삭제합니다.
         */
        if (
                promptId != null &&
                promptHistoryRepository.existsById(
                        promptId
                )
        ) {
            promptHistoryRepository.deleteById(
                    promptId
            );

            promptHistoryRepository.flush();
        }

        /*
         * OpenAI가 생성하여 서버에 저장한 실제 이미지 파일을
         * 삭제합니다.
         *
         * Mock 외부 URL인 경우에는 아무 작업도 하지 않습니다.
         */
        generatedImageStorageService.delete(
                imageUrl
        );
    }

    /**
     * 이미지 번호와 로그인한 회원 번호를 함께 확인합니다.
     */
    private GeneratedImage findOwnedImage(
            Long userNum,
            Long imageId
    ) {
        return generatedImageRepository
                .findByImageIdAndUserNum(
                        imageId,
                        userNum
                )
                .orElseThrow(() ->
                        new EntityNotFoundException(
                                "생성된 이미지를 찾을 수 없습니다."
                        )
                );
    }
}