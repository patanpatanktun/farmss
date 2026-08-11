package com.farmms.backend.domain.contactgroup;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 고객 그룹 정보를 저장하는 Entity입니다.
 */
@Entity
@Table(name = "contact_group")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class ContactGroup {

    /**
     * 고객 그룹 번호
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "group_num")
    private Long groupNum;

    /**
     * 그룹을 생성한 회원 번호
     */
    @Column(name = "user_num", nullable = false)
    private Long userNum;

    /**
     * 고객 그룹 이름
     */
    @Column(name = "group_name", nullable = false, length = 100)
    private String groupName;

    /**
     * 고객 그룹 설명
     */
    @Column(name = "con_description", columnDefinition = "TEXT")
    private String conDescription;

    /**
     * 새로운 고객 그룹을 생성합니다.
     */
    public static ContactGroup create(
            Long userNum,
            String groupName,
            String conDescription
    ) {
        ContactGroup contactGroup = new ContactGroup();

        contactGroup.userNum = userNum;
        contactGroup.groupName = groupName;
        contactGroup.conDescription = conDescription;

        return contactGroup;
    }

    /**
     * 고객 그룹 정보를 수정합니다.
     */
    public void update(
            String groupName,
            String conDescription
    ) {
        this.groupName = groupName;
        this.conDescription = conDescription;
    }
}