package net.tape.orm;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface VideoSecurityRepository
    extends JpaRepository<VideoSecurityEntity, VideoSecurityEntity.Key> {

    List<VideoSecurityEntity> findByVideoId(Long videoId);

    List<VideoSecurityEntity> findBySecurityId(Long securityId);

    void deleteByVideoId(Long videoId);
}
