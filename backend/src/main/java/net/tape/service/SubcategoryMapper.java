package net.tape.service;

import net.tape.api.SubcategoryDetailDtoV1;
import net.tape.api.SubcategorySummaryDtoV1;
import net.tape.model.Subcategory;
import net.tape.orm.SubcategoryEntity;
import org.mapstruct.*;

@Mapper(componentModel = "spring", uses = { VideoMapper.class })
public interface SubcategoryMapper {
    @Mapping(target = "categoryName", source = "category.name")
    @Mapping(target = "categorySlug", source = "category.slug")
    @Mapping(target = "videos", ignore = true)
    @Mapping(target = "videoCount", ignore = true)
    @Mapping(target = "imageUrl", ignore = true)
    Subcategory toModel(SubcategoryEntity e);

    SubcategorySummaryDtoV1 toSummaryDtoV1(Subcategory m);
    SubcategoryDetailDtoV1 toDetailDtoV1(Subcategory m);

    @Mapping(target = "category", ignore = true)
    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void applyToEntity(Subcategory m, @MappingTarget SubcategoryEntity e);
}
