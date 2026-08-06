package com.farmms.backend.service.image;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.farmms.backend.domain.contact.ContactRepository;
import com.farmms.backend.domain.image.GeneratedImage;
import com.farmms.backend.domain.image.GeneratedImageRepository;
import com.farmms.backend.domain.product.Product;
import com.farmms.backend.domain.product.ProductRepository;
import com.farmms.backend.dto.image.GeneratedImageResponse;
import com.farmms.backend.dto.image.ImageDownloadResponse;
import com.farmms.backend.dto.image.ImageGenerateRequest;
import com.farmms.backend.gateway.image.ImageGenerationGateway;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class GeneratedImageService {

    private final GeneratedImageRepository generatedImageRepository;
    private final ContactRepository contactRepository;
    private final ProductRepository productRepository;
    private final ImageGenerationGateway imageGenerationGateway;

    /**
     * 로그인한 사용자가 소유한 생성 이미지 목록을 조회합니다.
     */
    public List<GeneratedImageResponse> findAll(Long userNum) {

        return generatedImageRepository
                .findAllByUserNumOrderByCreateDayDesc(userNum)
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
        GeneratedImage image = findOwnedImage(
                userNum,
                imageId
        );

        return GeneratedImageResponse.from(image);
    }

    /**
     * 프롬프트를 이용해 홍보 이미지를 생성합니다.
     *
     * 프롬프트는 product.prompt_text에 최신 값으로 저장하고,
     * 생성 결과는 generated_image에 저장합니다.
     */
    @Transactional
    public GeneratedImageResponse generate(
            Long userNum,
            ImageGenerateRequest request
    ) {
        // 선택한 고객이 로그인 사용자의 고객인지 확인합니다.
        contactRepository
                .findByConNumAndUserNum(
                        request.conNum(),
                        userNum
                )
                .orElseThrow(() ->
                        new EntityNotFoundException(
                                "고객을 찾을 수 없습니다."
                        ));

        // 선택한 상품이 로그인 사용자의 상품인지 확인합니다.
        Product product = productRepository
                .findByProNumAndUserNum(
                        request.proNum(),
                        userNum
                )
                .orElseThrow(() ->
                        new EntityNotFoundException(
                                "상품을 찾을 수 없습니다."
                        ));

        String promptText =
                request.promptText().trim();

        // 상품에 사용한 최신 프롬프트를 저장합니다.
        product.updatePromptText(promptText);

        // 현재는 Mock Gateway가 이미지 URL을 반환합니다.
        String imageUrl =
                imageGenerationGateway.generate(promptText);

        // 생성된 이미지를 상품과 연결하여 저장합니다.
        GeneratedImage generatedImage =
                GeneratedImage.create(
                        product.getProNum(),
                        imageUrl
                );

        GeneratedImage savedImage =
                generatedImageRepository.save(
                        generatedImage
                );

        return GeneratedImageResponse.from(savedImage);
    }

    /**
     * 이미지 다운로드 횟수를 1 증가시키고 URL을 반환합니다.
     */
    @Transactional
    public ImageDownloadResponse download(
            Long userNum,
            Long imageId
    ) {
        GeneratedImage image = findOwnedImage(
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
     * 이미지 번호와 로그인 회원 번호를 함께 확인합니다.
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
                        ));
    }
}