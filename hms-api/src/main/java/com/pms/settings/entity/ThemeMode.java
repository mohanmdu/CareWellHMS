package com.pms.settings.entity;

/**
 * LIGHT/DARK/CUSTOM force a data-theme attribute on the frontend; AUTO leaves
 * it unset so the browser's prefers-color-scheme decides. See ThemeService
 * (frontend) for how this is applied.
 */
public enum ThemeMode {
    LIGHT,
    DARK,
    CUSTOM,
    AUTO
}
