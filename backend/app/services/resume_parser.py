import re

SECTION_HEADERS = [
    "education",
    "experience",
    "projects",
    "skills",
    "certifications",
    "summary",
    "objective",
    "technical skills"
]

def extract_email(text: str):
    match = re.search(r'[\w\.-]+@[\w\.-]+\.\w+', text)
    return match.group(0) if match else "Not Found"

def extract_phone(text: str):
    match = re.search(r'(\+?\d[\d\-\(\)\s]{8,}\d)', text)
    return match.group(0) if match else "Not Found"

def extract_name(lines):
    return lines[0].strip() if lines else "Not Found"

def extract_section(lines, section_name):
    content = []
    capture = False

    for line in lines:
        stripped = line.strip()
        lower = stripped.lower()

        if lower == section_name.lower():
            capture = True
            continue

        if capture and lower in SECTION_HEADERS:
            break

        if capture and stripped:
            content.append(stripped)

    return content

def parse_resume_text(text: str):
    lines = [line.strip() for line in text.splitlines() if line.strip()]

    parsed_data = {
        "name": extract_name(lines),
        "email": extract_email(text),
        "phone": extract_phone(text),
        "education": extract_section(lines, "Education"),
        "experience": extract_section(lines, "Experience"),
        "projects": extract_section(lines, "Projects"),
        "skills": extract_section(lines, "Skills"),
        "certifications": extract_section(lines, "Certifications"),
        "summary": extract_section(lines, "Summary")
    }

    return parsed_data