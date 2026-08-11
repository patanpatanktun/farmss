package com.farmms.backend.config;

import java.nio.file.Path;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation
        .ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation
        .WebMvcConfigurer;

/**
 * 서버의 uploads/generated 폴더에 저장된 생성 이미지를
 * /uploads/generated/** 주소로 제공하는 설정입니다.
 */
@Configuration
public class GeneratedImageWebConfig
        implements WebMvcConfigurer {

    private final String generatedImageLocation;

    public GeneratedImageWebConfig(
            @Value(
                    "${farmms.image.storage-path:"
                    + "uploads/generated}"
            )
            String storagePath
    ) {
        String directoryUri =
                Path.of(storagePath)
                        .toAbsolutePath()
                        .normalize()
                        .toUri()
                        .toString();

        /*
         * Spring ResourceHandler가 디렉터리로 인식하도록
         * 마지막에 슬래시가 있는 주소로 정리합니다.
         */
        this.generatedImageLocation =
                directoryUri.endsWith("/")
                        ? directoryUri
                        : directoryUri + "/";
    }

    @Override
    public void addResourceHandlers(
            ResourceHandlerRegistry registry
    ) {
        registry
                .addResourceHandler(
                        "/uploads/generated/**"
                )
                .addResourceLocations(
                        generatedImageLocation
                );
    }
}