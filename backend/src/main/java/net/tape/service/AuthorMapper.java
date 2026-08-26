package net.tape.service;

import net.tape.model.Author;
import net.tape.orm.AuthorEntity;
import org.mapstruct.*;
import org.springframework.beans.factory.annotation.Autowired;

@Mapper(componentModel = "spring")
public abstract class AuthorMapper {
    @Autowired protected MediaResolver media;

    @Mapping(target = "imageUrl", expression = "java(media.url(e.getAvatarMediaId()))")
    public abstract Author toModel(AuthorEntity e);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    public abstract void applyToEntity(Author m, @MappingTarget AuthorEntity e);
}
