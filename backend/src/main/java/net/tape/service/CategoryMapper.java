package net.tape.service;

import net.tape.api.CategoryDetailDtoV1;
import net.tape.api.CategorySummaryDtoV1;
import net.tape.model.Category;
import net.tape.orm.CategoryEntity;
import org.mapstruct.*;
import org.springframework.beans.factory.annotation.Autowired;

@Mapper(componentModel = "spring", uses = { SubcategoryMapper.class })
public abstract class CategoryMapper {
    @Autowired protected MediaResolver media;

    @Mapping(target = "imageUrl", expression = "java(media.url(e.getCoverMediaId()))")
    @Mapping(target = "subcategories", ignore = true)
    @Mapping(target = "subNames", ignore = true)
    @Mapping(target = "subcategoryCount", ignore = true)
    @Mapping(target = "videoCount", ignore = true)
    public abstract Category toModel(CategoryEntity e);

    public abstract CategorySummaryDtoV1 toSummaryDtoV1(Category m);
    public abstract CategoryDetailDtoV1 toDetailDtoV1(Category m);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    public abstract void applyToEntity(Category m, @MappingTarget CategoryEntity e);
}
