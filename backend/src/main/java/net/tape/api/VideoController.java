package net.tape.api;

import net.tape.service.PopularVideosService;
import net.tape.service.VideoMapper;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/videos")
public class VideoController {
    private final PopularVideosService popular;
    private final VideoMapper mapper;

    public VideoController(PopularVideosService popular, VideoMapper mapper) {
        this.popular = popular;
        this.mapper = mapper;
    }

    /** Top published videos by view count, most popular first. Public, id-less. */
    @GetMapping("/popular")
    public List<VideoDtoV1> popular(@RequestParam(defaultValue = "5") int limit) {
        return popular.top(limit).stream().map(mapper::toDtoV1).toList();
    }
}
