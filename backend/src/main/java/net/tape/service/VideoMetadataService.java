package net.tape.service;

import net.tape.model.Security;
import net.tape.model.Video;
import net.tape.model.VideoPerson;
import net.tape.orm.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

/**
 * Assembles a video's structured metadata (securities + people with roles) from the join
 * tables, and drives attach/detach for the admin API. The join tables are the source of
 * truth; the same security/person is reused across many videos (#54).
 */
@Service
public class VideoMetadataService {

    private final VideoRepository videos;
    private final SecurityRepository securities;
    private final PersonRepository people;
    private final VideoSecurityRepository videoSecurities;
    private final VideoPersonRepository videoPeople;
    private final SecurityMapper securityMapper;

    public VideoMetadataService(VideoRepository videos, SecurityRepository securities, PersonRepository people,
                                VideoSecurityRepository videoSecurities, VideoPersonRepository videoPeople,
                                SecurityMapper securityMapper) {
        this.videos = videos;
        this.securities = securities;
        this.people = people;
        this.videoSecurities = videoSecurities;
        this.videoPeople = videoPeople;
        this.securityMapper = securityMapper;
    }

    /** Populate a video model's securities + people from the join tables. */
    @Transactional(readOnly = true)
    public void enrich(Video video) {
        if (video == null || video.getId() == null) return;
        video.setSecurities(securitiesFor(video.getId()));
        video.setPeople(peopleFor(video.getId()));
    }

    @Transactional(readOnly = true)
    public List<Security> securitiesFor(Long videoId) {
        return videoSecurities.findByVideoId(videoId).stream()
            .map(VideoSecurityEntity::getSecurity)
            .filter(java.util.Objects::nonNull)
            .map(securityMapper::toModel)
            .toList();
    }

    @Transactional(readOnly = true)
    public List<VideoPerson> peopleFor(Long videoId) {
        return videoPeople.findByVideoId(videoId).stream()
            .map(link -> {
                PersonEntity p = link.getPerson();
                if (p == null) return null;
                VideoPerson vp = new VideoPerson();
                vp.setSlug(p.getSlug());
                vp.setName(p.getName());
                vp.setInitials(p.getInitials());
                vp.setRole(link.getRole());
                return vp;
            })
            .filter(java.util.Objects::nonNull)
            .toList();
    }

    /** Replace the full set of securities on a video (admin). */
    @Transactional
    public void setSecurities(Long videoId, List<Long> securityIds) {
        requireVideo(videoId);
        videoSecurities.deleteByVideoId(videoId);
        videoSecurities.flush();
        for (Long securityId : distinct(securityIds)) {
            if (securities.existsById(securityId)) {
                VideoSecurityEntity e = new VideoSecurityEntity();
                e.setVideoId(videoId);
                e.setSecurityId(securityId);
                videoSecurities.save(e);
            }
        }
    }

    /** Replace the full set of people (with roles) on a video (admin). */
    @Transactional
    public void setPeople(Long videoId, List<PersonRoleRef> refs) {
        requireVideo(videoId);
        videoPeople.deleteByVideoId(videoId);
        videoPeople.flush();
        if (refs == null) return;
        for (PersonRoleRef ref : refs) {
            if (ref == null || ref.personId() == null) continue;
            if (!people.existsById(ref.personId())) continue;
            VideoPersonEntity e = new VideoPersonEntity();
            e.setVideoId(videoId);
            e.setPersonId(ref.personId());
            e.setRole(normalizeRole(ref.role()));
            videoPeople.save(e);
        }
    }

    private void requireVideo(Long videoId) {
        if (!videos.existsById(videoId)) throw new NotFoundException("video", String.valueOf(videoId));
    }

    private static String normalizeRole(String role) {
        if (role == null || role.isBlank()) return "host";
        String r = role.toLowerCase(java.util.Locale.ROOT).trim();
        return r.equals("guest") ? "guest" : "host";
    }

    private static List<Long> distinct(List<Long> ids) {
        return ids == null ? List.of() : ids.stream().filter(java.util.Objects::nonNull).distinct().toList();
    }

    /** A person + their role, as sent by the admin attach API. */
    public record PersonRoleRef(Long personId, String role) {}
}
