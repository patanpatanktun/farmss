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
 */
@Service
public class GeneratedImageStorageService {

    /**
     * 생성 이미지가 저장되는 실제 폴더입니다.
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
                            .decode(base64Image);

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

        String storedFileName =
                UUID.randomUUID() + ".png";

        Path targetPath =
                generatedImageDirectory
                        .resolve(storedFileName)
                        .normalize();

        validateTargetPath(targetPath);

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

        return "/uploads/generated/"
                + storedFileName;
    }

    /**
     * 서버에 저장된 생성 이미지 파일을 삭제합니다.
     */
    public void delete(String imageUrl) {
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
                    Path.of(imageUrl)
                            .getFileName()
                            .toString();

        } catch (Exception error) {
            throw new IllegalArgumentException(
                    "올바르지 않은 생성 이미지 주소입니다."
            );
        }

        Path targetPath =
                generatedImageDirectory
                        .resolve(fileName)
                        .normalize();

        validateTargetPath(targetPath);

        try {
            Files.deleteIfExists(targetPath);

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
     * 파일 저장 또는 삭제 경로가 지정된 폴더 바깥을
     * 가리키지 않는지 확인합니다.
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