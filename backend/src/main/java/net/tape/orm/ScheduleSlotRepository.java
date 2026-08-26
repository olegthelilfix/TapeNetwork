package net.tape.orm;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ScheduleSlotRepository extends JpaRepository<ScheduleSlotEntity, Long> {
    List<ScheduleSlotEntity> findAllByOrderBySortAsc();
}
