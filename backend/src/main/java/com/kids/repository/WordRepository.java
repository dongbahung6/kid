package com.kids.repository;

import com.kids.entity.Word;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WordRepository extends JpaRepository<Word, Long> {

        @Query(value = "SELECT * FROM words WHERE " +
                        "(:language IS NULL OR language = :language) AND " +
                        "(:includeAdmin = true AND user_id IN (SELECT id FROM users WHERE email = 'dongbahung6@gmail.com') OR user_id = :userId) AND "
                        +
                        "(:length IS NULL OR CHAR_LENGTH(value) = :length) AND " +
                        "(:pattern IS NULL OR value LIKE :pattern) " +
                        "ORDER BY RAND() LIMIT :count", nativeQuery = true)
        List<Word> findRandomWords(
                        @Param("count") int count,
                        @Param("length") Integer length,
                        @Param("pattern") String pattern,
                        @Param("language") String language,
                        @Param("userId") Long userId,
                        @Param("includeAdmin") boolean includeAdmin);
}
