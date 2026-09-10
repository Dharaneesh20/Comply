package com.align.compliance.service;

import com.align.compliance.dto.SubmitEvidenceRequest;
import com.align.compliance.dto.SubmitObservationRequest;
import com.align.compliance.exception.ResourceNotFoundException;
import com.align.compliance.model.OperationalEvidence;
import com.align.compliance.model.ProcessObservation;
import com.align.compliance.model.SOP;
import com.align.compliance.model.SOPHealthAssessment;
import com.align.compliance.repository.OperationalEvidenceRepository;
import com.align.compliance.repository.ProcessObservationRepository;
import com.align.compliance.repository.SOPHealthAssessmentRepository;
import com.align.compliance.repository.SOPRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class SOPHealthService {

    private static final Logger logger = LoggerFactory.getLogger(SOPHealthService.class);

    private final OperationalEvidenceRepository evidenceRepository;
    private final ProcessObservationRepository observationRepository;
    private final SOPHealthAssessmentRepository healthAssessmentRepository;
    private final SOPRepository sopRepository;

    public SOPHealthService(
            OperationalEvidenceRepository evidenceRepository,
            ProcessObservationRepository observationRepository,
            SOPHealthAssessmentRepository healthAssessmentRepository,
            SOPRepository sopRepository) {
        this.evidenceRepository = evidenceRepository;
        this.observationRepository = observationRepository;
        this.healthAssessmentRepository = healthAssessmentRepository;
        this.sopRepository = sopRepository;
    }

    public OperationalEvidence recordEvidence(String organizationId, SubmitEvidenceRequest request) {
        SOP sop = sopRepository.findById(request.getSopId())
                .filter(s -> s.getOrganizationId().equals(organizationId))
                .orElseThrow(() -> new ResourceNotFoundException("SOP not found: " + request.getSopId()));

        OperationalEvidence evidence = new OperationalEvidence(
                organizationId,
                sop.getId(),
                request.getSopVersionId() != null ? request.getSopVersionId() : String.valueOf(sop.getCurrentVersion()),
                request.getCaseId(),
                request.getEventType(),
                request.getTimestamp() != null ? request.getTimestamp() : Instant.now(),
                request.getSource() != null ? request.getSource() : "MANUAL_SIMULATION",
                request.getMetadata()
        );

        return evidenceRepository.save(evidence);
    }

    public List<OperationalEvidence> getEvidence(String organizationId, String sopId) {
        if (sopId != null) {
            return evidenceRepository.findByOrganizationIdAndSopId(organizationId, sopId);
        }
        return evidenceRepository.findByOrganizationId(organizationId);
    }

    public ProcessObservation recordObservation(String organizationId, SubmitObservationRequest request) {
        SOP sop = sopRepository.findById(request.getSopId())
                .filter(s -> s.getOrganizationId().equals(organizationId))
                .orElseThrow(() -> new ResourceNotFoundException("SOP not found: " + request.getSopId()));

        List<ProcessObservation.ObservedStep> steps = new ArrayList<>();
        Instant baseTime = Instant.now().minusSeconds(3600);
        int offset = 0;
        for (SubmitObservationRequest.ObservedStepDto dto : request.getSteps()) {
            steps.add(new ProcessObservation.ObservedStep(
                    dto.getEventType(),
                    baseTime.plusSeconds(offset * 300L),
                    dto.getSource() != null ? dto.getSource() : "MANUAL_SIMULATION"
            ));
            offset++;
        }

        ProcessObservation obs = new ProcessObservation(
                organizationId,
                sop.getId(),
                request.getCaseId() != null ? request.getCaseId() : "CASE-" + UUID.randomUUID().toString().substring(0, 8),
                steps
        );

        return observationRepository.save(obs);
    }

    public SOPHealthAssessment analyzeSOPHealth(String organizationId, String sopId) {
        SOP sop = sopRepository.findById(sopId)
                .filter(s -> s.getOrganizationId().equals(organizationId))
                .orElseThrow(() -> new ResourceNotFoundException("SOP not found: " + sopId));

        // 1. Determine Expected Sequence based on SOP title/description standard patterns
        List<String> expectedSequence = getExpectedSequenceForSOP(sop);

        // 2. Fetch observations and group individual evidence events by caseId
        List<ProcessObservation> observations = observationRepository.findByOrganizationIdAndSopId(organizationId, sopId);
        List<OperationalEvidence> rawEvents = evidenceRepository.findByOrganizationIdAndSopId(organizationId, sopId);

        Map<String, List<ProcessObservation.ObservedStep>> caseMap = new LinkedHashMap<>();

        // Add explicit observations
        for (ProcessObservation obs : observations) {
            caseMap.put(obs.getCaseId(), obs.getObservedSequence());
        }

        // Aggregate standalone evidence events by caseId if not already present
        Map<String, List<OperationalEvidence>> evidenceByCase = rawEvents.stream()
                .filter(e -> e.getCaseId() != null && !e.getCaseId().isEmpty())
                .collect(Collectors.groupingBy(OperationalEvidence::getCaseId));

        for (Map.Entry<String, List<OperationalEvidence>> entry : evidenceByCase.entrySet()) {
            if (!caseMap.containsKey(entry.getKey())) {
                List<ProcessObservation.ObservedStep> steps = entry.getValue().stream()
                        .sorted(Comparator.comparing(OperationalEvidence::getTimestamp))
                        .map(e -> new ProcessObservation.ObservedStep(e.getEventType(), e.getTimestamp(), e.getSource()))
                        .collect(Collectors.toList());
                caseMap.put(entry.getKey(), steps);
            }
        }

        List<SOPHealthAssessment.ProcessDeviation> deviations = new ArrayList<>();
        int totalCases = Math.max(caseMap.size(), 1);
        List<String> sampleObserved = new ArrayList<>();

        if (caseMap.isEmpty()) {
            // Demo default observation showing sequence deviation if none exists yet
            sampleObserved = Arrays.asList("Resolve Issue", "Create Support Ticket", "Close Ticket");
            deviations.add(new SOPHealthAssessment.ProcessDeviation(
                    "CASE-SIMULATED-01",
                    "SEQUENCE_OUT_OF_ORDER",
                    "Potential process deviation detected: Ticket creation frequently occurs after resolution.",
                    expectedSequence,
                    sampleObserved,
                    "HIGH"
            ));
        } else {
            for (Map.Entry<String, List<ProcessObservation.ObservedStep>> entry : caseMap.entrySet()) {
                List<String> observedSteps = entry.getValue().stream()
                        .map(ProcessObservation.ObservedStep::getEventType)
                        .collect(Collectors.toList());
                
                if (sampleObserved.isEmpty()) {
                    sampleObserved = observedSteps;
                }

                // Sequence comparison check
                SOPHealthAssessment.ProcessDeviation deviation = evaluateSequence(entry.getKey(), expectedSequence, observedSteps);
                if (deviation != null) {
                    deviations.add(deviation);
                }
            }
        }

        int deviationsCount = deviations.size();
        int penalty = (deviationsCount * 25);
        int healthScore = Math.max(10, 100 - penalty);

        SOPHealthAssessment assessment = new SOPHealthAssessment(
                organizationId,
                sop.getId(),
                String.valueOf(sop.getCurrentVersion()),
                healthScore,
                totalCases,
                deviationsCount,
                deviations,
                expectedSequence,
                sampleObserved
        );

        return healthAssessmentRepository.save(assessment);
    }

    public Optional<SOPHealthAssessment> getLatestHealthAssessment(String organizationId, String sopId) {
        return healthAssessmentRepository.findTopByOrganizationIdAndSopIdOrderByLastAnalyzedAtDesc(organizationId, sopId);
    }

    private List<String> getExpectedSequenceForSOP(SOP sop) {
        String title = sop.getTitle().toLowerCase();
        if (title.contains("complaint") || title.contains("customer") || title.contains("incident")) {
            return Arrays.asList("Create Support Ticket", "Assign Engineer", "Resolve Issue", "Confirm with Customer", "Close Ticket");
        } else if (title.contains("data") || title.contains("privacy") || title.contains("access")) {
            return Arrays.asList("Receive Data Request", "Verify User Identity", "Extract Records", "Approve & Deliver", "Log Audit Trail");
        } else {
            return Arrays.asList("Log Incident / Request", "Initial Review", "Execution & Mitigation", "Quality Check", "Archive Case");
        }
    }

    private SOPHealthAssessment.ProcessDeviation evaluateSequence(String caseId, List<String> expected, List<String> observed) {
        if (observed == null || observed.isEmpty()) {
            return new SOPHealthAssessment.ProcessDeviation(
                    caseId,
                    "MISSING_STEP",
                    "Potential process deviation detected: Operational case has no recorded step sequence.",
                    expected,
                    Collections.emptyList(),
                    "MEDIUM"
            );
        }

        // Check for specific reverse sequence (e.g. Ticket created after Resolve)
        int resolveIdx = -1;
        int createTicketIdx = -1;

        for (int i = 0; i < observed.size(); i++) {
            String step = observed.get(i).toLowerCase();
            if (step.contains("resolve")) {
                resolveIdx = i;
            }
            if (step.contains("ticket") || step.contains("create") || step.contains("log")) {
                if (createTicketIdx == -1) {
                    createTicketIdx = i;
                }
            }
        }

        if (resolveIdx != -1 && createTicketIdx != -1 && resolveIdx < createTicketIdx) {
            return new SOPHealthAssessment.ProcessDeviation(
                    caseId,
                    "SEQUENCE_OUT_OF_ORDER",
                    "Potential process deviation detected: Support ticket creation occurred after resolution.",
                    expected,
                    observed,
                    "HIGH"
            );
        }

        // Check index order relative to expected sequence
        int lastExpectedIdx = -1;
        boolean outOfOrder = false;
        for (String obsStep : observed) {
            int currentExpectedIdx = -1;
            for (int e = 0; e < expected.size(); e++) {
                if (expected.get(e).equalsIgnoreCase(obsStep)) {
                    currentExpectedIdx = e;
                    break;
                }
            }
            if (currentExpectedIdx != -1) {
                if (currentExpectedIdx < lastExpectedIdx) {
                    outOfOrder = true;
                    break;
                }
                lastExpectedIdx = currentExpectedIdx;
            }
        }

        if (outOfOrder) {
            return new SOPHealthAssessment.ProcessDeviation(
                    caseId,
                    "SEQUENCE_OUT_OF_ORDER",
                    "Potential process deviation detected: Observed operational events do not align with expected SOP sequence.",
                    expected,
                    observed,
                    "MEDIUM"
            );
        }

        return null;
    }
}
