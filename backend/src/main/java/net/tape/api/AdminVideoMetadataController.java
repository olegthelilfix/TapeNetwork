package net.tape.api;

import net.tape.model.Security;
import net.tape.model.VideoPerson;
import net.tape.service.EvictsPublicContent;
import net.tape.service.SecurityMapper;
import net.tape.service.VideoMetadataService;
import net.tape.service.VideoMetadataService.PersonRoleRef;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Admin: attach/detach a video's securities and people (with host/guest role).
 * PUT replaces the full set (idempotent); GET returns the current set.
 */
@RestController
@RequestMapping("/api/admin/videos/{videoId}")
class AdminVideoMetadataController {

    private final VideoMetadataService metadata;
    private final SecurityMapper securityMapper;

    AdminVideoMetadataController(VideoMetadataService metadata, SecurityMapper securityMapper) {
        this.metadata = metadata;
        this.securityMapper = securityMapper;
    }

    @GetMapping("/securities")
    @Transactional(readOnly = true)
    public List<SecurityDtoV1> getSecurities(@PathVariable Long videoId) {
        return metadata.securitiesFor(videoId).stream().map(securityMapper::toDtoV1).toList();
    }

    @PutMapping("/securities")
    @Transactional
    @EvictsPublicContent
    public List<SecurityDtoV1> setSecurities(@PathVariable Long videoId, @RequestBody List<Long> securityIds) {
        metadata.setSecurities(videoId, securityIds);
        return getSecurities(videoId);
    }

    @GetMapping("/people")
    @Transactional(readOnly = true)
    public List<PersonRefDtoV1> getPeople(@PathVariable Long videoId) {
        return metadata.peopleFor(videoId).stream()
            .map(p -> new PersonRefDtoV1(p.getSlug(), p.getName(), p.getInitials(), p.getRole()))
            .toList();
    }

    @PutMapping("/people")
    @Transactional
    @EvictsPublicContent
    public List<PersonRefDtoV1> setPeople(@PathVariable Long videoId, @RequestBody List<PersonRoleRef> people) {
        metadata.setPeople(videoId, people);
        return getPeople(videoId);
    }
}
