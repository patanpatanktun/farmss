package com.farmms.backend.config;

import java.util.concurrent.Executor;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;

/**
 * MMS 발송 작업을 비동기로 처리하기 위한 설정 클래스입니다.
 *
 * 사용자가 수백 명에게 MMS를 발송할 때 모든 전송이 끝날 때까지
 * HTTP 요청을 기다리게 하지 않고 별도 작업 스레드에서 처리합니다.
 */
@Configuration
@EnableAsync
public class AsyncConfig {

    /**
     * MMS 발송 전용 스레드 풀을 생성합니다.
     *
     * @return MMS 비동기 작업을 실행할 Executor
     */
    @Bean(name = "mmsExecutor")
    public Executor mmsExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();

        // 평상시 유지할 기본 작업 스레드 수입니다.
        executor.setCorePoolSize(3);

        // 요청이 많을 때 늘어날 수 있는 최대 스레드 수입니다.
        executor.setMaxPoolSize(10);

        // 모든 스레드가 사용 중일 때 대기시킬 작업 수입니다.
        executor.setQueueCapacity(100);

        // 로그에서 MMS 작업 스레드를 쉽게 구분하기 위한 이름입니다.
        executor.setThreadNamePrefix("mms-");

        executor.initialize();
        return executor;
    }
}
