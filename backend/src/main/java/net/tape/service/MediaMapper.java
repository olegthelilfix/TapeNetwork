package net.tape.service;

import net.tape.model.MediaAsset;
import net.tape.orm.MediaAssetEntity;
import org.mapstruct.*;

@Mapper(componentModel = "spring")
public interface MediaMapper {
    MediaAsset toModel(MediaAssetEntity e);
    @Mapping(target = "createdAt", ignore = true)
    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void applyToEntity(MediaAsset m, @MappingTarget MediaAssetEntity e);
}
