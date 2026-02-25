package com.kids.service;

import com.kids.dto.RandomWordResponse;
import com.kids.dto.WordInputRequest;
import com.kids.dto.WordInputResponse;
import com.kids.entity.Word;
import com.kids.repository.WordRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class WordService {

    private final WordRepository wordRepository;

    @Transactional
    public WordInputResponse parseAndSave(WordInputRequest request) {
        String input = request.getInput();
        if (input == null || input.isBlank()) {
            throw new IllegalArgumentException("Input không được để trống");
        }

        // Normalize: xuống dòng và ;| thành phẩy, rồi tách theo phẩy, rồi tách tiếp
        // theo space
        String normalized = input
                .replaceAll("[\\r\\n]+", ",") // newline → phẩy
                .replaceAll("[;|]+", ","); // ; và | → phẩy

        List<String> parsedWords = Arrays.stream(normalized.split(","))
                .flatMap(part -> Arrays.stream(part.trim().split("\\s+"))) // tách space bên trong
                .map(String::trim)
                .filter(s -> !s.isBlank())
                .distinct()
                .collect(Collectors.toList());

        if (parsedWords.isEmpty()) {
            throw new IllegalArgumentException("Không tìm thấy từ hợp lệ trong input");
        }

        List<Word> words = parsedWords.stream()
                .map(value -> Word.builder().value(value).build())
                .collect(Collectors.toList());

        wordRepository.saveAll(words);

        long totalCount = wordRepository.count();

        log.debug("Saved {} words. Total in DB: {}", parsedWords.size(), totalCount);

        return WordInputResponse.builder()
                .savedWords(parsedWords)
                .savedCount(parsedWords.size())
                .totalCount(totalCount)
                .message("Đã lưu thành công " + parsedWords.size() + " từ!")
                .build();
    }

    public RandomWordResponse getRandomWords(int count, Integer length, String search) {
        long totalCount = wordRepository.count();
        if (totalCount == 0) {
            throw new IllegalStateException("Database chưa có từ nào. Vui lòng nhập từ trước.");
        }

        String pattern = null;
        if (search != null && !search.isBlank()) {
            if (!search.contains("%")) {
                pattern = "%" + search + "%";
            } else {
                pattern = search;
            }
        }

        List<Word> randomWords = wordRepository.findRandomWords(count, length, pattern);

        List<String> wordValues = randomWords.stream()
                .map(Word::getValue)
                .collect(Collectors.toList());

        return RandomWordResponse.builder()
                .words(wordValues)
                .count(wordValues.size())
                .build();
    }

    public List<String> getAllWords() {
        return wordRepository.findAll().stream()
                .map(Word::getValue)
                .collect(Collectors.toList());
    }

    @Transactional
    public void deleteWords(List<String> values) {
        wordRepository.deleteAllByIdInBatch(values);
    }

    public long getTotalCount() {
        return wordRepository.count();
    }

    public String exportWords() {
        List<String> allWords = getAllWords();
        return String.join("\n", allWords);
    }

    @Transactional
    public int importWords(org.springframework.web.multipart.MultipartFile file) {
        try (java.io.BufferedReader reader = new java.io.BufferedReader(
                new java.io.InputStreamReader(file.getInputStream(), java.nio.charset.StandardCharsets.UTF_8))) {

            List<String> importedWords = reader.lines()
                    .flatMap(line -> Arrays.stream(line.split("[,;|\\s]+")))
                    .map(String::trim)
                    .filter(s -> !s.isBlank())
                    .distinct()
                    .collect(Collectors.toList());

            if (importedWords.isEmpty()) {
                return 0;
            }

            List<Word> entities = importedWords.stream()
                    .map(value -> Word.builder().value(value).build())
                    .collect(Collectors.toList());

            wordRepository.saveAll(entities);
            return importedWords.size();
        } catch (java.io.IOException e) {
            log.error("Lỗi khi nhập file: ", e);
            throw new RuntimeException("Không thể đọc file nhập vào: " + e.getMessage());
        }
    }
}
