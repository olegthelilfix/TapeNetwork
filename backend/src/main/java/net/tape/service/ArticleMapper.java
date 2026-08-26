package net.tape.service;

import net.tape.api.ArticleDtoV1;
import net.tape.model.Article;
import net.tape.orm.ArticleEntity;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;
import org.springframework.beans.factory.annotation.Autowired;

/**
 * Entity ↔ domain ↔ public-DTO mapping. Same-named fields are mapped automatically by
 * MapStruct; only the derived fields (names from associations, media URL) are declared.
 */
@Mapper(componentModel = "spring")
public abstract class ArticleMapper {

    @Autowired
    protected MediaResolver media;

    @Mapping(target = "categoryName", source = "category.name")
    @Mapping(target = "categorySlug", source = "category.slug")
    @Mapping(target = "authorName", source = "author.name")
    @Mapping(target = "imageUrl", expression = "java(media.url(e.getHeroMediaId()))")
    public abstract Article toModel(ArticleEntity e);

    // Public DTO: same-named fields auto-map; category/author come from the resolved names.
    @Mapping(target = "category", source = "categoryName")
    @Mapping(target = "author", source = "authorName")
    public abstract ArticleDtoV1 toDtoV1(Article m);

    /** Apply editable fields from the domain model onto a (new or existing) entity for persistence. */
    @Mapping(target = "category", ignore = true)
    @Mapping(target = "author", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @org.mapstruct.BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    public abstract void applyToEntity(Article m, @MappingTarget ArticleEntity e);
}
