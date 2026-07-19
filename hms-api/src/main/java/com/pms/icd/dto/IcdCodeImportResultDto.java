package com.pms.icd.dto;

import java.util.List;

public record IcdCodeImportResultDto(int imported, int skipped, List<String> errors) {
}
