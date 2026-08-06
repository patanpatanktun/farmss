package com.farmms.backend.domain.contact;

import java.util.Collections;
import java.util.LinkedHashSet;
import java.util.Set;

import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "contact")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Contact {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "con_num")
    private Long conNum;

    @Column(name = "user_num", nullable = false)
    private Long userNum;

    // 고객이 소속된 그룹 번호이며 그룹이 없으면 null입니다.
    @Column(name = "group_num")
    private Long groupNum;

    @Column(name = "con_name", nullable = false, length = 50)
    private String conName;

    @Column(name = "phone", nullable = false, length = 20)
    private String phone;

    @Column(name = "region", nullable = false, length = 100)
    private String region;

    /**
     * contact 테이블의 컬럼이 아니라
     * crop 테이블의 con_num, crop 컬럼을 사용합니다.
     */
    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(
            name = "crop",
            joinColumns = @JoinColumn(name = "con_num")
    )
    @Column(
            name = "crop",
            nullable = false,
            length = 100
    )
    private Set<String> crops = new LinkedHashSet<>();

    private Contact(
            Long userNum,
            Long groupNum,
            String conName,
            String phone,
            String region,
            String crop
    ) {
        this.userNum = userNum;
        this.groupNum = groupNum;
        this.conName = conName;
        this.phone = phone;
        this.region = region;

        replaceCrop(crop);
    }

    /**
     * 기존 고객 등록 코드와 호환되는 생성 메서드입니다.
     * 그룹을 선택하지 않으면 groupNum은 null로 저장됩니다.
     */
    public static Contact create(
            Long userNum,
            String conName,
            String phone,
            String region,
            String crop
    ) {
        return new Contact(
                userNum,
                null,
                conName,
                phone,
                region,
                crop
        );
    }

    /**
     * 그룹까지 선택하여 고객을 등록할 때 사용합니다.
     */
    public static Contact create(
            Long userNum,
            Long groupNum,
            String conName,
            String phone,
            String region,
            String crop
    ) {
        return new Contact(
                userNum,
                groupNum,
                conName,
                phone,
                region,
                crop
        );
    }

    /**
     * 기존 고객 수정 코드와 호환되는 메서드입니다.
     */
    public void update(
            String conName,
            String phone,
            String region,
            String crop
    ) {
        this.conName = conName;
        this.phone = phone;
        this.region = region;

        replaceCrop(crop);
    }

    /**
     * 그룹 정보까지 함께 수정할 때 사용합니다.
     */
    public void update(
            Long groupNum,
            String conName,
            String phone,
            String region,
            String crop
    ) {
        this.groupNum = groupNum;
        this.conName = conName;
        this.phone = phone;
        this.region = region;

        replaceCrop(crop);
    }

    /**
     * 기존 ContactResponse에서 getCrop()을 사용하므로
     * 대표 작물 하나를 반환하는 호환용 메서드입니다.
     */
    public String getCrop() {
        return crops.stream()
                .findFirst()
                .orElse(null);
    }

    /**
     * 고객에게 등록된 전체 재배작물을 반환합니다.
     */
    public Set<String> getCrops() {
        return Collections.unmodifiableSet(crops);
    }

    /**
     * 현재 등록된 작물을 전달받은 작물 하나로 변경합니다.
     */
    private void replaceCrop(String crop) {
        crops.clear();

        if (crop != null && !crop.isBlank()) {
            crops.add(crop.trim());
        }
    }
}