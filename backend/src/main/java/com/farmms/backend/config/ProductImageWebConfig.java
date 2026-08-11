package com.farmms.backend.config;

import java.nio.file.Path;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * 서버에 저장된 상품 참고 이미지와 AI 생성 이미지를
 * 브라우저에서 조회할 수 있도록 연결합니다.
 */
@Configuration
public class ProductImageWebConfig
        implements WebMvcConfigurer {

    private final String productUploadDirectory;
    private final String generatedImageDirectory;

    public ProductImageWebConfig(
            @Value(
                    "${app.upload.product-directory:"
                    + "uploads/products}"
            )
            String productUploadDirectory,

            @Value(
                    "${app.upload.generated-image-directory:"
                    + "uploads/generated}"
            )
            String generatedImageDirectory
    ) {
        this.productUploadDirectory =
                productUploadDirectory;

        this.generatedImageDirectory =
                generatedImageDirectory;
    }

    /**
     * 서버의 업로드 폴더를 브라우저 URL과 연결합니다.
     */
    @Override
    public void addResourceHandlers(
            ResourceHandlerRegistry registry
    ) {
        /*
         * 상품 참고 이미지 경로를 연결합니다.
         *
         * /uploads/products/파일명
         * → 실제 uploads/products/파일명
         */
        registry
                .addResourceHandler(
                        "/uploads/products/**"
                )
                .addResourceLocations(
                        createResourceLocation(
                                productUploadDirectory
                        )
                );

        /*
         * OpenAI 생성 이미지 경로를 연결합니다.
         *
         * /uploads/generated/파일명
         * → 실제 uploads/generated/파일명
         */
        registry
                .addResourceHandler(
                        "/uploads/generated/**"
                )
                .addResourceLocations(
                        createResourceLocation(
                                generatedImageDirectory
                        )
                );
    }

    /**
     * 실제 폴더 경로를 Spring 정적 리소스 경로 형식으로 변환합니다.
     */
    private String createResourceLocation(
            String directory
    ) {
        String resourceLocation =
                Path.of(directory)
                        .toAbsolutePath()
                        .normalize()
                        .toUri()
                        .toString();

        if (!resourceLocation.endsWith("/")) {
            resourceLocation += "/";
        }

        return resourceLocation;
    }
}