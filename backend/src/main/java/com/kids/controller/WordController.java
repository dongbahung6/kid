package com.kids.controller;

import com.kids.dto.RandomWordResponse;
import com.kids.dto.WordInputRequest;
import com.kids.dto.WordInputResponse;
import com.kids.service.WordService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/words")
@RequiredArgsConstructor
public class WordController {

    private final WordService wordService;

    /**
     * POST /api/words
     * Body: { "input": "hùng, dũng, minh, lâm" }
     * Parse input, save all words to DB
     */
    @PostMapping
    public ResponseEntity<WordInputResponse> saveWords(@RequestBody WordInputRequest request) {
        log.debug("POST /api/words - input: {}, lang: {}", request.getInput(), request.getLanguage());
        WordInputResponse response = wordService.parseAndSave(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/random")
    public ResponseEntity<RandomWordResponse> getRandomWords(
            @RequestParam(defaultValue = "5") int count,
            @RequestParam(required = false) Integer length,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "VI") String language,
            @RequestParam(defaultValue = "true") boolean includeAdmin) {
        log.debug("GET /api/words/random?count={}&length={}&search={}&lang={}&admin={}", count, length, search,
                language, includeAdmin);
        RandomWordResponse response = wordService.getRandomWords(count, length, search, language, includeAdmin);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<List<com.kids.entity.Word>> getAllWords() {
        log.debug("GET /api/words");
        return ResponseEntity.ok(wordService.getAllMyWords());
    }

    @DeleteMapping
    public ResponseEntity<Map<String, String>> deleteWords(@RequestBody com.kids.dto.DeleteWordsRequest request) {
        log.debug("DELETE /api/words - count: {}", request.getIds().size());
        wordService.deleteWords(request.getIds());
        return ResponseEntity.ok(Map.of("message", "Đã xóa thành công!"));
    }

    @GetMapping("/count")
    public ResponseEntity<Map<String, Long>> getCount() {
        long count = wordService.getTotalCount();
        return ResponseEntity.ok(Map.of("total", count));
    }

    @GetMapping("/export")
    public ResponseEntity<byte[]> exportWords() {
        log.debug("GET /api/words/export");
        String content = wordService.exportWords();
        byte[] bytes = content.getBytes(java.nio.charset.StandardCharsets.UTF_8);

        return ResponseEntity.ok()
                .header(org.springframework.http.HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=danh-sach-tu.txt")
                .contentType(org.springframework.http.MediaType.TEXT_PLAIN)
                .body(bytes);
    }

    @PostMapping("/import")
    public ResponseEntity<Map<String, String>> importWords(
            @RequestParam("file") org.springframework.web.multipart.MultipartFile file,
            @RequestParam(required = false) String language) {
        log.debug("POST /api/words/import - file: {}, lang: {}", file.getOriginalFilename(), language);
        int count = wordService.importWords(file, language);
        return ResponseEntity.ok(Map.of("message", "Đã nhập thành công " + count + " từ!"));
    }

    @GetMapping("/me")
    public ResponseEntity<com.kids.entity.User> getCurrentUser() {
        return wordService.getCurrentUser()
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.status(401).build());
    }
}
