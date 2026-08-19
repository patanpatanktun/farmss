package com.farmms.backend.config;

import java.util.concurrent.Executor;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;

/**
 * FarMMS에서 사용하는 비동기 작업용 설정 클래스입니다.
 *
 * MMS 발송과 AI 이미지 생성 작업을
 * 서로 다른 Thread Pool에서 처리합니다.
 *
 * 이렇게 분리하면 MMS 발송 요청이 많더라도
 * 이미지 생성 작업이 영향을 덜 받고,
 *
 * 반대로 이미지 생성이 오래 걸리더라도
 * MMS 발송 Thread를 차지하지 않습니다.
 */
@Configuration
@EnableAsync
public class AsyncConfig {

    /**
     * MMS 발송 전용 Thread Pool입니다.
     *
     * 사용자가 여러 고객에게 MMS를 발송할 때
     * HTTP 요청 Thread에서 직접 처리하지 않고
     * 별도 Thread에서 발송 작업을 수행합니다.
     *
     * @return MMS 비동기 작업 Executor
     */
    @Bean(name = "mmsExecutor")
    public Executor mmsExecutor() {

        ThreadPoolTaskExecutor executor =
                new ThreadPoolTaskExecutor();

        /*
         * 평상시 유지할 기본 Thread 수
         */
        executor.setCorePoolSize(3);

        /*
         * 요청이 많을 때 사용할 최대 Thread 수
         */
        executor.setMaxPoolSize(10);

        /*
         * 모든 Thread가 사용 중일 경우
         * 대기시킬 작업 개수
         */
        executor.setQueueCapacity(100);

        /*
         * 콘솔 로그에서 MMS 작업 Thread를
         * 쉽게 확인하기 위한 이름
         */
        executor.setThreadNamePrefix(
                "mms-"
        );

        executor.initialize();

        return executor;
    }


    /**
     * AI 이미지 생성 전용 Thread Pool입니다.
     *
     * OpenAI 이미지 생성이 약 30초~1분 정도
     * 걸릴 수 있으므로 HTTP 요청 Thread와 분리합니다.
     *
     * 사용자는 이미지 생성 요청만 접수한 뒤
     * 바로 응답을 받을 수 있고,
     *
     * 실제 OpenAI 이미지 생성은
     * 이 Thread Pool에서 백그라운드로 실행됩니다.
     *
     * @return 이미지 생성 비동기 작업 Executor
     */
    @Bean(name = "imageGenerationExecutor")
    public Executor imageGenerationExecutor() {

        ThreadPoolTaskExecutor executor =
                new ThreadPoolTaskExecutor();

        /*
         * 기본적으로 동시에 처리할
         * 이미지 생성 작업 수입니다.
         *
         * OpenAI API 호출은 오래 걸릴 수 있으므로
         * 처음에는 너무 크게 잡지 않습니다.
         */
        executor.setCorePoolSize(2);

        /*
         * 요청이 몰렸을 때 동시에 처리할
         * 최대 이미지 생성 작업 수입니다.
         */
        executor.setMaxPoolSize(4);

        /*
         * 현재 모든 이미지 생성 Thread가
         * 사용 중이라면 최대 50개의 작업을
         * Queue에서 기다리게 합니다.
         */
        executor.setQueueCapacity(50);

        /*
         * 콘솔에서 이미지 생성 Thread인지
         * 알아보기 쉽게 이름을 지정합니다.
         *
         * 예:
         * image-gen-1
         * image-gen-2
         */
        executor.setThreadNamePrefix(
                "image-gen-"
        );

        /*
         * 서버 종료 시 진행 중인 이미지 생성 작업을
         * 가능한 한 정상적으로 마무리하도록 기다립니다.
         */
        executor.setWaitForTasksToCompleteOnShutdown(
                true
        );

        /*
         * 서버 종료 시 최대 30초까지 기다립니다.
         */
        executor.setAwaitTerminationSeconds(
                30
        );

        executor.initialize();

        return executor;
    }
}