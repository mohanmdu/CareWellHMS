package com.pms.website.dto;

/** Public-safe projection of Department - just enough for a website "Departments" listing. */
public record PublicDepartmentDto(Long id, String name) {
}
