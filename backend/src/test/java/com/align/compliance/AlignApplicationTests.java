package com.align.compliance;

import com.align.compliance.service.HealthService;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest
@ActiveProfiles("test")
class AlignApplicationTests {

    @MockBean
    private HealthService healthService;

    @Test
    void contextLoads() {
    }
}
