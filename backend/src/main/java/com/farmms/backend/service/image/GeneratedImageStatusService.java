package com.farmms.backend.service.image;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.farmms.backend.domain.image.GeneratedImage;
import com.farmms.backend.domain.image.GeneratedImageRepository;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;

/**
 * 비동기 이미지 생성 작업의
 * 상태 변경만 담당하는 Service입니다.
 *
 * OpenAI 이미지 생성은 오래 걸릴 수 있기 때문에
 * API 호출 중에는 DB Transaction을 유지하지 않고,
 * 상태 변경이 필요한 순간에만 짧게 Transaction을 사용합니다.
 */
@Service
@RequiredArgsConstructor
public class GeneratedImageStatusService {

    private final GeneratedImageRepository
            generatedImageRepository;


    /**
     * 이미지 생성 작업을
     * PROCESSING 상태로 변경합니다.
     *
     * PENDING → PROCESSING
     *
     * @param imageId 생성 이미지 번호
     */
    @Transactional
    public void markProcessing(
            Long imageId
    ) {

        GeneratedImage image =
                findImage(
                        imageId
                );

        image.markProcessing();
    }


    /**
     * 이미지 생성 작업을
     * COMPLETED 상태로 변경합니다.
     *
     * 최종 이미지 URL도 함께 저장합니다.
     *
     * PROCESSING → COMPLETED
     *
     * @param imageId 이미지 번호
     * @param imageUrl 최종 생성 이미지 주소
     */
    @Transactional
    public void markCompleted(
            Long imageId,
            String imageUrl
    ) {

        GeneratedImage image =
                findImage(
                        imageId
                );

        image.markCompleted(
                imageUrl
        );
    }


    /**
     * 이미지 생성 중 오류가 발생하면
     * FAILED 상태로 변경합니다.
     *
     * PENDING 또는 PROCESSING → FAILED
     *
     * @param imageId 이미지 번호
     * @param errorMessage 오류 메시지
     */
    @Transactional
    public void markFailed(
            Long imageId,
            String errorMessage
    ) {

        /*
         * 비동기 작업 중 사용자가 데이터를 삭제했거나
         * 예상하지 못한 상황이 생겼을 수 있으므로
         * findById가 실패해도 추가 예외를 발생시키지 않습니다.
         */
        generatedImageRepository
                .findById(
                        imageId
                )
                .ifPresent(
                        image ->
                                image.markFailed(
                                        errorMessage
                                )
                );
    }


    /**
     * 이미지 번호로 GeneratedImage를 조회합니다.
     *
     * 상태 변경 대상이 존재하지 않으면 예외를 발생시킵니다.
     */
    private GeneratedImage findImage(
            Long imageId
    ) {

        return generatedImageRepository
                .findById(
                        imageId
                )
                .orElseThrow(() ->
                        new EntityNotFoundException(
                                "이미지 생성 작업을 찾을 수 없습니다."
                        )
                );
    }
}