package net.tape.service;

import net.tape.api.VideoDtoV1;
import net.tape.model.Video;
import net.tape.orm.VideoEntity;
import org.mapstruct.*;
import org.springframework.beans.factory.annotation.Autowired;

@Mapper(componentModel = "spring", uses = SecurityMapper.class)
public abstract class VideoMapper {
    @Autowired protected MediaResolver media;

    @Mapping(target = "showName", source = "show.name")
    @Mapping(target = "showSlug", source = "show.slug")
    @Mapping(target = "categoryName", source = "subcategory.category.name")
    @Mapping(target = "imageUrl", expression = "java(media.url(e.getThumbMediaId()))")
    public abstract Video toModel(VideoEntity e);

    @Mapping(target = "durationLabel", expression = "java(Format.duration(m.getDurationSec()))")
    public abstract VideoDtoV1 toDtoV1(Video m);

    public abstract net.tape.api.PersonRefDtoV1 toPersonRefDtoV1(net.tape.model.VideoPerson p);

    @Mapping(target = "show", ignore = true)
    @Mapping(target = "subcategory", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    public abstract void applyToEntity(Video m, @MappingTarget VideoEntity e);
}
