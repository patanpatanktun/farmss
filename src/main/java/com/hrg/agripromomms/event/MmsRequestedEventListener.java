package com.hrg.agripromomms.event;

import com.hrg.agripromomms.service.MmsDispatchService;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

/** 발송 이력이 DB에 커밋된 뒤 실제 SOLAPI 전송 처리를 시작합니다. */
@Component
@RequiredArgsConstructor
public class MmsRequestedEventListener {

    private final MmsDispatchService dispatchService;

    @Async
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handle(MmsRequestedEvent event) {
        dispatchService.dispatch(
                event.mmsNums(),
                event.title(),
                event.content());
    }
}
