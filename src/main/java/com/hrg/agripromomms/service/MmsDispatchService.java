package com.hrg.agripromomms.service;

import com.hrg.agripromomms.domain.mms.MmsHistory;
import com.hrg.agripromomms.domain.mms.MmsHistoryRepository;
import com.hrg.agripromomms.gateway.MmsGateway;
import com.hrg.agripromomms.gateway.MmsSendCommand;
import com.hrg.agripromomms.gateway.MmsSendResult;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/** WAIT 상태의 문자 이력을 실제 Gateway에 전달하고 성공/실패 상태를 저장합니다. */
@Slf4j
@Service
@RequiredArgsConstructor
public class MmsDispatchService {

    private final MmsHistoryRepository mmsHistoryRepository;
    private final MmsGateway mmsGateway;

    /**
     * 수신자별로 SOLAPI 발송을 실행합니다.
     * 한 명의 실패가 다른 수신자의 발송을 중단시키지 않습니다.
     */
    @Transactional
    public void dispatch(List<Long> mmsNums, String title, String content) {
        List<MmsHistory> histories = mmsHistoryRepository.findAllById(mmsNums);

        for (MmsHistory history : histories) {
            MmsSendCommand command = new MmsSendCommand(
                    history.getContact().getPhone(),
                    title,
                    content);

            try {
                MmsSendResult result = mmsGateway.send(command);

                if (result.success()) {
                    history.markSuccess();
                    log.info("문자 발송 성공: mmsNum={}, providerMessageId={}",
                            history.getMmsNum(), result.providerMessageId());
                } else {
                    history.markFail();
                    log.error("문자 발송 실패: mmsNum={}, reason={}",
                            history.getMmsNum(), result.errorMessage());
                }
            } catch (RuntimeException ex) {
                history.markFail();
                log.error("문자 발송 처리 중 예외: mmsNum={}", history.getMmsNum(), ex);
            }
        }
    }
}
