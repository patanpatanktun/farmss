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

    /**
     * 고객이 소속된 그룹 번호입니다.
     * 그룹이 없으면 null입니다.
     */
    @Column(name = "group_num")
    private Long groupNum;

    @Column(
            name = "con_name",
            nullable = false,
            length = 50
    )
    private String conName;

    @Column(
            name = "phone",
            nullable = false,
            length = 20
    )
    private String phone;

    @Column(
            name = "region",
            nullable = false,
            length = 100
    )
    private String region;

    /**
     * contact 테이블 컬럼이 아니라
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
    private Set<String> crops =
            new LinkedHashSet<>();

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
     * 그룹 없이 고객을 생성합니다.
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
     * 그룹을 선택하여 고객을 생성합니다.
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
     * 그룹을 변경하지 않고 고객 정보를 수정합니다.
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
     * 그룹을 포함하여 고객 정보를 수정합니다.
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
     * 고객이 소속된 그룹을 변경합니다.
     * null을 전달하면 그룹에서 제외됩니다.
     */
    public void changeGroup(Long groupNum) {
        this.groupNum = groupNum;
    }

    /**
     * 대표 재배작물 하나를 반환합니다.
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
     * 현재 재배작물을 전달받은 작물로 변경합니다.
     */
    private void replaceCrop(String crop) {
        crops.clear();

        if (crop != null && !crop.isBlank()) {
            crops.add(crop.trim());
        }
    }
}