package com.talentpulse.ats.service;

import com.talentpulse.ats.dto.ResumeParseResultDTO;
import com.talentpulse.ats.model.Job;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.apache.poi.xwpf.extractor.XWPFWordExtractor;
import org.apache.poi.xwpf.usermodel.XWPFDocument;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
public class ResumeParserService {

    private static final List<String> TECH_DICTIONARY = List.of(
            "Java", "Spring Boot", "Spring Data JPA", "Spring Security", "React", "React.js", "Redux",
            "JavaScript", "TypeScript", "Python", "Node.js", "Express", "SQL", "PostgreSQL", "MySQL",
            "MongoDB", "H2", "Docker", "Kubernetes", "AWS", "Azure", "GCP", "Microservices", "REST API",
            "GraphQL", "HTML5", "CSS3", "Tailwind CSS", "Bootstrap", "Git", "GitHub", "GitLab",
            "Jenkins", "CI/CD", "JUnit", "Mockito", "C++", "C#", ".NET", "Go", "Golang", "Rust",
            "PHP", "Laravel", "Vue.js", "Angular", "Next.js", "Linux", "System Design", "Agile",
            "Scrum", "Jira", "Kafka", "RabbitMQ", "Redis", "Elasticsearch", "Machine Learning", "AI"
    );

    private static final List<String> EDUCATION_KEYWORDS = List.of(
            "Bachelor of Science", "Bachelor of Technology", "Bachelor of Engineering", "Bachelor",
            "B.S.", "B.Tech", "B.E.", "B.A.", "Master of Science", "Master of Technology", "Master",
            "M.S.", "M.Tech", "M.E.", "M.B.A.", "Ph.D.", "Doctorate", "Diploma",
            "Computer Science", "Information Technology", "Software Engineering", "Electrical Engineering"
    );

