package com.kids.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "words")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Word {

    @Id
    @Column(name = "value", nullable = false, length = 255, columnDefinition = "VARCHAR(255) COLLATE utf8mb4_bin")
    private String value;
}
