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
import com.farmms.backend.dto.image.ImageRegenerateRequest;
import com.farmms.backend.dto.image.ImageRegenerateResponse;
import com.farmms.backend.gateway.image.ImageGenerationGateway;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;

/**
 * AI 농자재 홍보 이미지의 생성, 조회, 다운로드,
 * 삭제 및 재생성 기능을 처리합니다.
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

        return GeneratedImageResponse.from(image);
    }

    /**
     * 상품과 프롬프트를 이용하여 새로운 홍보 이미지를 생성합니다.
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

        validateCompanyPhone(product);

        String promptText =
                request.promptText().trim();

        /*
         * 상품에 마지막으로 사용한 프롬프트를 저장합니다.
         */
        product.updatePromptText(promptText);

        /*
         * 사용자가 입력한 원본 프롬프트를 이력에 저장합니다.
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

        String imageUrl = null;

        try {
            /*
             * 상품 정보를 포함한 최종 프롬프트를 생성합니다.
             */
            String imagePrompt =
                    buildGeneratePrompt(
                            product,
                            promptText
                    );

            /*
             * 참고 이미지가 있으면 이미지 편집 API,
             * 없으면 이미지 생성 API가 실행됩니다.
             */
            imageUrl =
                    imageGenerationGateway.generate(
                            imagePrompt,
                            product.getReferenceImageUrl()
                    );

            /*
             * OpenAI가 서버에 저장한 이미지라면
             * 하단에 업체명과 전화번호를 직접 합성합니다.
             */
            imageUrl =
                    addContactBannerIfStoredImage(
                            imageUrl,
                            product
                    );

        } catch (RuntimeException error) {
            /*
             * 생성 또는 합성에 실패했다면
             * 만들어진 이미지 파일을 정리합니다.
             */
            if (imageUrl != null) {
                generatedImageStorageService.delete(
                        imageUrl
                );
            }

            /*
             * 이번 요청에서 저장한 프롬프트 이력도 삭제합니다.
             */
            promptHistoryRepository.delete(
                    savedPromptHistory
            );

            promptHistoryRepository.flush();

            throw error;
        }

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
     * 기존 생성 이미지를 사용자의 수정 요청에 따라 재생성합니다.
     */
    @Transactional
    public ImageRegenerateResponse regenerate(
            Long userNum,
            ImageRegenerateRequest request
    ) {
        /*
         * 기존 이미지의 소유권을 확인합니다.
         */
        GeneratedImage originalImage =
                findOwnedImage(
                        userNum,
                        request.getImageId()
                );

        /*
         * 기존 이미지에 연결된 상품을 조회합니다.
         */
        Product product =
                productRepository
                        .findByProNumAndUserNum(
                                originalImage.getProNum(),
                                userNum
                        )
                        .orElseThrow(() ->
                                new EntityNotFoundException(
                                        "이미지에 연결된 상품을 찾을 수 없습니다."
                                )
                        );

        validateCompanyPhone(product);

        /*
         * 기존 이미지에 연결된 프롬프트 이력을 조회합니다.
         */
        PromptHistory originalPromptHistory =
                promptHistoryRepository
                        .findById(
                                originalImage.getPromptId()
                        )
                        .orElseThrow(() ->
                                new EntityNotFoundException(
                                        "기존 이미지의 프롬프트 이력을 찾을 수 없습니다."
                                )
                        );

        String editPrompt =
                request.getEditPrompt().trim();

        if (editPrompt.isBlank()) {
            throw new IllegalArgumentException(
                    "이미지 수정 요청을 입력해주세요."
            );
        }

        String regeneratePrompt =
                buildRegeneratePrompt(
                        editPrompt
                );

        PromptHistory promptHistory =
                PromptHistory.create(
                        userNum,
                        originalPromptHistory.getConNum(),
                        editPrompt
                );

        PromptHistory savedPromptHistory =
                promptHistoryRepository.save(
                        promptHistory
                );

        String regeneratedImageUrl = null;

        try {
            /*
             * 기존 이미지를 참고 이미지로 사용하여 재생성합니다.
             */
            regeneratedImageUrl =
                    imageGenerationGateway.generate(
                            regeneratePrompt,
                            originalImage.getImageUrl()
                    );

            /*
             * 재생성된 이미지에도 업체명과 전화번호를
             * 다시 정확하게 합성합니다.
             */
            regeneratedImageUrl =
                    addContactBannerIfStoredImage(
                            regeneratedImageUrl,
                            product
                    );

        } catch (RuntimeException error) {
            if (regeneratedImageUrl != null) {
                generatedImageStorageService.delete(
                        regeneratedImageUrl
                );
            }

            promptHistoryRepository.delete(
                    savedPromptHistory
            );

            promptHistoryRepository.flush();

            throw error;
        }

        /*
         * 기존 이미지를 덮어쓰지 않고
         * 새로운 생성 이미지 행으로 저장합니다.
         */
        GeneratedImage regeneratedImage =
                GeneratedImage.createRegenerated(
                        userNum,
                        originalImage.getProNum(),
                        savedPromptHistory.getPromptId(),
                        regeneratedImageUrl
                );

        GeneratedImage savedImage =
                generatedImageRepository.save(
                        regeneratedImage
                );

        return new ImageRegenerateResponse(
                originalImage.getImageId(),
                savedImage.getImageId(),
                originalImage.getImageUrl(),
                savedImage.getImageUrl(),
                editPrompt,
                "이미지 재생성이 완료되었습니다."
        );
    }

    /**
     * 이미지 다운로드 횟수를 증가시키고 URL을 반환합니다.
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
     * 생성 이미지와 연결된 프롬프트를 삭제합니다.
     *
     * MMS 발송 내역은 유지합니다.
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

        generatedImageRepository.delete(image);
        generatedImageRepository.flush();

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

        generatedImageStorageService.delete(
                imageUrl
        );
    }

    /**
     * 신규 홍보 이미지에 사용할 전체 프롬프트를 만듭니다.
     *
     * 전화번호는 Java가 직접 합성하므로
     * OpenAI 이미지에는 전화번호를 작성하지 않도록 지시합니다.
     */
    private String buildGeneratePrompt(
            Product product,
            String promptText
    ) {
        String description =
                product.getProDescription();

        if (
                description == null ||
                description.isBlank()
        ) {
            description =
                    "등록된 상품 설명 없음";
        }

        return """
                한국 농자재 판매업체가 농가 고객에게 보낼
                정사각형 홍보 포스터 이미지를 제작하세요.

                [상품 정보]
                - 상품명: %s
                - 상품 분류: %s
                - 판매 가격: %,d원
                - 판매 업체명: %s
                - 상품 설명: %s

                [사용자 추가 요청]
                %s

                [필수 제작 조건]
                - 상품명과 가격을 크고 명확하게 강조하세요.
                - 모든 홍보 문구는 한국어로 작성하세요.
                - 상품 참고 이미지가 제공되면 상품의 실제 형태와
                  포장 디자인을 최대한 유지하세요.
                - 농업 홍보물에 어울리는 신뢰감 있는 디자인을 사용하세요.
                - 존재하지 않는 가격, 지원금, 할인율, 인증 문구를
                  임의로 추가하지 마세요.
                - 이미지 맨 아래 약 17%% 영역에는 Java가 판매 업체명과
                  전화번호를 추가할 예정입니다.
                - 이미지 하단 영역에는 글자, 로고 또는 상품의 핵심 부분을
                  배치하지 말고 단순한 배경으로 비워두세요.
                - 전화번호는 AI 이미지 안에 직접 작성하지 마세요.
                """
                .formatted(
                        product.getProName(),
                        product.getCategory(),
                        product.getPrice(),
                        product.getCompany(),
                        description.trim(),
                        promptText
                );
    }

    /**
     * 이미지 재생성에 사용할 프롬프트를 만듭니다.
     */
    private String buildRegeneratePrompt(
            String editPrompt
    ) {
        return """
                제공된 기존 홍보 이미지를 기준으로 이미지를 수정하세요.

                기존 이미지의 전체적인 디자인을 최대한 그대로 유지하세요.

                반드시 유지할 요소:
                - 전체 레이아웃
                - 배경
                - 색상 구성
                - 상품 이미지
                - 로고
                - 글자 배치
                - 기존 문구
                - 이미지 비율
                - 전체 디자인 스타일

                이미지 맨 아래 약 17%% 영역에는 서버가
                판매 업체명과 전화번호를 다시 추가합니다.

                따라서 하단 연락처 영역에는 새로운 글자나
                중요한 상품 요소를 배치하지 마세요.

                전화번호를 AI가 직접 작성하지 마세요.

                아래 사용자가 요청한 부분만 수정하세요.

                [수정 요청]
                %s

                수정 요청과 관계없는 다른 문구나 숫자는
                불필요하게 변경하지 마세요.

                기존 이미지를 새롭게 디자인하는 것이 아니라,
                기존 이미지에서 사용자가 요청한 부분만
                자연스럽게 변경된 결과를 만들어주세요.
                """
                .formatted(
                        editPrompt
                );
    }

    /**
     * OpenAI가 서버의 uploads/generated 폴더에 저장한
     * 이미지에만 업체 연락처 배너를 추가합니다.
     *
     * Mock Gateway가 반환하는 외부 URL은
     * 로컬 파일이 아니므로 그대로 반환합니다.
     */
    /**
     * 서버에 저장된 OpenAI 생성 이미지에
     * 정확한 문의 전화번호 배너를 추가합니다.
     */
    private String addContactBannerIfStoredImage(
            String imageUrl,
            Product product
    ) {
        if (
                imageUrl == null ||
                imageUrl.isBlank()
        ) {
            throw new IllegalStateException(
                    "생성된 이미지 주소가 존재하지 않습니다."
            );
        }

        /*
         * 외부 Mock 이미지만 후처리에서 제외합니다.
         *
         * 다음 두 형식을 모두 허용합니다.
         *
         * /uploads/generated/파일.png
         * http://localhost:8082/uploads/generated/파일.png
         */
        if (
                !imageUrl.contains(
                        "/uploads/generated/"
                )
        ) {
            return imageUrl;
        }

        /*
         * 전체 URL로 반환된 경우 로컬 이미지 경로로 변경합니다.
         */
        String localImageUrl =
                extractGeneratedImageUrl(
                        imageUrl
                );

        String processedImageUrl =
                generatedImageStorageService
                        .addCompanyContactBanner(
                                localImageUrl,
                                product.getCompany(),
                                product.getCompanyPhone()
                        );

        System.out.println(
                "[FarMMS] 문의 배너 후처리 완료: "
                + processedImageUrl
        );

        return processedImageUrl;
    }

    /**
     * 전체 이미지 URL에서 서버 내부 이미지 경로만 추출합니다.
     *
     * 예:
     * http://localhost:8082/uploads/generated/abc.png
     * -> /uploads/generated/abc.png
     */
    private String extractGeneratedImageUrl(
            String imageUrl
    ) {
        int generatedPathIndex =
                imageUrl.indexOf(
                        "/uploads/generated/"
                );

        if (generatedPathIndex < 0) {
            throw new IllegalArgumentException(
                    "생성 이미지 주소가 올바르지 않습니다."
            );
        }

        return imageUrl.substring(
                generatedPathIndex
        );
    }

    /**
     * 상품에 판매 업체 전화번호가 등록되어 있는지 확인합니다.
     */
    private void validateCompanyPhone(
            Product product
    ) {
        if (
                product.getCompanyPhone() == null ||
                product.getCompanyPhone().isBlank()
        ) {
            throw new IllegalArgumentException(
                    "상품에 판매 업체 전화번호가 등록되어 있지 않습니다. "
                    + "상품 관리에서 전화번호를 입력한 후 다시 시도해주세요."
            );
        }
    }

    /**
     * 이미지 번호와 회원 번호를 함께 확인합니다.
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