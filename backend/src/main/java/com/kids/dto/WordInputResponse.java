package com.kids.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WordInputResponse {
    private List<String> savedWords;
    private int savedCount;
    private long totalCount;
    private String message;
}
