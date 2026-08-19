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
 *
 * 처리 순서:
 *
 * PENDING
 * ↓
 * PROCESSING
 * ↓
 * OpenAI 이미지 생성
 * ↓
 * 문의 전화번호 배너 후처리
 * ↓
 * COMPLETED
 *
 * 오류 발생 시:
 *
 * PROCESSING
 * ↓
 * FAILED
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class ImageGenerationAsyncService {

    /**
     * 실제 OpenAI 또는 Mock 이미지 생성을 담당하는 Gateway입니다.
     */
    private final ImageGenerationGateway
            imageGenerationGateway;

    /**
     * 생성 이미지 파일 저장 및 삭제를 담당합니다.
     */
    private final GeneratedImageStorageService
            generatedImageStorageService;

    /**
     * 생성 이미지 하단에 정확한 문의 전화번호를
     * Java로 합성하는 후처리 Service입니다.
     */
    private final GeneratedImagePostProcessService
            generatedImagePostProcessService;

    /**
     * generated_image 테이블의
     * PENDING / PROCESSING / COMPLETED / FAILED
     * 상태 변경을 담당합니다.
     */
    private final GeneratedImageStatusService
            generatedImageStatusService;


    /**
     * 이미지 생성 요청의 DB Transaction이
     * 정상적으로 COMMIT된 후 실행합니다.
     *
     * @Async를 사용하므로 실제 OpenAI 요청은
     * HTTP 요청 Thread가 아닌 별도의
     * imageGenerationExecutor Thread에서 실행됩니다.
     */
    @Async("imageGenerationExecutor")
    @TransactionalEventListener(
            phase = TransactionPhase.AFTER_COMMIT
    )
    public void generateInBackground(
            ImageGenerationRequestedEvent event
    ) {

        /*
         * 전체 이미지 생성 시간을 측정합니다.
         */
        long startTime =
                System.currentTimeMillis();


        /*
         * 생성 또는 후처리된 이미지 주소입니다.
         *
         * 작업 실패 시 생성된 파일을
         * 정리하기 위해 밖에서 선언합니다.
         */
        String generatedImageUrl =
                null;


        try {

            /*
             * 1.
             * DB 상태를
             *
             * PENDING → PROCESSING
             *
             * 으로 변경합니다.
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
             * 2.
             * 실제 OpenAI 이미지 생성입니다.
             *
             * 지금까지 약 30초 ~ 1분 정도 걸리던
             * 부분이 여기입니다.
             *
             * 하지만 이제 HTTP 요청 Thread가 아니라
             * 백그라운드 Thread에서 실행되므로
             * 사용자는 이 작업이 끝날 때까지
             * HTTP 응답을 기다릴 필요가 없습니다.
             */
            generatedImageUrl =
                    imageGenerationGateway.generate(
                            event.imagePrompt(),
                            event.referenceImageUrl()
                    );


            log.info(
                    "[IMAGE ASYNC] AI 이미지 생성 완료"
                    + " - imageId={}"
                    + ", imageUrl={}",
                    event.imageId(),
                    generatedImageUrl
            );


            /*
             * 3.
             * 팀원이 추가한 이미지 후처리를
             * 그대로 유지합니다.
             *
             * OpenAI가 생성한 이미지 하단에
             * 정확한 판매 업체 문의 전화번호를
             * Java 코드로 합성합니다.
             */
            generatedImageUrl =
                    generatedImagePostProcessService
                            .addContactBannerIfStoredImage(
                                    generatedImageUrl,
                                    event.company(),
                                    event.companyPhone()
                            );


            /*
             * 4.
             * 모든 이미지 생성 및 후처리가
             * 정상적으로 완료되면:
             *
             * PROCESSING → COMPLETED
             *
             * 최종 imageUrl도 DB에 저장합니다.
             */
            generatedImageStatusService
                    .markCompleted(
                            event.imageId(),
                            generatedImageUrl
                    );


            /*
             * 전체 처리 시간 기록
             */
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
             * OpenAI 이미지 생성까지 성공했지만
             * 이후 Java 후처리 또는 DB 저장에서
             * 오류가 발생한 경우,
             *
             * 서버에 남아 있는 불필요한 이미지 파일을
             * 정리합니다.
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
                     * 이미지 파일 삭제 실패가
                     * 원래 이미지 생성 오류를
                     * 덮어쓰면 안 되므로 로그만 남깁니다.
                     */
                    log.warn(
                            "[IMAGE ASYNC] 실패 이미지 파일 정리 실패"
                            + " - imageId={}",
                            event.imageId(),
                            cleanupError
                    );
                }
            }


            /*
             * 5.
             * 이미지 생성 실패 상태를 DB에 저장합니다.
             *
             * PROCESSING → FAILED
             */
            try {

                generatedImageStatusService
                        .markFailed(
                                event.imageId(),
                                error.getMessage()
                        );

            } catch (Exception statusError) {

                /*
                 * 실패 상태 저장 자체에서도 오류가 발생했다면
                 * 서버 로그에 반드시 남깁니다.
                 */
                log.error(
                        "[IMAGE ASYNC] FAILED 상태 저장 실패"
                        + " - imageId={}",
                        event.imageId(),
                        statusError
                );
            }


            /*
             * 실제 이미지 생성 실패 원인을 로그에 기록합니다.
             */
            log.error(
                    "[IMAGE ASYNC] 이미지 생성 실패"
                    + " - imageId={}",
                    event.imageId(),
                    error
            );
        }
    }
}