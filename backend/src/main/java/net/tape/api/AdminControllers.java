package net.tape.api;

import com.fasterxml.jackson.databind.ObjectMapper;
import net.tape.model.*;
import net.tape.orm.*;
import net.tape.service.*;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** Per-resource admin CRUD: persists entities, speaks the domain model (via MapStruct). */
final class AdminControllers { private AdminControllers() {} }

@RestController @RequestMapping("/api/admin/shows")
class AdminShowController extends AbstractCrudController<ShowEntity, Show> {
    AdminShowController(ShowRepository r, ObjectMapper j, ShowMapper m) {
        super(r, j, Show.class, m::toModel, ShowEntity::new, m::applyToEntity);
    }
}

@RestController @RequestMapping("/api/admin/hosts")
class AdminHostController extends AbstractCrudController<HostEntity, Host> {
    AdminHostController(HostRepository r, ObjectMapper j, HostMapper m) {
        super(r, j, Host.class, m::toModel, HostEntity::new, m::applyToEntity);
    }
}

@RestController @RequestMapping("/api/admin/episodes")
class AdminEpisodeController extends AbstractCrudController<EpisodeEntity, Episode> {
    AdminEpisodeController(EpisodeRepository r, ObjectMapper j, EpisodeMapper m) {
        super(r, j, Episode.class, m::toModel, EpisodeEntity::new, m::applyToEntity);
    }
}

@RestController @RequestMapping("/api/admin/categories")
class AdminCategoryController extends AbstractCrudController<CategoryEntity, Category> {
    AdminCategoryController(CategoryRepository r, ObjectMapper j, CategoryMapper m) {
        super(r, j, Category.class, m::toModel, CategoryEntity::new, m::applyToEntity);
    }
}

@RestController @RequestMapping("/api/admin/subcategories")
class AdminSubcategoryController extends AbstractCrudController<SubcategoryEntity, Subcategory> {
    AdminSubcategoryController(SubcategoryRepository r, ObjectMapper j, SubcategoryMapper m) {
        super(r, j, Subcategory.class, m::toModel, SubcategoryEntity::new, m::applyToEntity);
    }
}

@RestController @RequestMapping("/api/admin/videos")
class AdminVideoController extends AbstractCrudController<VideoEntity, Video> {
    AdminVideoController(VideoStore store, ObjectMapper j) {
        super(store, j, Video.class);
    }
}

@RestController @RequestMapping("/api/admin/authors")
class AdminAuthorController extends AbstractCrudController<AuthorEntity, Author> {
    AdminAuthorController(AuthorRepository r, ObjectMapper j, AuthorMapper m) {
        super(r, j, Author.class, m::toModel, AuthorEntity::new, m::applyToEntity);
    }
}

@RestController @RequestMapping("/api/admin/articles")
class AdminArticleController extends AbstractCrudController<ArticleEntity, Article> {
    AdminArticleController(ArticleStore store, ObjectMapper j) {
        super(store, j, Article.class);
    }
}

@RestController @RequestMapping("/api/admin/schedule")
class AdminScheduleController extends AbstractCrudController<ScheduleSlotEntity, ScheduleSlot> {
    AdminScheduleController(ScheduleSlotRepository r, ObjectMapper j, ScheduleMapper m) {
        super(r, j, ScheduleSlot.class, m::toModel, ScheduleSlotEntity::new, m::applyToEntity);
    }
}

@RestController @RequestMapping("/api/admin/ticker")
class AdminTickerController extends AbstractCrudController<TickerQuoteEntity, TickerQuote> {
    AdminTickerController(TickerQuoteRepository r, ObjectMapper j, TickerMapper m) {
        super(r, j, TickerQuote.class, m::toModel, TickerQuoteEntity::new, m::applyToEntity);
    }
}

@RestController @RequestMapping("/api/admin/home-blocks")
class AdminHomeBlockController extends AbstractCrudController<HomeBlockEntity, HomeBlock> {
    AdminHomeBlockController(HomeBlockRepository r, ObjectMapper j, HomeBlockMapper m) {
        super(r, j, HomeBlock.class, m::toModel, HomeBlockEntity::new, m::applyToEntity);
    }
}

@RestController @RequestMapping("/api/admin/media")
class AdminMediaController extends AbstractCrudController<MediaAssetEntity, MediaAsset> {
    AdminMediaController(MediaAssetRepository r, ObjectMapper j, MediaMapper m) {
        super(r, j, MediaAsset.class, m::toModel, MediaAssetEntity::new, m::applyToEntity);
    }
}

@RestController @RequestMapping("/api/admin/securities")
class AdminSecurityController extends AbstractCrudController<SecurityEntity, Security> {
    AdminSecurityController(SecurityRepository r, ObjectMapper j, SecurityMapper m) {
        super(r, j, Security.class, m::toModel, SecurityEntity::new, m::applyToEntity);
    }
}

@RestController @RequestMapping("/api/admin/people")
class AdminPersonController extends AbstractCrudController<PersonEntity, Person> {
    AdminPersonController(PersonRepository r, ObjectMapper j, PersonMapper m) {
        super(r, j, Person.class, m::toModel, PersonEntity::new, m::applyToEntity);
    }
}
