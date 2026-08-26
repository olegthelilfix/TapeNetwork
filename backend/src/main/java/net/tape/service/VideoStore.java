package net.tape.service;

import net.tape.model.Video;
import net.tape.orm.VideoEntity;
import net.tape.orm.VideoRepository;
import org.springframework.stereotype.Service;

@Service
public class VideoStore extends CachedContentStore<Video> {

    public VideoStore(VideoRepository repo, VideoMapper mapper) {
        super(new JpaContentStore<VideoEntity, Video>(
            repo, mapper::toModel, mapper::applyToEntity, VideoEntity::new, Video.class),
            Video::getId);
    }
}
