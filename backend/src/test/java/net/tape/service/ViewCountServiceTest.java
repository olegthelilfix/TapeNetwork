package net.tape.service;

import net.tape.orm.VideoRepository;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/** Unit test for the in-memory view buffer + scheduled flush (#53). */
class ViewCountServiceTest {

    private final VideoRepository videos = mock(VideoRepository.class);
    private final VideoStore store = mock(VideoStore.class);
    private final ViewCountService service = new ViewCountService(videos, store);

    @Test
    void recordViewBuffersInMemoryWithoutTouchingTheDatabase() {
        service.recordView(1L);
        service.recordView(1L);
        service.recordView(2L);

        assertEquals(2L, service.buffered(1L));
        assertEquals(1L, service.buffered(2L));
        // Nothing written to the DB before a flush.
        verify(videos, never()).addViews(eq(1L), org.mockito.ArgumentMatchers.anyLong());
    }

    @Test
    void effectiveCountIsPersistedPlusBuffered() {
        service.recordView(7L);
        service.recordView(7L);
        service.recordView(7L);

        assertEquals(103L, service.effective(7L, 100L));
    }

    @Test
    void flushDrainsBufferedDeltasAtomicallyAndReloadsCache() {
        when(videos.addViews(eq(1L), eq(2L))).thenReturn(1);
        when(videos.addViews(eq(2L), eq(1L))).thenReturn(1);
        service.recordView(1L);
        service.recordView(1L);
        service.recordView(2L);

        service.flush();

        verify(videos).addViews(1L, 2L);
        verify(videos).addViews(2L, 1L);
        verify(store).reload(1L);
        verify(store).reload(2L);
        // Buffer is drained after flush.
        assertEquals(0L, service.buffered(1L));
        assertEquals(0L, service.buffered(2L));
    }

    @Test
    void flushDropsBufferForVideosThatNoLongerExist() {
        when(videos.addViews(eq(9L), eq(1L))).thenReturn(0); // update matched no row
        service.recordView(9L);

        service.flush();

        verify(videos).addViews(9L, 1L);
        verify(store, never()).reload(9L);
        assertEquals(0L, service.buffered(9L));
    }

    @Test
    void flushIsANoOpWhenNothingBuffered() {
        service.flush();
        verify(videos, never()).addViews(org.mockito.ArgumentMatchers.anyLong(), org.mockito.ArgumentMatchers.anyLong());
    }

    @Test
    void recordViewIgnoresNullId() {
        service.recordView(null);
        service.flush();
        verify(videos, never()).addViews(org.mockito.ArgumentMatchers.anyLong(), org.mockito.ArgumentMatchers.anyLong());
    }
}
