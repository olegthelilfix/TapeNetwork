package net.tape.service;

import net.tape.orm.MediaAssetEntity;
import net.tape.orm.MediaAssetRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class MediaResolverTest {

    @Mock MediaAssetRepository repo;

    @Test
    void resolvesKnownMediaAndReusesLoadedCache() {
        MediaAssetEntity asset = new MediaAssetEntity();
        asset.setId(7L);
        asset.setUrl("/uploads/hero.png");
        when(repo.findAll()).thenReturn(List.of(asset));
        MediaResolver resolver = new MediaResolver(repo);

        assertEquals("/uploads/hero.png", resolver.url(7L));
        assertEquals("/uploads/hero.png", resolver.url(7L));
        assertNull(resolver.url(null));

        verify(repo, times(1)).findAll();
    }
}
