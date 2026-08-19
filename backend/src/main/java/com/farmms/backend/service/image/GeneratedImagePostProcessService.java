package com.farmms.backend.service.image;

import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * OpenAI가 생성한 이미지에
 * Java 후처리를 적용하는 Service입니다.
 *
 * 현재는 생성 이미지 하단에
 * 정확한 문의 전화번호 배너를 합성합니다.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class GeneratedImagePostProcessService {

    private final GeneratedImageStorageService
            generatedImageStorageService;


    /**
     * 서버에 저장된 OpenAI 생성 이미지에
     * 판매 업체 문의 배너를 추가합니다.
     *
     * Mock Gateway처럼 외부 URL이 반환되는 경우에는
     * 로컬 파일이 아니므로 그대로 반환합니다.
     *
     * @param imageUrl 생성 이미지 URL
     * @param company 판매 업체명
     * @param companyPhone 판매 업체 전화번호
     * @return 후처리가 완료된 이미지 URL
     */
    public String addContactBannerIfStoredImage(
            String imageUrl,
            String company,
            String companyPhone
    ) {

        /*
         * 이미지 URL이 없으면
         * 후처리를 할 수 없습니다.
         */
        if (
                imageUrl == null ||
                imageUrl.isBlank()
        ) {

            throw new IllegalStateException(
                    "생성된 이미지 주소가 존재하지 않습니다."
            );
        }


        /*
         * 서버에 저장된 이미지인지 확인합니다.
         *
         * 허용 예시:
         *
         * /uploads/generated/abc.png
         *
         * http://localhost:8082/uploads/generated/abc.png
         */
        if (
                !imageUrl.contains(
                        "/uploads/generated/"
                )
        ) {

            /*
             * Mock Gateway처럼
             * 외부 이미지 URL이면 그대로 반환합니다.
             */
            return imageUrl;
        }


        /*
         * 전체 URL로 들어온 경우에도
         * 서버 내부 이미지 주소만 추출합니다.
         */
        String localImageUrl =
                extractGeneratedImageUrl(
                        imageUrl
                );


        /*
         * GeneratedImageStorageService에서
         * 실제 이미지 파일을 읽어
         * 하단 문의 배너를 합성합니다.
         */
        String processedImageUrl =
                generatedImageStorageService
                        .addCompanyContactBanner(
                                localImageUrl,
                                company,
                                companyPhone
                        );


        log.info(
                "[IMAGE POST PROCESS] 문의 배너 후처리 완료. imageUrl={}",
                processedImageUrl
        );


        return processedImageUrl;
    }


    /**
     * 전체 이미지 URL에서
     * 서버 내부 이미지 경로만 추출합니다.
     *
     * 예:
     *
     * http://localhost:8082/uploads/generated/abc.png
     *
     * ↓
     *
     * /uploads/generated/abc.png
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
}