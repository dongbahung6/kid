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
        log.debug("POST /api/words - input: {}", request.getInput());
        WordInputResponse response = wordService.parseAndSave(request);
        return ResponseEntity.ok(response);
    }

    /**
     * GET /api/words/random?count=N
     * Return N random words from DB
     */
    @GetMapping("/random")
    public ResponseEntity<RandomWordResponse> getRandomWords(
            @RequestParam(defaultValue = "5") int count,
            @RequestParam(required = false) Integer length,
            @RequestParam(required = false) String search) {
        log.debug("GET /api/words/random?count={}&length={}&search={}", count, length, search);
        RandomWordResponse response = wordService.getRandomWords(count, length, search);
        return ResponseEntity.ok(response);
    }

    /**
     * GET /api/words
     * Return all words in DB
     */
    @GetMapping
    public ResponseEntity<List<String>> getAllWords() {
        log.debug("GET /api/words");
        return ResponseEntity.ok(wordService.getAllWords());
    }

    /**
     * DELETE /api/words
     * Body: { "words": ["word1", "word2"] }
     * Delete multiple words from DB
     */
    @DeleteMapping
    public ResponseEntity<Map<String, String>> deleteWords(@RequestBody com.kids.dto.DeleteWordsRequest request) {
        log.debug("DELETE /api/words - count: {}", request.getWords().size());
        wordService.deleteWords(request.getWords());
        return ResponseEntity.ok(Map.of("message", "Đã xóa thành công!"));
    }

    /**
     * GET /api/words/count
     * Return total number of words in DB
     */
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
            @RequestParam("file") org.springframework.web.multipart.MultipartFile file) {
        log.debug("POST /api/words/import - file: {}", file.getOriginalFilename());
        int count = wordService.importWords(file);
        return ResponseEntity.ok(Map.of("message", "Đã nhập thành công " + count + " từ!"));
    }
}
