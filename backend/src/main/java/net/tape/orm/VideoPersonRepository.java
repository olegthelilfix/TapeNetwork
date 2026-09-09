package net.tape.orm;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface VideoPersonRepository
    extends JpaRepository<VideoPersonEntity, VideoPersonEntity.Key> {

    List<VideoPersonEntity> findByVideoId(Long videoId);

    List<VideoPersonEntity> findByPersonId(Long personId);

    void deleteByVideoId(Long videoId);
}
