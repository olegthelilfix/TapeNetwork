package net.tape.service;

import net.tape.api.EpisodeDtoV1;
import net.tape.model.Episode;
import net.tape.orm.EpisodeEntity;
import org.mapstruct.*;
import org.springframework.beans.factory.annotation.Autowired;

@Mapper(componentModel = "spring")
public abstract class EpisodeMapper {
    @Autowired protected MediaResolver media;

    @Mapping(target = "showName", source = "show.name")
    @Mapping(target = "showSlug", source = "show.slug")
    @Mapping(target = "imageUrl", expression = "java(media.url(e.getThumbMediaId()))")
    public abstract Episode toModel(EpisodeEntity e);

    @Mapping(target = "durationLabel", expression = "java(Format.duration(m.getDurationSec()))")
    public abstract EpisodeDtoV1 toDtoV1(Episode m);

    @Mapping(target = "show", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    public abstract void applyToEntity(Episode m, @MappingTarget EpisodeEntity e);
}
