package com.pms.config;

import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.concurrent.ConcurrentMapCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Simple in-memory caching for singleton/rarely-written, constantly-read data
 * (e.g. ClinicSettingsService) - one JVM, one deployment per hospital client
 * (see package-config.ts / ClinicSettings' singleton design), so a
 * distributed cache would be infrastructure this shape of data doesn't need.
 */
@Configuration
@EnableCaching
public class CacheConfig {

    @Bean
    public CacheManager cacheManager() {
        return new ConcurrentMapCacheManager("clinicSettings");
    }
}
