package net.tape.service;

import net.tape.model.Category;
import net.tape.model.Subcategory;
import net.tape.model.Video;
import net.tape.orm.CategoryEntity;
import net.tape.orm.CategoryRepository;
import net.tape.orm.SubcategoryEntity;
import net.tape.orm.SubcategoryRepository;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;
import java.util.Objects;

@Service
@Transactional(readOnly = true)
public class CatalogService {

    private final CategoryRepository categories;
    private final SubcategoryRepository subcategories;
    private final VideoStore videos;
    private final CategoryMapper categoryMapper;
    private final SubcategoryMapper subcategoryMapper;
    private final VideoMetadataService videoMetadata;
    private final ViewCountService viewCounts;

    public CatalogService(CategoryRepository categories, SubcategoryRepository subcategories, VideoStore videos,
                          CategoryMapper categoryMapper, SubcategoryMapper subcategoryMapper,
                          VideoMetadataService videoMetadata, ViewCountService viewCounts) {
        this.categories = categories; this.subcategories = subcategories; this.videos = videos;
        this.categoryMapper = categoryMapper; this.subcategoryMapper = subcategoryMapper;
        this.videoMetadata = videoMetadata; this.viewCounts = viewCounts;
    }

    @Cacheable(PublicCaches.CATEGORIES)
    public List<Category> listCategories() {
        return categories.findByPublishedTrueOrderBySortAsc().stream().map(this::categoryWithCounts).toList();
    }

    @Cacheable(PublicCaches.CATEGORY_DETAIL)
    public Category categoryBySlug(String slug) {
        CategoryEntity c = categories.findBySlug(slug).orElseThrow(() -> new NotFoundException("category", slug));
        Category model = categoryWithCounts(c);
        model.setSubcategories(subcategories.findByCategoryIdOrderBySortAsc(c.getId())
            .stream().map(this::subcategoryWithMeta).toList());
        return model;
    }

    @Cacheable(PublicCaches.SUBCATEGORY_DETAIL)
    public Subcategory subcategoryBySlug(String slug) {
        SubcategoryEntity s = subcategories.findBySlug(slug).orElseThrow(() -> new NotFoundException("subcategory", slug));
        Subcategory model = subcategoryWithMeta(s);
        model.setVideos(publishedVideos(s.getId()));
        return model;
    }

    public Video videoBySlug(String slug) {
        Video video = videos.findAll().stream()
            .filter(v -> Objects.equals(slug, v.getSlug()))
            .findFirst()
            .orElseThrow(() -> new NotFoundException("video", slug));
        videoMetadata.enrich(video);
        long effective = viewCounts.effective(video.getId(), video.getViewCount());
        video.setViewCount(effective);
        video.setViews(Format.views(effective));
        return video;
    }

    private Category categoryWithCounts(CategoryEntity c) {
        Category model = categoryMapper.toModel(c);
        List<SubcategoryEntity> subs = subcategories.findByCategoryIdOrderBySortAsc(c.getId());
        int videoCount = subs.stream().mapToInt(s -> publishedVideos(s.getId()).size()).sum();
        model.setSubcategoryCount(subs.size());
        model.setVideoCount(videoCount);
        model.setSubNames(subs.stream().map(SubcategoryEntity::getName).toList());
        return model;
    }

    private Subcategory subcategoryWithMeta(SubcategoryEntity s) {
        Subcategory model = subcategoryMapper.toModel(s);
        List<Video> vids = publishedVideos(s.getId());
        model.setVideoCount(vids.size());
        model.setImageUrl(vids.isEmpty() ? null : vids.get(0).getImageUrl());
        return model;
    }

    private List<Video> publishedVideos(Long subcategoryId) {
        return videos.findAll().stream()
            .filter(Video::isPublished)
            .filter(v -> Objects.equals(subcategoryId, v.getSubcategoryId()))
            .sorted(Comparator.comparing(Video::getPublishedAt,
                Comparator.nullsLast(Comparator.reverseOrder())))
            .toList();
    }
}
