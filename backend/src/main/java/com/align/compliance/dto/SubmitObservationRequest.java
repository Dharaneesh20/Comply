package com.align.compliance.dto;

import java.util.List;

public class SubmitObservationRequest {
    private String sopId;
    private String caseId;
    private List<ObservedStepDto> steps;

    public static class ObservedStepDto {
        private String eventType;
        private String source;

        public ObservedStepDto() {}

        public ObservedStepDto(String eventType, String source) {
            this.eventType = eventType;
            this.source = source;
        }

        public String getEventType() {
            return eventType;
        }

        public void setEventType(String eventType) {
            this.eventType = eventType;
        }

        public String getSource() {
            return source;
        }

        public void setSource(String source) {
            this.source = source;
        }
    }

    public SubmitObservationRequest() {}

    public String getSopId() {
        return sopId;
    }

    public void setSopId(String sopId) {
        this.sopId = sopId;
    }

    public String getCaseId() {
        return caseId;
    }

    public void setCaseId(String caseId) {
        this.caseId = caseId;
    }

    public List<ObservedStepDto> getSteps() {
        return steps;
    }

    public void setSteps(List<ObservedStepDto> steps) {
        this.steps = steps;
    }
}
