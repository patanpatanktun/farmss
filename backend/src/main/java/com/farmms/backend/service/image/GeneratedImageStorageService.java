package com.farmms.backend.service.image;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Base64;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

/**
 * OpenAI가 생성한 Base64 이미지를
 * 서버의 실제 PNG 파일로 저장하고 삭제합니다.
 *
 * 또한 생성된 이미지 URL을
 * 실제 서버 파일 경로로 변환합니다.
 */
@Service
public class GeneratedImageStorageService {

    /**
     * 생성 이미지가 저장되는 실제 폴더입니다.
     *
     * 기본값:
     * uploads/generated
     */
    private final Path generatedImageDirectory;

    public GeneratedImageStorageService(
            @Value(
                    "${app.upload.generated-image-directory:"
                    + "uploads/generated}"
            )
            String generatedImageDirectory
    ) {

        this.generatedImageDirectory =
                Path.of(generatedImageDirectory)
                        .toAbsolutePath()
                        .normalize();

        createUploadDirectory();
    }

    /**
     * OpenAI API가 반환한 Base64 문자열을
     * PNG 파일로 저장하고 브라우저용 주소를 반환합니다.
     */
    public String storeBase64Image(
            String base64Image
    ) {

        if (
                base64Image == null ||
                base64Image.isBlank()
        ) {
            throw new IllegalArgumentException(
                    "생성된 이미지 데이터가 존재하지 않습니다."
            );
        }

        byte[] imageBytes;

        try {

            imageBytes =
                    Base64.getDecoder()
                            .decode(
                                    base64Image
                            );

        } catch (IllegalArgumentException error) {

            throw new IllegalStateException(
                    "생성 이미지 데이터를 변환할 수 없습니다.",
                    error
            );
        }

        if (imageBytes.length == 0) {

            throw new IllegalStateException(
                    "생성된 이미지 파일이 비어 있습니다."
            );
        }

        /*
         * 파일명이 겹치지 않도록
         * UUID를 사용합니다.
         */
        String storedFileName =
                UUID.randomUUID()
                + ".png";

        Path targetPath =
                generatedImageDirectory
                        .resolve(
                                storedFileName
                        )
                        .normalize();

        validateTargetPath(
                targetPath
        );

        try {

            Files.write(
                    targetPath,
                    imageBytes
            );

        } catch (IOException error) {

            throw new IllegalStateException(
                    "생성 이미지를 서버에 저장하지 못했습니다.",
                    error
            );
        }

        /*
         * DB에 저장하고
         * 브라우저에서 사용할 URL입니다.
         */
        return "/uploads/generated/"
                + storedFileName;
    }

    /**
     * generated_image 테이블에 저장되어 있는
     * 이미지 URL을 서버의 실제 파일 경로로 변환합니다.
     *
     * 예:
     *
     * DB:
     * /uploads/generated/abc.png
     *
     * 실제 파일:
     * C:/.../uploads/generated/abc.png
     *
     * 이미지 재생성 시 기존 이미지를
     * OpenAI Image Edit API에 보내기 위해 사용합니다.
     */
    public Path resolveStoredImagePath(
            String imageUrl
    ) {

        /*
         * 이미지 URL 검증
         */
        if (
                imageUrl == null ||
                imageUrl.isBlank()
        ) {

            throw new IllegalArgumentException(
                    "생성 이미지 주소가 필요합니다."
            );
        }

        /*
         * HTTP 외부 이미지는
         * 이 서버의 로컬 파일이 아니기 때문에
         * Path로 변환할 수 없습니다.
         */
        if (
                imageUrl.startsWith("http://") ||
                imageUrl.startsWith("https://")
        ) {

            throw new IllegalArgumentException(
                    "외부 이미지 주소는 서버 파일 경로로 변환할 수 없습니다."
            );
        }

        String normalizedUrl =
                imageUrl
                        .trim()
                        .replace(
                                "\\",
                                "/"
                        );

        /*
         * 생성 이미지 URL인지 확인합니다.
         *
         * 상품 이미지:
         * /uploads/products/...
         *
         * AI 생성 이미지:
         * /uploads/generated/...
         */
        if (
                !normalizedUrl.startsWith(
                        "/uploads/generated/"
                )
        ) {

            throw new IllegalArgumentException(
                    "생성 이미지 주소가 올바르지 않습니다."
            );
        }

        String fileName;

        try {

            fileName =
                    Path.of(
                            normalizedUrl
                    )
                    .getFileName()
                    .toString();

        } catch (Exception error) {

            throw new IllegalArgumentException(
                    "생성 이미지 주소가 올바르지 않습니다."
            );
        }

        Path targetPath =
                generatedImageDirectory
                        .resolve(
                                fileName
                        )
                        .normalize();

        /*
         * uploads/generated 바깥의 파일을
         * 접근하지 못하도록 검사합니다.
         */
        validateTargetPath(
                targetPath
        );

        /*
         * 실제 파일 존재 여부도 확인합니다.
         */
        if (
                !Files.exists(targetPath) ||
                !Files.isRegularFile(targetPath)
        ) {

            throw new IllegalStateException(
                    "서버에 저장된 생성 이미지 파일을 찾을 수 없습니다."
            );
        }

        return targetPath;
    }

    /**
     * 서버에 저장된 생성 이미지 파일을 삭제합니다.
     */
    public void delete(
            String imageUrl
    ) {

        if (
                imageUrl == null ||
                imageUrl.isBlank()
        ) {
            return;
        }

        /*
         * OpenAI 또는 외부 Mock 이미지처럼
         * HTTP 주소인 경우 서버 로컬 파일이 아니므로
         * 삭제하지 않습니다.
         */
        if (
                imageUrl.startsWith("http://") ||
                imageUrl.startsWith("https://")
        ) {
            return;
        }

        String fileName;

        try {

            fileName =
                    Path.of(
                            imageUrl
                    )
                    .getFileName()
                    .toString();

        } catch (Exception error) {

            throw new IllegalArgumentException(
                    "올바르지 않은 생성 이미지 주소입니다."
            );
        }

        Path targetPath =
                generatedImageDirectory
                        .resolve(
                                fileName
                        )
                        .normalize();

        validateTargetPath(
                targetPath
        );

        try {

            Files.deleteIfExists(
                    targetPath
            );

        } catch (IOException error) {

            throw new IllegalStateException(
                    "생성 이미지 파일 삭제 중 오류가 발생했습니다.",
                    error
            );
        }
    }

    /**
     * 생성 이미지 저장 폴더가 없으면 생성합니다.
     */
    private void createUploadDirectory() {

        try {

            Files.createDirectories(
                    generatedImageDirectory
            );

        } catch (IOException error) {

            throw new IllegalStateException(
                    "생성 이미지 저장 폴더를 만들 수 없습니다.",
                    error
            );
        }
    }

    /**
     * 파일 저장 / 조회 / 삭제 경로가
     * 지정된 generated 이미지 폴더 바깥을
     * 가리키지 않는지 검사합니다.
     */
    private void validateTargetPath(
            Path targetPath
    ) {

        if (
                !targetPath.startsWith(
                        generatedImageDirectory
                )
        ) {

            throw new IllegalArgumentException(
                    "올바르지 않은 생성 이미지 저장 경로입니다."
            );
        }
    }
}