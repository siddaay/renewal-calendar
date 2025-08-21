import pdfplumber
import logging

logger = logging.getLogger(__name__)

def process_pdf(filepath):
    """Extract text from PDF using pdfplumber"""
    try:
        text_content = []
        
        with pdfplumber.open(filepath) as pdf:
            for page_num, page in enumerate(pdf.pages):
                # Extract text
                text = page.extract_text()
                if text:
                    text_content.append(f"--- Page {page_num + 1} ---")
                    text_content.append(text)
                
                # Extract tables if any
                tables = page.extract_tables()
                for table_num, table in enumerate(tables):
                    text_content.append(f"--- Table {table_num + 1} on Page {page_num + 1} ---")
                    for row in table:
                        if row:
                            text_content.append(" | ".join(str(cell) if cell else "" for cell in row))
        
        full_text = "\\n".join(text_content)
        logger.info(f"Extracted {len(full_text)} characters from PDF")
        
        return full_text
        
    except Exception as e:
        logger.error(f"Error processing PDF {filepath}: {str(e)}")
        raise