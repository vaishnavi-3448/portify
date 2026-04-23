import re

SECTION_HEADERS = [
    "education",
    "experience",
    "work experience",
    "projects",
    "skills",
    "technical skills",
    "certifications",
    "summary",
    "objective",
    "profile",
    "internships",
    "achievements"
]

EMAIL_REGEX = r'[\w\.-]+@[\w\.-]+\.\w+'
PHONE_REGEX = r'(\+?\d[\d\-\(\)\s]{8,}\d)'
DATE_REGEX = r'((jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*[\s\-\,]*\d{2,4}\s*(to|-)?\s*((jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*[\s\-\,]*\d{2,4}|present)?)'
YEAR_RANGE_REGEX = r'(\d{4}\s*[-–to]+\s*(\d{4}|present))'

def clean_line(line: str):
    return re.sub(r'\s+', ' ', line).strip("•- \t")

def extract_email(text: str):
    match = re.search(EMAIL_REGEX, text, re.IGNORECASE)
    return match.group(0) if match else ""

def extract_phone(text: str):
    match = re.search(PHONE_REGEX, text)
    return match.group(0).strip() if match else ""

def extract_name(lines):
    if not lines:
        return ""
    first_line = clean_line(lines[0])
    if re.search(EMAIL_REGEX, first_line) or re.search(PHONE_REGEX, first_line):
        return ""
    return first_line

def normalize_heading(line: str):
    return clean_line(line).lower().rstrip(":")

def is_section_header(line: str):
    return normalize_heading(line) in SECTION_HEADERS

def extract_section(lines, section_names):
    if isinstance(section_names, str):
        section_names = [section_names]

    normalized_targets = [name.lower() for name in section_names]
    content = []
    capture = False

    for line in lines:
        stripped = clean_line(line)
        lower = normalize_heading(stripped)

        if lower in normalized_targets:
            capture = True
            continue

        if capture and lower in SECTION_HEADERS:
            break

        if capture and stripped:
            content.append(stripped)

    return content

def split_into_blocks(lines):
    """
    Splits section lines into blocks.
    A new block starts when:
    - a line looks like a title/company heading
    - or previous line ended and current line is not a bullet
    """
    blocks = []
    current = []

    for line in lines:
        stripped = clean_line(line)

        if not stripped:
            continue

        looks_like_new_entry = (
            len(current) == 0
            or (
                not stripped.startswith(("•", "-", "*"))
                and len(stripped.split()) <= 10
                and current
                and not current[-1].endswith(":")
            )
        )

        if looks_like_new_entry and current:
            blocks.append(current)
            current = [stripped]
        else:
            current.append(stripped)

    if current:
        blocks.append(current)

    return blocks

def extract_dates(text: str):
    text_lower = text.lower()
    match = re.search(DATE_REGEX, text_lower, re.IGNORECASE)
    if match:
        return match.group(0)
    match = re.search(YEAR_RANGE_REGEX, text, re.IGNORECASE)
    if match:
        return match.group(0)
    return ""

def parse_experience(lines):
    blocks = split_into_blocks(lines)
    parsed = []

    for block in blocks:
        if not block:
            continue

        title_line = block[0]
        duration = ""
        company = ""
        description_lines = []

        if len(block) > 1:
            second_line = block[1]
            date_in_second = extract_dates(second_line)
            if date_in_second:
                duration = date_in_second
                company = second_line.replace(date_in_second, "").strip(" |,-")
                description_lines = block[2:]
            else:
                company = second_line
                duration = extract_dates(" ".join(block[:3]))
                description_lines = block[2:]
        else:
            duration = extract_dates(title_line)

        parsed.append({
            "role": title_line,
            "company": company,
            "duration": duration,
            "description": " ".join(description_lines[:2]).strip(),
            "bullets": description_lines
        })

    return [item for item in parsed if item["role"]]

def parse_education(lines):
    blocks = split_into_blocks(lines)
    parsed = []

    for block in blocks:
        if not block:
            continue

        first = block[0]
        second = block[1] if len(block) > 1 else ""
        duration = extract_dates(" ".join(block[:3]))

        degree = first
        institution = second if second else ""
        details = block[2:] if len(block) > 2 else []

        parsed.append({
            "degree": degree,
            "institution": institution,
            "duration": duration,
            "details": details
        })

    return [item for item in parsed if item["degree"]]

def parse_projects(lines):
    blocks = split_into_blocks(lines)
    parsed = []

    for block in blocks:
        if not block:
            continue

        title = block[0]
        rest = block[1:] if len(block) > 1 else []

        parsed.append({
            "title": title,
            "description": " ".join(rest[:3]).strip(),
            "details": rest,
            "category": "Technical",
            "link": ""
        })

    return [item for item in parsed if item["title"]]

def parse_certifications(lines):
    parsed = []

    for line in lines:
        line = clean_line(line)
        if not line:
            continue

        parts = [p.strip() for p in re.split(r'[-|–]', line, maxsplit=1)]
        title = parts[0]
        issuer = parts[1] if len(parts) > 1 else ""

        parsed.append({
            "title": title,
            "issuer": issuer
        })

    return parsed

def parse_skills(lines):
    skills = []

    for line in lines:
        line = clean_line(line)
        parts = re.split(r',|•|\||/', line)
        for part in parts:
            skill = clean_line(part)
            if skill:
                skills.append(skill)

    # remove duplicates while preserving order
    seen = set()
    unique_skills = []
    for skill in skills:
        lower = skill.lower()
        if lower not in seen:
            seen.add(lower)
            unique_skills.append(skill)

    return unique_skills

def parse_summary(lines):
    if not lines:
        return ""
    return " ".join(lines).strip()

def parse_resume_text(text: str):
    lines = [clean_line(line) for line in text.splitlines() if clean_line(line)]

    experience_lines = extract_section(lines, ["Experience", "Work Experience", "Internships"])
    education_lines = extract_section(lines, "Education")
    project_lines = extract_section(lines, "Projects")
    skill_lines = extract_section(lines, ["Skills", "Technical Skills"])
    certification_lines = extract_section(lines, "Certifications")
    summary_lines = extract_section(lines, ["Summary", "Objective", "Profile"])

    parsed_data = {
        "name": extract_name(lines),
        "email": extract_email(text),
        "phone": extract_phone(text),
        "summary": parse_summary(summary_lines),
        "skills": parse_skills(skill_lines),
        "experience": parse_experience(experience_lines),
        "education": parse_education(education_lines),
        "projects": parse_projects(project_lines),
        "certifications": parse_certifications(certification_lines)
    }

    return parsed_data