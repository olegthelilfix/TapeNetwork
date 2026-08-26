package net.tape.service;

import net.tape.model.AdminUser;
import net.tape.orm.AdminUserEntity;
import org.mapstruct.*;

@Mapper(componentModel = "spring")
public interface AdminUserMapper {
    AdminUser toModel(AdminUserEntity e);
}
