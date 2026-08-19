package com.farmms.backend.service.image;

import java.util.List;

import org.springframework.context.ApplicationEventPublisher;
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
import com.farmms.backend.dto.image.ImageGenerateAcceptedResponse;
import com.farmms.backend.dto.image.ImageGenerateRequest;
import com.farmms.backend.dto.image.ImageRegenerateRequest;
import com.farmms.backend.dto.image.ImageRegenerateResponse;
import com.farmms.backend.event.image.ImageGenerationRequestedEvent;
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

    /**
     * 이미지 재생성 기능에서는 아직
     * OpenAI Gateway를 직접 사용합니다.
     */
    private final ImageGenerationGateway
            imageGenerationGateway;

    /**
     * 생성 이미지 파일 삭제 등에 사용합니다.
     */
    private final GeneratedImageStorageService
            generatedImageStorageService;

    /**
     * 이미지 생성 Transaction이 끝난 뒤
     * 백그라운드 작업 이벤트를 발생시킵니다.
     */
    private final ApplicationEventPublisher
            applicationEventPublisher;

    /**
     * 생성 이미지 하단의 문의번호 배너
     * 후처리를 담당합니다.
     */
    private final GeneratedImagePostProcessService
            generatedImagePostProcessService;


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
     * 로그인한 사용자가 소유한
     * 생성 이미지 한 개를 조회합니다.
     *
     * 프론트에서는 이 API를 반복 호출하여
     * PENDING / PROCESSING / COMPLETED / FAILED
     * 상태를 확인할 수 있습니다.
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
     * 새로운 홍보 이미지 생성 요청을 접수합니다.
     *
     * 실제 OpenAI 이미지 생성은
     * 백그라운드 Thread에서 실행됩니다.
     *
     * 처리 순서:
     *
     * 1. 고객 확인
     * 2. 상품 확인
     * 3. 업체 전화번호 확인
     * 4. PromptHistory 저장
     * 5. GeneratedImage PENDING 저장
     * 6. 비동기 이벤트 발생
     * 7. HTTP 응답 즉시 반환
     */
    @Transactional
    public ImageGenerateAcceptedResponse generate(
            Long userNum,
            ImageGenerateRequest request
    ) {

        /*
         * 1.
         * 선택한 고객이 로그인한 회원의
         * 고객인지 확인합니다.
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
         * 2.
         * 선택한 상품이 로그인한 회원의
         * 상품인지 확인합니다.
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


        /*
         * 3.
         * 팀원이 추가한 업체 전화번호
         * 검증 기능을 그대로 유지합니다.
         */
        validateCompanyPhone(
                product
        );


        String promptText =
                request.promptText()
                        .trim();


        /*
         * 상품에 마지막 사용 프롬프트를
         * 저장합니다.
         */
        product.updatePromptText(
                promptText
        );


        /*
         * 4.
         * 사용자가 입력한 원본 프롬프트를
         * prompt_history에 저장합니다.
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
         * 상품 정보를 포함한
         * OpenAI 최종 프롬프트를 만듭니다.
         *
         * 팀원이 추가한 기존 프롬프트 생성 방식은
         * 그대로 유지합니다.
         */
        String imagePrompt =
                buildGeneratePrompt(
                        product,
                        promptText
                );


        /*
         * 5.
         * 아직 OpenAI 이미지를 생성하지 않습니다.
         *
         * 먼저 generated_image에
         * PENDING 상태의 작업을 저장합니다.
         *
         * 이 시점에는 imageUrl = null 입니다.
         */
        GeneratedImage pendingImage =
                GeneratedImage.createPending(
                        userNum,
                        product.getProNum(),
                        savedPromptHistory.getPromptId()
                );


        GeneratedImage savedImage =
                generatedImageRepository.save(
                        pendingImage
                );


        /*
         * 6.
         * 이미지 생성 이벤트를 발행합니다.
         *
         * 현재 Transaction이 정상적으로 Commit된 후
         * ImageGenerationAsyncService가 이벤트를 받아
         * 실제 OpenAI 생성을 실행합니다.
         */
        applicationEventPublisher.publishEvent(
                new ImageGenerationRequestedEvent(
                        savedImage.getImageId(),
                        imagePrompt,
                        product.getReferenceImageUrl(),
                        product.getCompany(),
                        product.getCompanyPhone()
                )
        );


        /*
         * 7.
         * OpenAI 응답을 기다리지 않고
         * 즉시 요청 접수 결과를 반환합니다.
         */
        return new ImageGenerateAcceptedResponse(
                savedImage.getImageId(),
                savedImage.getStatus(),
                "이미지 생성 요청이 접수되었습니다."
        );
    }


    /**
     * 기존 생성 이미지를 사용자의 수정 요청에 따라
     * 새로운 이미지로 재생성합니다.
     *
     * 현재 재생성 기능은 기존 동기 방식을 유지합니다.
     */
    @Transactional
    public ImageRegenerateResponse regenerate(
            Long userNum,
            ImageRegenerateRequest request
    ) {

        /*
         * 기존 이미지 소유권 확인
         */
        GeneratedImage originalImage =
                findOwnedImage(
                        userNum,
                        request.getImageId()
                );


        /*
         * 아직 백그라운드 생성이 끝나지 않았다면
         * 재생성을 허용하지 않습니다.
         */
        if (!originalImage.isCompleted()) {

            throw new IllegalStateException(
                    "이미지 생성이 완료된 후 재생성할 수 있습니다."
            );
        }


        /*
         * 기존 이미지와 연결된 상품을 조회합니다.
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


        validateCompanyPhone(
                product
        );


        /*
         * 기존 이미지의 PromptHistory를 조회합니다.
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
                request.getEditPrompt()
                        .trim();


        if (editPrompt.isBlank()) {

            throw new IllegalArgumentException(
                    "이미지 수정 요청을 입력해주세요."
            );
        }


        String regeneratePrompt =
                buildRegeneratePrompt(
                        editPrompt
                );


        /*
         * 재생성 요청도 새로운 PromptHistory로
         * 저장합니다.
         */
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


        String regeneratedImageUrl =
                null;


        try {

            /*
             * 기존 이미지를 참고 이미지로 사용하여
             * OpenAI 이미지 편집 API를 실행합니다.
             */
            regeneratedImageUrl =
                    imageGenerationGateway.generate(
                            regeneratePrompt,
                            originalImage.getImageUrl()
                    );


            /*
             * 팀원이 추가한 문의 전화번호 배너를
             * 재생성 이미지에도 적용합니다.
             */
            regeneratedImageUrl =
                    generatedImagePostProcessService
                            .addContactBannerIfStoredImage(
                                    regeneratedImageUrl,
                                    product.getCompany(),
                                    product.getCompanyPhone()
                            );


        } catch (RuntimeException error) {

            /*
             * OpenAI 생성까지 성공했지만
             * 이후 오류가 발생했을 경우
             * 생성된 파일을 정리합니다.
             */
            if (
                    regeneratedImageUrl != null
                    &&
                    !regeneratedImageUrl.isBlank()
            ) {

                generatedImageStorageService.delete(
                        regeneratedImageUrl
                );
            }


            /*
             * 실패한 재생성 요청의
             * PromptHistory를 정리합니다.
             */
            promptHistoryRepository.delete(
                    savedPromptHistory
            );

            promptHistoryRepository.flush();


            throw error;
        }


        /*
         * 기존 이미지를 덮어쓰지 않고
         * 새로운 generated_image 행으로 저장합니다.
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
     * 이미지 다운로드 횟수를 증가시키고
     * 이미지 URL을 반환합니다.
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


        /*
         * PENDING / PROCESSING / FAILED 이미지에는
         * 다운로드할 정상 이미지가 존재하지 않습니다.
         */
        if (!image.isCompleted()) {

            throw new IllegalStateException(
                    "아직 이미지 생성이 완료되지 않았습니다."
            );
        }


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


        /*
         * Background Thread에서 이미지가 생성 중인데
         * DB 행이 먼저 삭제되면 상태 저장이 실패할 수 있으므로
         * 생성 중 삭제를 제한합니다.
         */
        if (image.isGenerating()) {

            throw new IllegalStateException(
                    "이미지 생성 중에는 삭제할 수 없습니다."
            );
        }


        String imageUrl =
                image.getImageUrl();


        Long promptId =
                image.getPromptId();


        generatedImageRepository.delete(
                image
        );

        generatedImageRepository.flush();


        if (
                promptId != null
                &&
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
         * FAILED 이미지처럼 imageUrl이 없는 경우도
         * 있을 수 있으므로 null을 확인합니다.
         */
        if (
                imageUrl != null
                &&
                !imageUrl.isBlank()
        ) {

            generatedImageStorageService.delete(
                    imageUrl
            );
        }
    }


    /**
     * 신규 홍보 이미지에 사용할
     * 전체 OpenAI 프롬프트를 만듭니다.
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
                description == null
                ||
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
     * 이미지 재생성에 사용할
     * OpenAI 프롬프트를 만듭니다.
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
     * 상품에 판매 업체 전화번호가
     * 등록되어 있는지 확인합니다.
     */
    private void validateCompanyPhone(
            Product product
    ) {

        if (
                product.getCompanyPhone() == null
                ||
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