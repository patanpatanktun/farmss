package com.farmms.backend.service.image;

import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

import com.farmms.backend.event.image.ImageGenerationRequestedEvent;
import com.farmms.backend.gateway.image.ImageGenerationGateway;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * AI 이미지 생성을 백그라운드에서 처리하는 Service입니다.
 *
 * HTTP 요청 Thread에서 OpenAI 호출을 직접 실행하지 않고,
 * imageGenerationExecutor 전용 Thread에서 실행합니다.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class ImageGenerationAsyncService {

    private final ImageGenerationGateway
            imageGenerationGateway;

    private final GeneratedImageStorageService
            generatedImageStorageService;

    private final GeneratedImagePostProcessService
            generatedImagePostProcessService;

    private final GeneratedImageStatusService
            generatedImageStatusService;

    /**
     * 이미지 생성 요청의 DB Transaction이
     * 정상적으로 COMMIT된 후 실행합니다.
     */
    @Async("imageGenerationExecutor")
    @TransactionalEventListener(
            phase = TransactionPhase.AFTER_COMMIT
    )
    public void generateInBackground(
            ImageGenerationRequestedEvent event
    ) {

        long startTime =
                System.currentTimeMillis();

        String generatedImageUrl =
                null;

        try {

            /*
             * PENDING → PROCESSING
             */
            generatedImageStatusService
                    .markProcessing(
                            event.imageId()
                    );

            log.info(
                    "[IMAGE ASYNC] 이미지 생성 시작"
                    + " - imageId={}"
                    + ", thread={}",
                    event.imageId(),
                    Thread.currentThread()
                            .getName()
            );

            /*
             * AI 이미지 생성
             */
            generatedImageUrl =
                    imageGenerationGateway.generate(
                            event.imagePrompt(),
                            event.referenceImageUrl()
                    );

            /*
             * 이미지 주소 자체는 로그에 남기지 않습니다.
             */
            log.info(
                    "[IMAGE ASYNC] AI 이미지 생성 완료"
                    + " - imageId={}",
                    event.imageId()
            );

            /*
             * 문의 정보 배너 후처리
             */
            generatedImageUrl =
                    generatedImagePostProcessService
                            .addContactBannerIfStoredImage(
                                    generatedImageUrl,
                                    event.company(),
                                    event.companyPhone()
                            );

            /*
             * PROCESSING → COMPLETED
             */
            generatedImageStatusService
                    .markCompleted(
                            event.imageId(),
                            generatedImageUrl
                    );

            long elapsedTime =
                    System.currentTimeMillis()
                    - startTime;

            log.info(
                    "[IMAGE ASYNC] 이미지 생성 최종 완료"
                    + " - imageId={}"
                    + ", elapsed={}ms",
                    event.imageId(),
                    elapsedTime
            );

        } catch (Exception error) {

            /*
             * 생성된 파일이 남아 있다면 정리합니다.
             */
            if (
                    generatedImageUrl != null
                    &&
                    !generatedImageUrl.isBlank()
                    &&
                    generatedImageUrl.contains(
                            "/uploads/generated/"
                    )
            ) {

                try {

                    generatedImageStorageService
                            .delete(
                                    generatedImageUrl
                            );

                } catch (Exception cleanupError) {

                    /*
                     * 예외 전체 내용 대신
                     * 예외 종류만 기록합니다.
                     */
                    log.warn(
                            "[IMAGE ASYNC] 실패 이미지 파일 정리 실패"
                            + " - imageId={}"
                            + ", exceptionType={}",
                            event.imageId(),
                            cleanupError.getClass()
                                    .getSimpleName()
                    );
                }
            }

            /*
             * PROCESSING → FAILED
             *
             * 외부 서비스의 실제 오류 메시지를
             * DB에 그대로 저장하지 않습니다.
             */
            try {

                generatedImageStatusService
                        .markFailed(
                                event.imageId(),
                                "이미지 생성 중 오류가 발생했습니다."
                        );

            } catch (Exception statusError) {

                log.error(
                        "[IMAGE ASYNC] FAILED 상태 저장 실패"
                        + " - imageId={}"
                        + ", exceptionType={}",
                        event.imageId(),
                        statusError.getClass()
                                .getSimpleName()
                );
            }

            /*
             * 오류 내용 전체가 아닌
             * 오류 종류만 서버 로그에 기록합니다.
             */
            log.error(
                    "[IMAGE ASYNC] 이미지 생성 실패"
                    + " - imageId={}"
                    + ", exceptionType={}",
                    event.imageId(),
                    error.getClass()
                            .getSimpleName()
            );
        }
    }
}