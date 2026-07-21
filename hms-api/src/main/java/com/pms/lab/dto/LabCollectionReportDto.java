package com.pms.lab.dto;

import java.util.List;

public record LabCollectionReportDto(List<LabCollectionReportRowDto> rows, LabCollectionReportTotalsDto totals) {
}
