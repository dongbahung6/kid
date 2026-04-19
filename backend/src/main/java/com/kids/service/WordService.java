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

import com.kids.entity.User;
import com.kids.security.SecurityUtils;

@Slf4j
@Service
@RequiredArgsConstructor
public class WordService {

        private final WordRepository wordRepository;
        private final SecurityUtils securityUtils;

        @Transactional
        public WordInputResponse parseAndSave(WordInputRequest request) {
                String input = request.getInput();
                if (input == null || input.isBlank()) {
                        throw new IllegalArgumentException("Input không được để trống");
                }

                String language = request.getLanguage() != null ? request.getLanguage() : "VI";
                User currentUser = securityUtils.getCurrentUser()
                                .orElseThrow(() -> new IllegalStateException(
                                                "Bạn cần đăng nhập để thực hiện hành động này"));

                String normalized = input
                                .replaceAll("[\\r\\n]+", ",")
                                .replaceAll("[;|]+", ",");

                List<String> parsedWords = Arrays.stream(normalized.split(","))
                                .flatMap(part -> Arrays.stream(part.trim().split("\\s+")))
                                .map(String::trim)
                                .filter(s -> !s.isBlank())
                                .distinct()
                                .collect(Collectors.toList());

                if (parsedWords.isEmpty()) {
                        throw new IllegalArgumentException("Không tìm thấy từ hợp lệ trong input");
                }

                List<Word> words = parsedWords.stream()
                                .map(value -> Word.builder()
                                                .value(value)
                                                .language(language)
                                                .owner(currentUser)
                                                .build())
                                .collect(Collectors.toList());

                if (words != null && !words.isEmpty()) {
                        wordRepository.saveAll(words);
                }

                long totalCount = wordRepository.count();

                log.debug("Saved {} words for user {}. Total in DB: {}", parsedWords.size(), currentUser.getEmail(),
                                totalCount);

                return WordInputResponse.builder()
                                .savedWords(parsedWords)
                                .savedCount(parsedWords.size())
                                .totalCount(totalCount)
                                .message("Đã lưu thành công " + parsedWords.size() + " từ!")
                                .build();
        }

        public RandomWordResponse getRandomWords(int count, Integer length, String search, String language,
                        boolean includeAdmin) {
                User currentUser = securityUtils.getCurrentUser().orElse(null);
                Long userId = (currentUser != null) ? currentUser.getId() : -1L;

                String pattern = null;
                if (search != null && !search.isBlank()) {
                        if (!search.contains("%")) {
                                pattern = "%" + search + "%";
                        } else {
                                pattern = search;
                        }
                }

                List<Word> randomWords = wordRepository.findRandomWords(count, length, pattern, language, userId,
                                includeAdmin);

                return RandomWordResponse.builder()
                                .words(randomWords)
                                .count(randomWords.size())
                                .build();
        }

        public List<Word> getAllMyWords() {
                User currentUser = securityUtils.getCurrentUser()
                                .orElseThrow(() -> new IllegalStateException("Bạn cần đăng nhập"));
                return wordRepository.findAll().stream()
                                .filter(w -> w.getOwner() != null && w.getOwner().getId().equals(currentUser.getId()))
                                .collect(Collectors.toList());
        }

        @Transactional
        public void deleteWords(List<Long> ids) {
                User currentUser = securityUtils.getCurrentUser()
                                .orElseThrow(() -> new IllegalStateException("Bạn cần đăng nhập"));

                List<Word> toDelete = wordRepository.findAllById(ids).stream()
                                .filter(w -> w.getOwner() != null && w.getOwner().getId().equals(currentUser.getId()))
                                .collect(Collectors.toList());

                wordRepository.deleteAllInBatch(toDelete);
        }

        public long getTotalCount() {
                return wordRepository.count();
        }

        public java.util.Optional<User> getCurrentUser() {
                return securityUtils.getCurrentUser();
        }

        public String exportWords() {
                List<Word> words = getAllMyWords();
                StringBuilder sb = new StringBuilder();
                sb.append("word,language\n"); // header
                for (Word w : words) {
                        sb.append(w.getValue().replace(",", ";")) // escape comma in word
                                        .append(",")
                                        .append(w.getLanguage() != null ? w.getLanguage() : "VI")
                                        .append("\n");
                }
                return sb.toString();
        }

        @Transactional
        public int importWords(org.springframework.web.multipart.MultipartFile file, String defaultLanguage) {
                User currentUser = securityUtils.getCurrentUser()
                                .orElseThrow(() -> new IllegalStateException("Bạn cần đăng nhập"));

                try (java.io.BufferedReader reader = new java.io.BufferedReader(
                                new java.io.InputStreamReader(file.getInputStream(),
                                                java.nio.charset.StandardCharsets.UTF_8))) {

                        List<Word> entities = new java.util.ArrayList<>();

                        reader.lines()
                                        .map(String::trim)
                                        .filter(line -> !line.isBlank() && !line.equalsIgnoreCase("word,language"))
                                        .forEach(line -> {
                                                String[] parts = line.split(",", 2);
                                                String wordValue = parts[0].trim();
                                                String lang;
                                                if (parts.length == 2 && !parts[1].isBlank()) {
                                                        lang = parts[1].trim().toUpperCase();
                                                        // Chỉ chấp nhận VI hoặc EN
                                                        if (!lang.equals("VI") && !lang.equals("EN")) {
                                                                lang = defaultLanguage != null ? defaultLanguage : "VI";
                                                        }
                                                } else {
                                                        // File cũ không có cột language — dùng param mặc định
                                                        lang = defaultLanguage != null ? defaultLanguage : "VI";
                                                }
                                                if (!wordValue.isBlank()) {
                                                        entities.add(Word.builder()
                                                                        .value(wordValue)
                                                                        .language(lang)
                                                                        .owner(currentUser)
                                                                        .build());
                                                }
                                        });

                        if (entities.isEmpty()) {
                                return 0;
                        }

                        wordRepository.saveAll(entities);
                        return entities.size();
                } catch (java.io.IOException e) {
                        log.error("Lỗi khi nhập file: ", e);
                        throw new RuntimeException("Không thể đọc file nhập vào: " + e.getMessage());
                }
        }
}
