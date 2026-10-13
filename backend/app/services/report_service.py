import json
import os
from pathlib import Path
from typing import Dict, Any, Optional
from datetime import datetime

from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
    HRFlowable,
    KeepTogether
)

class ForensicReportService:
    def __init__(self, output_dir: Path):
        self.output_dir = output_dir
        self.output_dir.mkdir(parents=True, exist_ok=True)

    def generate_json_report(self, analysis_data: Dict[str, Any]) -> Path:
        """Saves machine-readable JSON forensic report."""
        filename = f"forensic_report_{analysis_data['id']}.json"
        report_path = self.output_dir / filename
        
        with open(report_path, "w", encoding="utf-8") as f:
            json.dump(analysis_data, f, indent=2, default=str)
            
        return report_path

    def generate_pdf_report(self, analysis_data: Dict[str, Any]) -> Path:
        """
        Generates a comprehensive cybersecurity forensic PDF report
        using ReportLab with dark/cyber aesthetic styling.
        """
        filename = f"forensic_report_{analysis_data['id']}.pdf"
        pdf_path = self.output_dir / filename
        
        doc = SimpleDocTemplate(
            str(pdf_path),
            pagesize=letter,
            rightMargin=40,
            leftMargin=40,
            topMargin=40,
            bottomMargin=40
        )
        
        styles = getSampleStyleSheet()
        
        # Custom styles
        title_style = ParagraphStyle(
            "DocTitle",
            parent=styles["Normal"],
            fontName="Helvetica-Bold",
            fontSize=22,
            leading=26,
            textColor=colors.HexColor("#0f172a")
        )
        
        subtitle_style = ParagraphStyle(
            "DocSubTitle",
            parent=styles["Normal"],
            fontName="Helvetica",
            fontSize=11,
            leading=14,
            textColor=colors.HexColor("#0284c7")
        )
        
        heading_style = ParagraphStyle(
            "SectionHeading",
            parent=styles["Heading2"],
            fontName="Helvetica-Bold",
            fontSize=13,
            leading=16,
            textColor=colors.HexColor("#0f172a"),
            spaceBefore=10,
            spaceAfter=6
        )
        
        body_style = ParagraphStyle(
            "BodyDark",
            parent=styles["Normal"],
            fontName="Helvetica",
            fontSize=9,
            leading=13,
            textColor=colors.HexColor("#334155")
        )
        
        disclaimer_style = ParagraphStyle(
            "Disclaimer",
            parent=styles["Normal"],
            fontName="Helvetica-Oblique",
            fontSize=8,
            leading=11,
            textColor=colors.HexColor("#64748b")
        )
        
        elements = []
        
        # 1. Header Banner
        elements.append(Paragraph("TRUTHLENS AI FORENSICS", title_style))
        elements.append(Paragraph("MULTIMODAL DEEPFAKE DETECTION & DIGITAL MEDIA AUDIT REPORT", subtitle_style))
        elements.append(Spacer(1, 10))
        elements.append(HRFlowable(width="100%", thickness=2, color=colors.HexColor("#0284c7"), spaceAfter=15))
        
        # 2. Case & File Provenance Table
        created_str = str(analysis_data.get("created_at", datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC")))
        meta_table_data = [
            [
                Paragraph("<b>Analysis ID:</b>", body_style),
                Paragraph(str(analysis_data.get("id")), body_style),
                Paragraph("<b>Timestamp:</b>", body_style),
                Paragraph(created_str, body_style)
            ],
            [
                Paragraph("<b>Original File:</b>", body_style),
                Paragraph(str(analysis_data.get("original_filename")), body_style),
                Paragraph("<b>Media Modality:</b>", body_style),
                Paragraph(str(analysis_data.get("media_type")).upper(), body_style)
            ],
            [
                Paragraph("<b>File Size:</b>", body_style),
                Paragraph(f"{round(analysis_data.get('file_size_bytes', 0) / 1024, 1)} KB", body_style),
                Paragraph("<b>Processing Duration:</b>", body_style),
                Paragraph(f"{analysis_data.get('processing_time', 0)} sec", body_style)
            ],
            [
                Paragraph("<b>SHA-256 Provenance Hash:</b>", body_style),
                Paragraph(f"<font size=7 face=Courier>{analysis_data.get('file_hash')}</font>", body_style),
                "", ""
            ]
        ]
        
        t_meta = Table(meta_table_data, colWidths=[110, 160, 110, 150])
        t_meta.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#f8fafc")),
            ("BOX", (0, 0), (-1, -1), 1, colors.HexColor("#cbd5e1")),
            ("INNERGRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#e2e8f0")),
            ("SPAN", (1, 3), (3, 3)),
            ("TOPPADDING", (0, 0), (-1, -1), 5),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
        ]))
        elements.append(t_meta)
        elements.append(Spacer(1, 15))
        
        # 3. Executive Assessment & Calibrated Score
        elements.append(Paragraph("Executive Forensic Assessment", heading_style))
        
        trust_score = float(analysis_data.get("trust_score", 0))
        risk_level = str(analysis_data.get("risk_level", "inconclusive")).upper()
        p_manip = float(analysis_data.get("manipulation_probability", 0))
        pred_class = str(analysis_data.get("predicted_class", "unknown")).upper()
        conf = float(analysis_data.get("model_confidence", 0))
        
        # Score banner color
        if trust_score >= 80:
            badge_color = colors.HexColor("#10b981")  # Emerald
            risk_color = colors.HexColor("#047857")
        elif trust_score >= 60:
            badge_color = colors.HexColor("#3b82f6")  # Blue
            risk_color = colors.HexColor("#1d4ed8")
        elif trust_score >= 40:
            badge_color = colors.HexColor("#f59e0b")  # Amber
            risk_color = colors.HexColor("#b45309")
        else:
            badge_color = colors.HexColor("#ef4444")  # Rose/Red
            risk_color = colors.HexColor("#b91c1c")
            
        score_table_data = [
            [
                Paragraph("<b>CALIBRATED TRUST SCORE</b>", body_style),
                Paragraph("<b>PREDICTED CLASS</b>", body_style),
                Paragraph("<b>SYNTHESIS PROBABILITY</b>", body_style),
                Paragraph("<b>RISK ASSESSMENT</b>", body_style),
                Paragraph("<b>CONFIDENCE</b>", body_style)
            ],
            [
                Paragraph(f"<font size=18 color={badge_color.hexval()}><b>{trust_score} / 100</b></font>", body_style),
                Paragraph(f"<b>{pred_class}</b>", body_style),
                Paragraph(f"<b>{round(p_manip * 100, 1)}%</b>", body_style),
                Paragraph(f"<font color={risk_color.hexval()}><b>{risk_level}</b></font>", body_style),
                Paragraph(f"<b>{round(conf * 100, 1)}%</b>", body_style)
            ]
        ]
        
        t_score = Table(score_table_data, colWidths=[130, 95, 115, 100, 90])
        t_score.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#f1f5f9")),
            ("BOX", (0, 0), (-1, -1), 1.5, colors.HexColor("#94a3b8")),
            ("INNERGRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#cbd5e1")),
            ("ALIGN", (0, 0), (-1, -1), "CENTER"),
            ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
            ("TOPPADDING", (0, 0), (-1, -1), 6),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
        ]))
        elements.append(t_score)
        elements.append(Spacer(1, 15))
        
        # 4. Forensic Narrative & Explanation
        elements.append(Paragraph("Forensic Findings & Technical Explanation", heading_style))
        explanation_text = analysis_data.get("explanation", "No detailed findings available.")
        elements.append(Paragraph(explanation_text, body_style))
        elements.append(Spacer(1, 12))
        
        # 5. Evidence & Localized Discontinuities
        elements.append(Paragraph("Evidence Items & Anomaly Localizations", heading_style))
        evidence_items = analysis_data.get("evidence_items", [])
        
        evidence_table_data = [
            [
                Paragraph("<b>Evidence Type</b>", body_style),
                Paragraph("<b>Region / Timestamp</b>", body_style),
                Paragraph("<b>Technical Observation</b>", body_style),
                Paragraph("<b>Reference</b>", body_style)
            ]
        ]
        
        for item in evidence_items:
            evidence_table_data.append([
                Paragraph(str(item.get("evidence_type", "")).replace("_", " ").title(), body_style),
                Paragraph(str(item.get("timestamp_or_region", "-")), body_style),
                Paragraph(str(item.get("evidence_description", "")), body_style),
                Paragraph(str(item.get("evidence_reference", "-")), body_style)
            ])
            
        if len(evidence_table_data) == 1:
            evidence_table_data.append([
                Paragraph("Global Frame Analysis", body_style),
                Paragraph("Full Scope", body_style),
                Paragraph("Baseline consistency observed across all tested parameters.", body_style),
                Paragraph("Baseline", body_style)
            ])
            
        t_evidence = Table(evidence_table_data, colWidths=[110, 110, 220, 90])
        t_evidence.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#e2e8f0")),
            ("BOX", (0, 0), (-1, -1), 1, colors.HexColor("#cbd5e1")),
            ("INNERGRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#e2e8f0")),
            ("TOPPADDING", (0, 0), (-1, -1), 5),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
        ]))
        elements.append(t_evidence)
        elements.append(Spacer(1, 15))
        
        # 6. Model Specification & Metadata
        elements.append(Paragraph("Model Architecture & Methodology", heading_style))
        model_ver = analysis_data.get("model_version", "TruthLens-v1.0")
        methodology_text = (
            f"<b>Primary Detector:</b> {model_ver}<br/>"
            f"<b>Feature Mechanism:</b> Vision Transformer (ViT-Base/16) attention rollout, "
            f"temporal differential modeling, and acoustic spectral flux estimation.<br/>"
            f"<b>Calibration Standard:</b> Held-out validation calibration mapping with Expected Calibration Error (ECE) minimization."
        )
        elements.append(Paragraph(methodology_text, body_style))
        elements.append(Spacer(1, 12))
        
        # 7. Limitations & Uncertainty Disclosure
        elements.append(Paragraph("Technical Limitations & Legal Disclaimer", heading_style))
        limitations_text = analysis_data.get(
            "limitations",
            "This report is generated by probabilistic deep learning models. Scores represent statistical likelihood and do not constitute absolute proof."
        )
        elements.append(Paragraph(limitations_text, disclaimer_style))
        elements.append(Spacer(1, 8))
        elements.append(Paragraph(
            "<b>Chain of Custody & Responsible Use:</b> TruthLens AI estimates media manipulation probabilities "
            "based on structural and spectral signatures. Model predictions must be used in conjunction with qualified "
            "human forensic inspection. Never treat trust scores as a verified declaration of fact or source identity.",
            disclaimer_style
        ))
        
        doc.build(elements)
        return pdf_path
