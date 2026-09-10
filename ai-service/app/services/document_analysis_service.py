import re
from typing import List
from app.schemas.analysis import DocumentChunk

class DocumentAnalysisService:
    
    def clean_text(self, raw_text: str) -> str:
        if not raw_text:
            return ""
        # Remove null bytes, normalize whitespace
        text = re.sub(r'[\r\n]+', '\n', raw_text)
        text = re.sub(r'[ \t]+', ' ', text)
        return text.strip()

    def chunk_document(self, document_id: str, text: str, max_chunk_chars: int = 500) -> List[DocumentChunk]:
        cleaned = self.clean_text(text)
        lines = cleaned.split('\n')
        
        chunks: List[DocumentChunk] = []
        current_chunk_text = ""
        current_section = "General Procedures"
        start_pos = 0
        chunk_counter = 1
        
        for line in lines:
            line_str = line.strip()
            if not line_str:
                continue
                
            # Heuristic section header detection
            if len(line_str) < 60 and (line_str.isupper() or line_str.startswith("Section") or line_str.startswith("Clause") or line_str.endswith(":")):
                current_section = line_str.rstrip(":")
                
            if len(current_chunk_text) + len(line_str) > max_chunk_chars and current_chunk_text:
                end_pos = start_pos + len(current_chunk_text)
                chunks.append(DocumentChunk(
                    chunk_id=f"chunk-{chunk_counter}",
                    document_id=document_id,
                    section=current_section,
                    text=current_chunk_text.strip(),
                    start_position=start_pos,
                    end_position=end_pos
                ))
                chunk_counter += 1
                start_pos = end_pos
                current_chunk_text = line_str + " "
            else:
                current_chunk_text += line_str + " "
                
        if current_chunk_text.strip():
            end_pos = start_pos + len(current_chunk_text)
            chunks.append(DocumentChunk(
                chunk_id=f"chunk-{chunk_counter}",
                document_id=document_id,
                section=current_section,
                text=current_chunk_text.strip(),
                start_position=start_pos,
                end_position=end_pos
            ))
            
        return chunks
