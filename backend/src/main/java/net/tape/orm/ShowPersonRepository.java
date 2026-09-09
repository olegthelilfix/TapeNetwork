package net.tape.orm;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ShowPersonRepository
    extends JpaRepository<ShowPersonEntity, ShowPersonEntity.Key> {

    List<ShowPersonEntity> findByShowIdOrderBySortAsc(Long showId);

    List<ShowPersonEntity> findByPersonId(Long personId);
}
