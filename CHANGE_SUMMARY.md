# 기존 코드에서 변경된 이름

| 이전 테스트 코드 | 현재 MySQL 테이블 기준 |
|---|---|
| Customer | Contact |
| customerId | conNum |
| PromoImage | GeneratedImage |
| imageId | imageNum 또는 imageId |
| MmsSendHistory + MmsSendTarget | MmsHistory |
| X-USER-ID | X-USER-NUM |
| customerIds | contactNums |

현재 `mms_history`는 수신자 한 명당 한 행을 저장합니다.
