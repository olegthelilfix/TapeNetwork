package net.tape.service;

import net.tape.api.ScheduleItemDtoV1;
import net.tape.model.ScheduleSlot;
import net.tape.orm.ScheduleSlotEntity;
import org.mapstruct.*;

@Mapper(componentModel = "spring")
public interface ScheduleMapper {
    @Mapping(target = "showName", source = "show.name")
    @Mapping(target = "showSlug", source = "show.slug")
    ScheduleSlot toModel(ScheduleSlotEntity e);

    ScheduleItemDtoV1 toDtoV1(ScheduleSlot m);

    @Mapping(target = "show", ignore = true)
    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void applyToEntity(ScheduleSlot m, @MappingTarget ScheduleSlotEntity e);
}