    public String extractTextFromFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            return "";
        }
        String originalFilename = file.getOriginalFilename() != null ? file.getOriginalFilename().toLowerCase() : "";
        try (InputStream is = file.getInputStream()) {
            if (originalFilename.endsWith(".pdf")) {
                try (PDDocument document = PDDocument.load(is)) {
                    PDFTextStripper stripper = new PDFTextStripper();
                    return stripper.getText(document);
                }
            } else if (originalFilename.endsWith(".docx") || originalFilename.endsWith(".doc")) {
                try (XWPFDocument doc = new XWPFDocument(is);
                     XWPFWordExtractor extractor = new XWPFWordExtractor(doc)) {
                    return extractor.getText();
                }
            } else {
                return new String(file.getBytes());
            }
        } catch (Exception e) {
            return "Error extracting text: " + e.getMessage();
        }
    }

    public ResumeParseResultDTO analyzeResume(String fileName, String text, Job job) {
        String safeText = text != null ? text : "";
        String lowerText = safeText.toLowerCase();

        // 1. Extract skills from tech dictionary
        List<String> extractedSkills = TECH_DICTIONARY.stream()
                .filter(skill -> Pattern.compile("\\b" + Pattern.quote(skill.toLowerCase()) + "\\b")
                        .matcher(lowerText).find())
                .collect(Collectors.toList());

        // 2. Extract education
        List<String> foundEducation = EDUCATION_KEYWORDS.stream()
                .filter(edu -> lowerText.contains(edu.toLowerCase()))
                .collect(Collectors.toList());
        String extractedEducationStr = foundEducation.isEmpty()
                ? "Higher Education / Technical Degree"
                : String.join(", ", foundEducation);

        // 3. Estimate experience years
        int estimatedYears = estimateExperienceYears(safeText);

        // 4. Calculate ATS Match Score against Job
        List<String> requiredSkillsList = getRequiredSkillsList(job != null ? job.getRequiredSkills() : "");
        List<String> matchedSkills = new ArrayList<>();
        List<String> missingSkills = new ArrayList<>();

        if (!requiredSkillsList.isEmpty()) {
            for (String reqSkill : requiredSkillsList) {
                boolean hasSkill = extractedSkills.stream()
                        .anyMatch(s -> s.equalsIgnoreCase(reqSkill.trim())) || lowerText.contains(reqSkill.toLowerCase().trim());
                if (hasSkill) {
                    matchedSkills.add(reqSkill.trim());
                } else {
                    missingSkills.add(reqSkill.trim());
                }
            }
        } else {
            matchedSkills.addAll(extractedSkills);
        }

        int atsScore = calculateAtsScore(extractedSkills, matchedSkills, missingSkills, requiredSkillsList, estimatedYears, job);

        return new ResumeParseResultDTO(
                fileName,
                safeText,
                estimatedYears,
                extractedEducationStr,
                extractedSkills,
                matchedSkills,
                missingSkills,
                atsScore
        );
    }

    private int estimateExperienceYears(String text) {
        int maxYears = 1;

        // Check for explicit "X+ years", "X years of experience"
        Pattern expPattern = Pattern.compile("(\\d{1,2})\\+?\\s*(?:years?|yrs?)\\s*(?:of)?\\s*(?:exp|experience)?", Pattern.CASE_INSENSITIVE);
        Matcher matcher = expPattern.matcher(text);
        while (matcher.find()) {
            try {
                int years = Integer.parseInt(matcher.group(1));
                if (years > maxYears && years <= 35) {
                    maxYears = years;
                }
            } catch (NumberFormatException ignored) {}
        }

        // Check for year ranges e.g. 2018 - 2023, 2020 - Present
        Pattern yearRangePattern = Pattern.compile("(20\\d{2})\\s*[-–—]\\s*(20\\d{2}|present|current)", Pattern.CASE_INSENSITIVE);
        Matcher rangeMatcher = yearRangePattern.matcher(text);
        int totalRangeYears = 0;
        int currentYear = 2026;
        while (rangeMatcher.find()) {
            try {
                int start = Integer.parseInt(rangeMatcher.group(1));
                String endGroup = rangeMatcher.group(2).toLowerCase();
                int end = endGroup.contains("present") || endGroup.contains("current") ? currentYear : Integer.parseInt(endGroup);
                int diff = end - start;
                if (diff > 0 && diff <= 25) {
                    totalRangeYears += diff;
                }
            } catch (Exception ignored) {}
        }

        return Math.max(maxYears, Math.min(totalRangeYears, 30));
    }

    private List<String> getRequiredSkillsList(String requiredSkillsStr) {
        if (requiredSkillsStr == null || requiredSkillsStr.trim().isEmpty()) {
            return Collections.emptyList();
        }
        return Arrays.stream(requiredSkillsStr.split("[,;]"))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .collect(Collectors.toList());
    }

    private int calculateAtsScore(List<String> extractedSkills, List<String> matchedSkills, List<String> missingSkills, List<String> requiredSkills, int candidateYears, Job job) {
        if (job == null) {
            return Math.min(100, 50 + (extractedSkills.size() * 5));
        }

        double skillScore = 0.0;
        if (!requiredSkills.isEmpty()) {
            skillScore = ((double) matchedSkills.size() / requiredSkills.size()) * 60.0;
        } else {
            skillScore = Math.min(60.0, extractedSkills.size() * 6.0);
        }

        double expScore = 25.0;
        if (job.getRequiredExperienceYears() != null && job.getRequiredExperienceYears() > 0) {
            double ratio = (double) candidateYears / job.getRequiredExperienceYears();
            expScore = Math.min(25.0, ratio * 25.0);
        }

        double bonus = 15.0; // Baseline education & keywords match score
        if (matchedSkills.size() > 0 && matchedSkills.size() == requiredSkills.size()) {
            bonus += 5.0;
        }

        int finalScore = (int) Math.round(skillScore + expScore + bonus);
        return Math.max(20, Math.min(99, finalScore));
    }
}
