package net.tape.api;

import java.util.List;

public record PagedResponse<T>(List<T> items, int page, int size, long total, int totalPages) {
    public static <T> PagedResponse<T> of(org.springframework.data.domain.Page<T> p) {
        return new PagedResponse<>(p.getContent(), p.getNumber(), p.getSize(), p.getTotalElements(), p.getTotalPages());
    }
}
