package net.tape.service;

import net.tape.api.ArticleDtoV1;
import net.tape.api.PersonDtoV1;
import net.tape.api.PersonVideoDtoV1;
import net.tape.model.Person;
import net.tape.orm.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Public person page (#56): a person's info plus their host/guest video appearances and the
 * articles they authored. Videos come from the #54 video_person links; articles from
 * article.person_id. Unknown slug -> NotFoundException (404 via ApiExceptionHandler).
 */
@Service
public class PersonService {

    private final PersonRepository people;
    private final VideoPersonRepository videoPeople;
    private final VideoRepository videos;
    private final ArticleRepository articles;
    private final PersonMapper personMapper;
    private final VideoMapper videoMapper;
    private final ArticleMapper articleMapper;
    private final MediaResolver media;

    public PersonService(PersonRepository people, VideoPersonRepository videoPeople, VideoRepository videos,
                         ArticleRepository articles, PersonMapper personMapper, VideoMapper videoMapper,
                         ArticleMapper articleMapper, MediaResolver media) {
        this.people = people;
        this.videoPeople = videoPeople;
        this.videos = videos;
        this.articles = articles;
        this.personMapper = personMapper;
        this.videoMapper = videoMapper;
        this.articleMapper = articleMapper;
        this.media = media;
    }

    @Transactional(readOnly = true)
    public PersonDtoV1 bySlug(String slug) {
        PersonEntity entity = people.findBySlug(slug)
            .orElseThrow(() -> new NotFoundException("person", slug));
        Person person = personMapper.toModel(entity);

        List<PersonVideoDtoV1> personVideos = videoPeople.findByPersonId(entity.getId()).stream()
            .map(link -> videos.findById(link.getVideoId())
                .filter(VideoEntity::isPublished)
                .map(v -> new PersonVideoDtoV1(
                    v.getSlug(),
                    v.getTitle(),
                    v.getShow() != null ? v.getShow().getName() : null,
                    Format.duration(v.getDurationSec()),
                    media.url(v.getThumbMediaId()),
                    link.getRole()))
                .orElse(null))
            .filter(java.util.Objects::nonNull)
            .toList();

        List<ArticleDtoV1> personArticles = articles
            .findByPersonIdAndPublishedTrueOrderByPublishedAtDesc(entity.getId()).stream()
            .map(articleMapper::toModel)
            .map(articleMapper::toDtoV1)
            .toList();

        return new PersonDtoV1(
            person.getSlug(),
            person.getName(),
            person.getInitials(),
            person.getBio(),
            person.getImageUrl(),
            personVideos,
            personArticles);
    }
}
