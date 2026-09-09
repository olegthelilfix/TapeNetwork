package net.tape.service;

import net.tape.api.PersonDtoV1;
import net.tape.model.Person;
import net.tape.orm.PersonEntity;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;
import org.springframework.beans.factory.annotation.Autowired;

@Mapper(componentModel = "spring")
public abstract class PersonMapper {

    @Autowired
    protected MediaResolver media;

    @Mapping(target = "imageUrl", expression = "java(media.url(e.getAvatarMediaId()))")
    public abstract Person toModel(PersonEntity e);

    // Public person-page DTO; videos + articles are attached by the service.
    @Mapping(target = "videos", ignore = true)
    @Mapping(target = "articles", ignore = true)
    public abstract PersonDtoV1 toDtoV1(Person m);

    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @org.mapstruct.BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    public abstract void applyToEntity(Person m, @MappingTarget PersonEntity e);
}
