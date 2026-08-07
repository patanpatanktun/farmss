package com.hrg.agripromomms.service;

import com.hrg.agripromomms.domain.image.GeneratedImageRepository;
import com.hrg.agripromomms.dto.GeneratedImageResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/** 사용자가 생성한 이미지 목록을 조회합니다. */
@Service
@RequiredArgsConstructor
public class GeneratedImageQueryService {

    private final GeneratedImageRepository generatedImageRepository;

    @Transactional(readOnly = true)
    public List<GeneratedImageResponse> getImages(Long userNum) {
        return generatedImageRepository.findAllOwnedBy(userNum).stream()
                .map(i -> new GeneratedImageResponse(
                        i.getImageId(),
                        i.getImageUrl(),
                        i.getStatus(),
                        i.getProduct().getProNum(),
                        i.getProduct().getProName(),
                        i.getCreateDay()))
                .toList();
    }
}
