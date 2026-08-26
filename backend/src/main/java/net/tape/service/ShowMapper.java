package net.tape.service;

import net.tape.api.ShowDetailDtoV1;
import net.tape.api.ShowSummaryDtoV1;
import net.tape.model.Show;
import net.tape.orm.ShowEntity;
import org.mapstruct.*;
import org.springframework.beans.factory.annotation.Autowired;

@Mapper(componentModel = "spring", uses = { HostMapper.class, EpisodeMapper.class })
public abstract class ShowMapper {
    @Autowired protected MediaResolver media;

    @Mapping(target = "imageUrl", expression = "java(media.url(e.getCoverMediaId()))")
    @Mapping(target = "hosts", ignore = true)
    @Mapping(target = "episodes", ignore = true)
    public abstract Show toModel(ShowEntity e);

    public abstract ShowSummaryDtoV1 toSummaryDtoV1(Show m);
    public abstract ShowDetailDtoV1 toDetailDtoV1(Show m);

    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    public abstract void applyToEntity(Show m, @MappingTarget ShowEntity e);
}
