import { useState, useRef, useCallback, useEffect } from "react";

// ============================================================
// ⚙️  設定區：填入你的 Google Cloud Console 憑證
// ============================================================
const GOOGLE_CLIENT_ID = "255269588123-tgk1iqemmackhfc79se5afotnv6845sn.apps.googleusercontent.com";
// 在 Google Cloud Console → APIs & Services → Credentials 建立
// Authorized JavaScript origins: http://localhost:3000 (或你的網域)
// Authorized redirect URIs: 同上
// 啟用 API: Google Drive API
// ============================================================

const SCOPES = "https://www.googleapis.com/auth/drive.file";
const DISCOVERY_DOC = "https://www.googleapis.com/discovery/v1/apis/drive/v3/rest";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    font-family: 'Sora', sans-serif;
    background: #0a0a0f;
    min-height: 100vh;
    color: #e8e8f0;
    overflow-x: hidden;
  }

  :root {
    --accent: #00e5c3;
    --accent2: #7b5ea7;
    --surface: #13131f;
    --surface2: #1c1c2e;
    --border: rgba(255,255,255,0.07);
    --text-muted: #6b6b8a;
    --google: #4285F4;
  }

  .app-wrap {
    max-width: 430px;
    margin: 0 auto;
    min-height: 100vh;
    background: #0a0a0f;
    position: relative;
    overflow: hidden;
  }

  .bg-glow {
    position: fixed;
    top: -200px;
    left: 50%;
    transform: translateX(-50%);
    width: 600px;
    height: 400px;
    background: radial-gradient(ellipse, rgba(0,229,195,0.06) 0%, transparent 70%);
    pointer-events: none;
    z-index: 0;
  }

  /* ── Auth screen ── */
  .auth-screen {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 40px 28px;
    text-align: center;
    position: relative;
    z-index: 10;
  }

  .auth-logo {
    width: 80px;
    height: 80px;
    border-radius: 24px;
    background: linear-gradient(135deg, rgba(0,229,195,0.15), rgba(123,94,167,0.15));
    border: 1.5px solid rgba(0,229,195,0.2);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 36px;
    margin-bottom: 24px;
    animation: floatLogo 3s ease-in-out infinite;
  }

  @keyframes floatLogo {
    0%,100% { transform: translateY(0); }
    50% { transform: translateY(-8px); }
  }

  .auth-title {
    font-size: 26px;
    font-weight: 700;
    letter-spacing: -0.02em;
    margin-bottom: 10px;
  }

  .auth-title span { color: var(--accent); }

  .auth-desc {
    font-size: 13px;
    color: var(--text-muted);
    line-height: 1.65;
    max-width: 280px;
    margin-bottom: 36px;
  }

  .btn-google {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    background: var(--google);
    color: white;
    border: none;
    border-radius: 14px;
    padding: 15px 28px;
    font-family: 'Sora', sans-serif;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    width: 100%;
    max-width: 300px;
    transition: all 0.2s;
    box-shadow: 0 4px 20px rgba(66,133,244,0.3);
  }

  .btn-google:hover {
    background: #3367d6;
    transform: translateY(-2px);
    box-shadow: 0 8px 28px rgba(66,133,244,0.4);
  }

  .btn-google:active { transform: translateY(0); }

  .btn-google:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }

  .google-icon {
    width: 20px;
    height: 20px;
    background: white;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    font-weight: 900;
    color: var(--google);
    flex-shrink: 0;
  }

  .auth-note {
    margin-top: 20px;
    font-size: 11px;
    color: var(--text-muted);
    line-height: 1.6;
    max-width: 260px;
  }

  /* ── Setup notice ── */
  .setup-banner {
    background: rgba(255,180,0,0.08);
    border: 1.5px solid rgba(255,180,0,0.2);
    border-radius: 12px;
    padding: 14px 16px;
    margin-bottom: 20px;
    font-size: 11px;
    color: rgba(255,200,50,0.9);
    line-height: 1.6;
  }

  .setup-banner strong { display: block; margin-bottom: 4px; font-size: 12px; }

  .setup-banner code {
    background: rgba(255,255,255,0.08);
    padding: 1px 5px;
    border-radius: 4px;
    font-family: 'JetBrains Mono', monospace;
    font-size: 10px;
  }

  /* ── Header ── */
  .header {
    padding: 56px 24px 20px;
    position: relative;
    z-index: 10;
  }

  .header-top {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    margin-bottom: 4px;
  }

  .header-eyebrow {
    font-family: 'JetBrains Mono', monospace;
    font-size: 10px;
    letter-spacing: 0.2em;
    color: var(--accent);
    text-transform: uppercase;
    margin-bottom: 6px;
  }

  .header-title {
    font-size: 26px;
    font-weight: 700;
    letter-spacing: -0.02em;
    line-height: 1.15;
  }

  .header-title span { color: var(--accent); }

  /* User badge */
  .user-badge {
    display: flex;
    align-items: center;
    gap: 8px;
    background: var(--surface);
    border: 1.5px solid var(--border);
    border-radius: 20px;
    padding: 6px 10px 6px 6px;
    cursor: pointer;
    transition: border-color 0.2s;
    flex-shrink: 0;
    margin-top: 4px;
  }

  .user-badge:hover { border-color: rgba(255,255,255,0.15); }

  .user-avatar {
    width: 26px;
    height: 26px;
    border-radius: 50%;
    object-fit: cover;
  }

  .user-avatar-placeholder {
    width: 26px;
    height: 26px;
    border-radius: 50%;
    background: var(--google);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 11px;
    font-weight: 700;
    color: white;
  }

  .user-name {
    font-size: 11px;
    font-weight: 500;
    max-width: 80px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .logout-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: rgba(255,100,100,0.6);
  }

  /* ── Content ── */
  .content {
    padding: 0 20px 120px;
    position: relative;
    z-index: 10;
  }

  .scan-area {
    background: var(--surface);
    border: 1.5px solid var(--border);
    border-radius: 20px;
    overflow: hidden;
    position: relative;
    aspect-ratio: 3/4;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: border-color 0.3s, box-shadow 0.3s;
    margin-bottom: 16px;
  }

  .scan-area:hover {
    border-color: rgba(0,229,195,0.3);
    box-shadow: 0 0 40px rgba(0,229,195,0.05);
  }

  .scan-area.active {
    border-color: var(--accent);
    box-shadow: 0 0 40px rgba(0,229,195,0.1), inset 0 0 40px rgba(0,229,195,0.03);
  }

  .scan-brackets { position: absolute; inset: 16px; pointer-events: none; }

  .bracket {
    position: absolute;
    width: 28px;
    height: 28px;
    border-color: var(--accent);
    border-style: solid;
    opacity: 0.7;
    transition: opacity 0.3s;
  }

  .scan-area.active .bracket { opacity: 1; }
  .bracket-tl { top: 0; left: 0; border-width: 2px 0 0 2px; border-radius: 4px 0 0 0; }
  .bracket-tr { top: 0; right: 0; border-width: 2px 2px 0 0; border-radius: 0 4px 0 0; }
  .bracket-bl { bottom: 0; left: 0; border-width: 0 0 2px 2px; border-radius: 0 0 0 4px; }
  .bracket-br { bottom: 0; right: 0; border-width: 0 2px 2px 0; border-radius: 0 0 4px 0; }

  @keyframes scanLine {
    0% { top: 10%; opacity: 0; }
    5% { opacity: 1; }
    95% { opacity: 1; }
    100% { top: 90%; opacity: 0; }
  }

  .scan-line {
    position: absolute;
    left: 10%; right: 10%;
    height: 1.5px;
    background: linear-gradient(90deg, transparent, var(--accent), transparent);
    animation: scanLine 2s ease-in-out infinite;
    display: none;
  }

  .scan-area.active .scan-line { display: block; }

  .camera-preview {
    width: 100%; height: 100%;
    object-fit: cover;
    position: absolute; inset: 0;
  }

  .empty-state {
    display: flex; flex-direction: column;
    align-items: center; gap: 12px;
    padding: 40px; text-align: center;
  }

  .empty-icon {
    width: 64px; height: 64px;
    border-radius: 18px;
    background: rgba(0,229,195,0.06);
    border: 1.5px solid rgba(0,229,195,0.15);
    display: flex; align-items: center; justify-content: center;
    font-size: 26px;
  }

  .empty-title { font-size: 15px; font-weight: 600; }
  .empty-sub { font-size: 12px; color: var(--text-muted); line-height: 1.5; max-width: 200px; }

  .pages-strip {
    display: flex; gap: 10px;
    overflow-x: auto;
    padding: 4px 0 12px;
    scrollbar-width: none;
    margin-bottom: 16px;
  }
  .pages-strip::-webkit-scrollbar { display: none; }

  .page-thumb {
    flex-shrink: 0;
    width: 64px; height: 84px;
    border-radius: 10px;
    border: 1.5px solid var(--border);
    overflow: hidden; position: relative;
    cursor: pointer;
    transition: border-color 0.2s, transform 0.2s;
  }
  .page-thumb:hover { transform: scale(1.05); }
  .page-thumb.selected { border-color: var(--accent); }
  .page-thumb img { width: 100%; height: 100%; object-fit: cover; }

  .page-num {
    position: absolute; bottom: 3px; right: 5px;
    font-family: 'JetBrains Mono', monospace; font-size: 9px;
    color: rgba(255,255,255,0.7); background: rgba(0,0,0,0.5);
    padding: 1px 4px; border-radius: 3px;
  }

  .page-del {
    position: absolute; top: 3px; right: 3px;
    width: 16px; height: 16px;
    background: rgba(255,60,60,0.8); border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-size: 9px; color: white; opacity: 0;
    transition: opacity 0.2s; cursor: pointer;
  }
  .page-thumb:hover .page-del { opacity: 1; }

  .add-page-btn {
    flex-shrink: 0;
    width: 64px; height: 84px;
    border-radius: 10px;
    border: 1.5px dashed rgba(0,229,195,0.3);
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    gap: 4px; cursor: pointer;
    transition: border-color 0.2s, background 0.2s;
    color: var(--accent); font-size: 20px;
  }
  .add-page-btn:hover { border-color: var(--accent); background: rgba(0,229,195,0.04); }
  .add-page-label { font-size: 8px; font-weight: 600; letter-spacing: 0.05em; text-transform: uppercase; color: var(--accent); }

  .section-label {
    font-family: 'JetBrains Mono', monospace;
    font-size: 10px; letter-spacing: 0.15em;
    color: var(--text-muted); text-transform: uppercase;
    margin-bottom: 10px;
  }

  .settings-card {
    background: var(--surface);
    border: 1.5px solid var(--border);
    border-radius: 16px; overflow: hidden; margin-bottom: 16px;
  }

  .setting-row {
    display: flex; align-items: center;
    justify-content: space-between;
    padding: 14px 16px;
    border-bottom: 1px solid var(--border); gap: 12px;
  }
  .setting-row:last-child { border-bottom: none; }
  .setting-info { flex: 1; }
  .setting-name { font-size: 13px; font-weight: 500; margin-bottom: 2px; }
  .setting-desc { font-size: 11px; color: var(--text-muted); }

  .toggle {
    width: 40px; height: 22px;
    background: rgba(255,255,255,0.1);
    border-radius: 11px; position: relative;
    cursor: pointer; transition: background 0.3s; flex-shrink: 0;
  }
  .toggle.on { background: var(--accent); }
  .toggle-knob {
    position: absolute; top: 3px; left: 3px;
    width: 16px; height: 16px;
    background: white; border-radius: 50%;
    transition: transform 0.3s;
    box-shadow: 0 1px 4px rgba(0,0,0,0.3);
  }
  .toggle.on .toggle-knob { transform: translateX(18px); }

  /* Drive folder selector */
  .folder-row {
    display: flex; align-items: center; gap: 10px;
    background: var(--surface);
    border: 1.5px solid var(--border);
    border-radius: 12px; padding: 12px 14px;
    margin-bottom: 16px; cursor: pointer;
    transition: border-color 0.2s;
  }
  .folder-row:hover { border-color: rgba(0,229,195,0.3); }
  .folder-icon { font-size: 20px; }
  .folder-info { flex: 1; }
  .folder-name { font-size: 13px; font-weight: 500; }
  .folder-path { font-size: 11px; color: var(--text-muted); font-family: 'JetBrains Mono', monospace; }
  .folder-chevron { color: var(--text-muted); font-size: 14px; }

  .input-field {
    width: 100%;
    background: var(--surface); border: 1.5px solid var(--border);
    border-radius: 12px; padding: 12px 14px;
    color: #e8e8f0; font-family: 'Sora', sans-serif; font-size: 13px;
    outline: none; transition: border-color 0.2s; margin-bottom: 16px;
  }
  .input-field:focus { border-color: rgba(0,229,195,0.5); }
  .input-field::placeholder { color: var(--text-muted); }

  .btn-row { display: flex; gap: 10px; margin-bottom: 16px; }

  .btn {
    flex: 1; padding: 14px; border-radius: 14px; border: none;
    font-family: 'Sora', sans-serif; font-size: 13px; font-weight: 600;
    cursor: pointer; transition: all 0.2s;
    display: flex; align-items: center; justify-content: center; gap: 8px;
  }
  .btn-primary { background: var(--accent); color: #0a0a0f; }
  .btn-primary:hover { background: #00ffda; transform: translateY(-1px); box-shadow: 0 8px 24px rgba(0,229,195,0.25); }
  .btn-primary:active { transform: translateY(0); }
  .btn-secondary { background: var(--surface); color: #e8e8f0; border: 1.5px solid var(--border); }
  .btn-secondary:hover { border-color: rgba(255,255,255,0.15); background: var(--surface2); }
  .btn:disabled { opacity: 0.4; cursor: not-allowed; transform: none !important; box-shadow: none !important; }

  /* Modal */
  .modal-overlay {
    position: fixed; inset: 0;
    background: rgba(0,0,0,0.7); backdrop-filter: blur(8px);
    display: flex; align-items: flex-end; justify-content: center;
    z-index: 100; padding: 20px;
  }

  .modal {
    background: var(--surface); border: 1.5px solid var(--border);
    border-radius: 24px 24px 20px 20px; padding: 28px 24px;
    width: 100%; max-width: 430px;
    animation: slideUp 0.4s cubic-bezier(0.34,1.56,0.64,1);
  }

  @keyframes slideUp {
    from { transform: translateY(100%); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }

  .modal-title { font-size: 18px; font-weight: 700; margin-bottom: 6px; }
  .modal-sub { font-size: 12px; color: var(--text-muted); margin-bottom: 24px; }

  .progress-steps { display: flex; flex-direction: column; gap: 12px; margin-bottom: 24px; }

  .step { display: flex; align-items: center; gap: 12px; }

  .step-icon {
    width: 36px; height: 36px; border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    font-size: 14px; flex-shrink: 0; transition: all 0.3s;
  }
  .step-icon.waiting { background: rgba(255,255,255,0.05); color: var(--text-muted); }
  .step-icon.active { background: rgba(0,229,195,0.1); color: var(--accent); animation: pulse 1.5s ease-in-out infinite; }
  .step-icon.done { background: rgba(0,229,195,0.15); color: var(--accent); }

  @keyframes pulse {
    0%,100% { box-shadow: 0 0 0 0 rgba(0,229,195,0.3); }
    50% { box-shadow: 0 0 0 8px rgba(0,229,195,0); }
  }

  .step-info { flex: 1; }
  .step-name { font-size: 13px; font-weight: 500; margin-bottom: 2px; }
  .step-status { font-family: 'JetBrains Mono', monospace; font-size: 10px; color: var(--text-muted); }
  .step-status.active-text { color: var(--accent); }
  .step-status.done-text { color: rgba(0,229,195,0.7); }

  .progress-bar-wrap { background: rgba(255,255,255,0.05); border-radius: 6px; height: 4px; overflow: hidden; margin-bottom: 20px; }
  .progress-bar-fill { height: 100%; background: linear-gradient(90deg, var(--accent2), var(--accent)); border-radius: 6px; transition: width 0.5s ease; }
  .progress-pct { font-family: 'JetBrains Mono', monospace; font-size: 11px; color: var(--text-muted); text-align: right; margin-bottom: 20px; }

  @keyframes successPop {
    0% { transform: scale(0.5); opacity: 0; }
    70% { transform: scale(1.1); }
    100% { transform: scale(1); opacity: 1; }
  }

  .success-icon {
    width: 60px; height: 60px; border-radius: 18px;
    background: rgba(0,229,195,0.1); border: 2px solid rgba(0,229,195,0.3);
    display: flex; align-items: center; justify-content: center;
    font-size: 28px; margin: 0 auto 16px;
    animation: successPop 0.5s cubic-bezier(0.34,1.56,0.64,1);
  }

  .success-link {
    display: flex; align-items: center; justify-content: space-between;
    background: rgba(0,229,195,0.06); border: 1px solid rgba(0,229,195,0.15);
    border-radius: 10px; padding: 10px 14px; margin-bottom: 16px;
    font-family: 'JetBrains Mono', monospace; font-size: 10px;
    color: var(--accent); word-break: break-all; gap: 8px;
    cursor: pointer; text-decoration: none;
  }
  .success-link:hover { background: rgba(0,229,195,0.1); }

  .error-box {
    background: rgba(255,60,60,0.08); border: 1px solid rgba(255,60,60,0.2);
    border-radius: 10px; padding: 12px 14px; margin-bottom: 16px;
    font-size: 12px; color: rgba(255,120,120,0.9); line-height: 1.5;
  }

  .hidden-input { display: none; }

  .counter-badge {
    background: var(--accent); color: #0a0a0f;
    font-size: 9px; font-weight: 700;
    font-family: 'JetBrains Mono', monospace;
    padding: 2px 6px; border-radius: 10px; margin-left: 6px;
  }

  .info-bar { display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; }

  .quality-selector { display: flex; gap: 6px; }

  .quality-btn {
    padding: 4px 10px; border-radius: 6px;
    border: 1.5px solid var(--border); background: transparent;
    font-family: 'JetBrains Mono', monospace; font-size: 9px;
    letter-spacing: 0.05em; color: var(--text-muted); cursor: pointer;
    transition: all 0.2s;
  }
  .quality-btn.active { border-color: var(--accent); color: var(--accent); background: rgba(0,229,195,0.06); }

  /* Loading spinner */
  @keyframes spin { to { transform: rotate(360deg); } }
  .spinner {
    width: 16px; height: 16px;
    border: 2px solid rgba(255,255,255,0.2);
    border-top-color: currentColor;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
    display: inline-block;
  }

  .gdrive-badge {
    display: inline-flex; align-items: center; gap: 6px;
    background: rgba(66,133,244,0.1); border: 1px solid rgba(66,133,244,0.25);
    border-radius: 20px; padding: 4px 10px 4px 6px;
    font-size: 11px; color: #7ab3ff;
    margin-bottom: 16px;
  }

  .gdrive-dot {
    width: 8px; height: 8px; border-radius: 50%;
    background: #4285F4;
  }
`;

const STEPS = [
  { id: "images", name: "載入圖片", icon: "🖼️" },
  { id: "pdf", name: "生成 PDF", icon: "📄" },
  { id: "auth", name: "驗證 Google", icon: "🔑" },
  { id: "upload", name: "上傳 Drive", icon: "☁️" },
];

// ── PDF generation (canvas-based, no library needed) ──────────
async function imagesToPdfBlob(pages, quality) {
  // We build a minimal PDF manually using canvas for image compression
  const qMap = { SD: 0.6, HD: 0.82, HQ: 0.95 };
  const q = qMap[quality] || 0.82;

  // Encode images to JPEG data URLs
  const jpegDataURLs = await Promise.all(
    pages.map(
      (p) =>
        new Promise((resolve) => {
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement("canvas");
            // A4-ish: cap at 2480x3508 (300dpi), scale down if larger
            const maxW = 2480, maxH = 3508;
            let w = img.width, h = img.height;
            if (w > maxW || h > maxH) {
              const ratio = Math.min(maxW / w, maxH / h);
              w = Math.round(w * ratio);
              h = Math.round(h * ratio);
            }
            canvas.width = w;
            canvas.height = h;
            canvas.getContext("2d").drawImage(img, 0, 0, w, h);
            resolve({ dataUrl: canvas.toDataURL("image/jpeg", q), w, h });
          };
          img.src = p.src;
        })
    )
  );

  // Build minimal PDF using jsPDF-like approach via dynamic import
  // We'll use a lightweight inline approach
  const pdfLines = [];
  const objOffsets = [];
  let objectCount = 0;

  const addObj = (content) => {
    objectCount++;
    objOffsets.push(pdfLines.join("").length);
    pdfLines.push(`${objectCount} 0 obj\n${content}\nendobj\n`);
    return objectCount;
  };

  // Encode base64 image for PDF
  const stripDataUrlPrefix = (dataUrl) => dataUrl.split(",")[1];

  // PDF uses points: 1pt = 1/72 inch; A4 = 595.28 x 841.89 pt
  const PW = 595.28, PH = 841.89;

  const imageObjs = [];
  const contentObjs = [];

  for (let i = 0; i < jpegDataURLs.length; i++) {
    const { dataUrl, w, h } = jpegDataURLs[i];
    const b64 = stripDataUrlPrefix(dataUrl);
    // Scale to fit page
    const scale = Math.min(PW / w, PH / h);
    const sw = w * scale, sh = h * scale;
    const ox = (PW - sw) / 2, oy = (PH - sh) / 2;

    const imgRef = `Im${i + 1}`;

    // Image object (JPEG stream)
    const binaryLen = atob(b64).length;
    objectCount++;
    objOffsets.push(pdfLines.join("").length);
    pdfLines.push(
      `${objectCount} 0 obj\n` +
        `<< /Type /XObject /Subtype /Image /Width ${w} /Height ${h} ` +
        `/ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode ` +
        `/Length ${binaryLen} >>\nstream\n`
    );
    // We'll note the obj number for reference
    const imgObjNum = objectCount;
    pdfLines.push(`__IMG_${i}__\nendstream\nendobj\n`);
    imageObjs.push({ imgObjNum, imgRef, ox, oy, sw, sh });
  }

  // Page content streams
  for (let i = 0; i < imageObjs.length; i++) {
    const { imgRef, ox, oy, sw, sh } = imageObjs[i];
    const content = `q ${sw.toFixed(2)} 0 0 ${sh.toFixed(2)} ${ox.toFixed(2)} ${oy.toFixed(2)} cm /${imgRef} Do Q`;
    objectCount++;
    objOffsets.push(pdfLines.join("").length);
    pdfLines.push(
      `${objectCount} 0 obj\n<< /Length ${content.length} >>\nstream\n${content}\nendstream\nendobj\n`
    );
    contentObjs.push(objectCount);
  }

  // Page objects
  const pageObjNums = [];
  for (let i = 0; i < imageObjs.length; i++) {
    const { imgObjNum, imgRef } = imageObjs[i];
    const resources = `<< /XObject << /${imgRef} ${imgObjNum} 0 R >> >>`;
    objectCount++;
    objOffsets.push(pdfLines.join("").length);
    pdfLines.push(
      `${objectCount} 0 obj\n` +
        `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PW} ${PH}] ` +
        `/Resources ${resources} /Contents ${contentObjs[i]} 0 R >>\n` +
        `endobj\n`
    );
    pageObjNums.push(objectCount);
  }

  // Pages dict (obj 2)
  // We need to insert obj 2 before everything but PDF header requires sequential numbering
  // Rebuild properly: catalog=1, pages=2, then rest
  // Simpler: use jsPDF loaded dynamically
  // Actually let's just use the simpler approach - load jsPDF from CDN
  throw new Error("USE_JSPDF"); // Signal to use dynamic loader
}

// Load jsPDF dynamically
async function loadJsPDF() {
  if (window.jspdf) return window.jspdf.jsPDF;
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
    script.onload = () => resolve(window.jspdf.jsPDF);
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

async function generatePdfBlob(pages, quality) {
  const qMap = { SD: 0.6, HD: 0.82, HQ: 0.95 };
  const q = qMap[quality] || 0.82;

  const JsPDF = await loadJsPDF();

  const pdf = new JsPDF({ orientation: "portrait", unit: "pt", format: "a4" });
  const PW = pdf.internal.pageSize.getWidth();
  const PH = pdf.internal.pageSize.getHeight();

  for (let i = 0; i < pages.length; i++) {
    if (i > 0) pdf.addPage();

    await new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const maxW = 2480, maxH = 3508;
        let w = img.width, h = img.height;
        if (w > maxW || h > maxH) {
          const ratio = Math.min(maxW / w, maxH / h);
          w = Math.round(w * ratio);
          h = Math.round(h * ratio);
        }
        canvas.width = w;
        canvas.height = h;
        canvas.getContext("2d").drawImage(img, 0, 0, w, h);

        const scale = Math.min(PW / w, PH / h);
        const sw = w * scale, sh = h * scale;
        const ox = (PW - sw) / 2, oy = (PH - sh) / 2;

        const dataUrl = canvas.toDataURL("image/jpeg", q);
        pdf.addImage(dataUrl, "JPEG", ox, oy, sw, sh);
        resolve();
      };
      img.src = pages[i].src;
    });
  }

  return pdf.output("blob");
}

// ── Google Drive upload ───────────────────────────────────────
async function uploadToGoogleDrive(blob, fileName, folderId, accessToken) {
  const metadata = {
    name: fileName.endsWith(".pdf") ? fileName : fileName + ".pdf",
    mimeType: "application/pdf",
    ...(folderId && folderId !== "root" ? { parents: [folderId] } : {}),
  };

  const form = new FormData();
  form.append("metadata", new Blob([JSON.stringify(metadata)], { type: "application/json" }));
  form.append("file", blob);

  const res = await fetch(
    "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink",
    {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}` },
      body: form,
    }
  );

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error?.message || "上傳失敗");
  }

  return res.json(); // { id, name, webViewLink }
}

// ── Google Identity Services loader ─────────────────────────
function useGoogleAuth() {
  const [tokenClient, setTokenClient] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const [gisReady, setGisReady] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Load GIS
    if (window.google?.accounts) {
      initTokenClient();
      return;
    }
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.onload = initTokenClient;
    script.onerror = () => setError("無法載入 Google 登入腳本");
    document.head.appendChild(script);
  }, []);

  function initTokenClient() {
    if (GOOGLE_CLIENT_ID === "YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com") {
      setGisReady(true);
      return; // demo mode
    }
    const tc = window.google.accounts.oauth2.initTokenClient({
      client_id: GOOGLE_CLIENT_ID,
      scope: SCOPES,
      callback: async (resp) => {
        if (resp.error) { setError(resp.error); return; }
        setAccessToken(resp.access_token);
        // Fetch user info
        try {
          const r = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
            headers: { Authorization: `Bearer ${resp.access_token}` },
          });
          setUserInfo(await r.json());
        } catch (_) {}
      },
    });
    setTokenClient(tc);
    setGisReady(true);
  }

  const signIn = () => {
    if (!tokenClient) return;
    tokenClient.requestAccessToken();
  };

  const signOut = () => {
    if (accessToken && window.google?.accounts?.oauth2) {
      window.google.accounts.oauth2.revoke(accessToken);
    }
    setAccessToken(null);
    setUserInfo(null);
  };

  return { accessToken, userInfo, gisReady, signIn, signOut, error };
}

// ═══════════════════════════════════════════════════════════════
export default function DocScannerApp() {
  const { accessToken, userInfo, gisReady, signIn, signOut, error: authError } = useGoogleAuth();
  const isDemoMode = GOOGLE_CLIENT_ID === "YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com";

  const [pages, setPages] = useState([]);
  const [selectedPage, setSelectedPage] = useState(null);
  const [fileName, setFileName] = useState("文件掃描_" + new Date().toLocaleDateString("zh-TW").replace(/\//g, ""));
  const [enhanceToggle, setEnhanceToggle] = useState(true);
  const [quality, setQuality] = useState("HD");
  const [showModal, setShowModal] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(-1);
  const [uploadDone, setUploadDone] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [uploadError, setUploadError] = useState(null);
  const fileInputRef = useRef();

  const isLoggedIn = !!accessToken || isDemoMode;

  const handleCapture = useCallback((e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setPages((prev) => {
          const next = [...prev, { id: Date.now() + Math.random(), src: ev.target.result }];
          setSelectedPage(next.length - 1);
          return next;
        });
      };
      reader.readAsDataURL(file);
    });
    e.target.value = "";
  }, []);

  const deletePage = useCallback((idx, e) => {
    e.stopPropagation();
    setPages((prev) => {
      const next = prev.filter((_, i) => i !== idx);
      setSelectedPage(next.length > 0 ? Math.min(idx, next.length - 1) : null);
      return next;
    });
  }, []);

  const handleUpload = useCallback(async () => {
    setShowModal(true);
    setProgress(0);
    setCurrentStep(0);
    setUploadDone(false);
    setUploadError(null);
    setUploadResult(null);

    try {
      // Step 0: images ready
      await new Promise((r) => setTimeout(r, 400));
      setProgress(20);
      setCurrentStep(1);

      // Step 1: generate PDF
      let pdfBlob;
      if (isDemoMode) {
        await new Promise((r) => setTimeout(r, 900));
        pdfBlob = new Blob(["demo pdf"], { type: "application/pdf" });
      } else {
        pdfBlob = await generatePdfBlob(pages, quality);
      }
      setProgress(50);
      setCurrentStep(2);

      // Step 2: verify auth (already done)
      await new Promise((r) => setTimeout(r, 300));
      setProgress(65);
      setCurrentStep(3);

      // Step 3: upload
      let result;
      if (isDemoMode) {
        await new Promise((r) => setTimeout(r, 1200));
        result = {
          id: "demo_file_id",
          name: (fileName.endsWith(".pdf") ? fileName : fileName + ".pdf"),
          webViewLink: `https://drive.google.com/file/d/demo_id/view`,
        };
      } else {
        result = await uploadToGoogleDrive(pdfBlob, fileName, "1q9Xc-JINBZnIBneoWm8ddcHqSlfh6aXs", accessToken);
      }

      setProgress(100);
      setUploadResult(result);
      setUploadDone(true);
    } catch (err) {
      setUploadError(err.message || "未知錯誤");
      setUploadDone(true);
    }
  }, [pages, quality, fileName, accessToken, isDemoMode]);

  // ── Auth screen ──
  if (!isLoggedIn) {
    return (
      <>
        <style>{styles}</style>
        <div className="app-wrap">
          <div className="bg-glow" />
          <div className="auth-screen">
            {isDemoMode && (
              <div className="setup-banner" style={{ marginBottom: 28, textAlign: "left", maxWidth: 320 }}>
                <strong>⚠️ 開發者設定提醒</strong>
                請在程式碼頂部將 <code>GOOGLE_CLIENT_ID</code> 替換為你的憑證。
                前往 Google Cloud Console → APIs &amp; Services → Credentials 建立 OAuth 2.0 用戶端 ID，
                並啟用 <code>Google Drive API</code>。
              </div>
            )}
            <div className="auth-logo">📷</div>
            <h1 className="auth-title">DocScan <span>Pro</span></h1>
            <p className="auth-desc">
              拍照掃描文件，自動生成高品質 PDF，<br />
              直接上傳至你的 Google Drive。
            </p>
            {authError && (
              <div className="error-box" style={{ marginBottom: 16, maxWidth: 300 }}>{authError}</div>
            )}
            <button
              className="btn-google"
              onClick={isDemoMode ? () => alert("請先設定 GOOGLE_CLIENT_ID") : signIn}
              disabled={!gisReady}
            >
              {!gisReady ? <span className="spinner" /> : <span className="google-icon">G</span>}
              {isDemoMode ? "以示範模式繼續（需設定 Client ID）" : "使用 Google 帳號登入"}
            </button>
            {isDemoMode && (
              <button
                className="btn-google"
                style={{ marginTop: 10, background: "var(--surface)", border: "1.5px solid var(--border)", color: "#e8e8f0", boxShadow: "none" }}
                onClick={() => window.location.reload()}
              >
                🎭 進入示範模式（跳過登入）
              </button>
            )}
            <p className="auth-note">
              僅申請 <strong>drive.file</strong> 權限，只能存取本 App 上傳的檔案，無法讀取你的其他 Drive 內容。
            </p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{styles}</style>
      <div className="app-wrap">
        <div className="bg-glow" />

        <div className="header">
          <div className="header-eyebrow">// DocScan Pro</div>
          <div className="header-top">
            <h1 className="header-title">掃描文件<br /><span>上傳 Drive</span></h1>
            <div className="user-badge" onClick={signOut} title="點擊登出">
              {userInfo?.picture
                ? <img className="user-avatar" src={userInfo.picture} alt="avatar" />
                : <div className="user-avatar-placeholder">{(userInfo?.name || "U")[0]}</div>
              }
              <span className="user-name">{userInfo?.name || (isDemoMode ? "示範模式" : "已登入")}</span>
              <span className="logout-dot" />
            </div>
          </div>
        </div>

        <div className="content">
          {isDemoMode && (
            <div className="setup-banner">
              <strong>示範模式</strong>
              上傳功能為模擬，請設定真實 <code>GOOGLE_CLIENT_ID</code> 以啟用真實上傳。
            </div>
          )}

          {/* Google Drive badge */}
          <div className="gdrive-badge">
            <span className="gdrive-dot" />
            已連接 Google Drive
            {userInfo?.email && <span style={{ opacity: 0.7 }}>・{userInfo.email}</span>}
          </div>

          {/* Main scan area */}
          <div
            className={`scan-area ${pages.length > 0 && selectedPage !== null ? "active" : ""}`}
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="scan-brackets">
              <div className="bracket bracket-tl" />
              <div className="bracket bracket-tr" />
              <div className="bracket bracket-bl" />
              <div className="bracket bracket-br" />
            </div>
            <div className="scan-line" />
            {pages.length > 0 && selectedPage !== null ? (
              <img className="camera-preview" src={pages[selectedPage].src} alt="page preview" />
            ) : (
              <div className="empty-state">
                <div className="empty-icon">📷</div>
                <div className="empty-title">點擊拍照或選取圖片</div>
                <div className="empty-sub">支援 JPG、PNG、HEIC<br />可一次選取多頁</div>
              </div>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            capture="environment"
            className="hidden-input"
            onChange={handleCapture}
          />

          {/* Pages strip */}
          {pages.length > 0 && (
            <>
              <div className="info-bar">
                <div className="section-label">
                  頁面 <span className="counter-badge">{pages.length}</span>
                </div>
                <div className="quality-selector">
                  {["SD", "HD", "HQ"].map((q) => (
                    <button key={q} className={`quality-btn ${quality === q ? "active" : ""}`} onClick={() => setQuality(q)}>
                      {q}
                    </button>
                  ))}
                </div>
              </div>
              <div className="pages-strip">
                {pages.map((p, i) => (
                  <div key={p.id} className={`page-thumb ${selectedPage === i ? "selected" : ""}`} onClick={() => setSelectedPage(i)}>
                    <img src={p.src} alt={`page ${i + 1}`} />
                    <div className="page-num">{i + 1}</div>
                    <div className="page-del" onClick={(e) => deletePage(i, e)}>✕</div>
                  </div>
                ))}
                <div className="add-page-btn" onClick={() => fileInputRef.current?.click()}>
                  <span>+</span>
                  <span className="add-page-label">新增</span>
                </div>
              </div>
            </>
          )}

          {/* File name */}
          <div className="section-label">檔案名稱</div>
          <input
            className="input-field"
            type="text"
            value={fileName}
            onChange={(e) => setFileName(e.target.value)}
            placeholder="輸入檔案名稱..."
          />

          {/* Upload target */}
          <div className="section-label">上傳目標</div>
          <div className="folder-row">
            <span className="folder-icon">📁</span>
            <div className="folder-info">
              <div className="folder-name">我的雲端硬碟（根目錄）</div>
              <div className="folder-path">drive.google.com / My Drive</div>
            </div>
            <span className="folder-chevron">›</span>
          </div>

          {/* Settings */}
          <div className="section-label">設定</div>
          <div className="settings-card">
            <div className="setting-row">
              <div className="setting-info">
                <div className="setting-name">影像優化</div>
                <div className="setting-desc">自動校正亮度與對比</div>
              </div>
              <div className={`toggle ${enhanceToggle ? "on" : ""}`} onClick={() => setEnhanceToggle(!enhanceToggle)}>
                <div className="toggle-knob" />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="btn-row">
            <button className="btn btn-secondary" disabled={pages.length === 0}
              onClick={() => { setPages([]); setSelectedPage(null); }}>
              🗑 清除
            </button>
            <button className="btn btn-primary" disabled={pages.length === 0} onClick={handleUpload}>
              ☁️ 生成並上傳
            </button>
          </div>
        </div>

        {/* Progress Modal */}
        {showModal && (
          <div className="modal-overlay" onClick={uploadDone ? () => setShowModal(false) : undefined}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              {!uploadDone ? (
                <>
                  <div className="modal-title">處理中...</div>
                  <div className="modal-sub">正在將 {pages.length} 頁文件上傳至 Google Drive</div>
                  <div className="progress-steps">
                    {STEPS.map((step, i) => {
                      const state = i < currentStep ? "done" : i === currentStep ? "active" : "waiting";
                      return (
                        <div className="step" key={step.id}>
                          <div className={`step-icon ${state}`}>{state === "done" ? "✓" : step.icon}</div>
                          <div className="step-info">
                            <div className="step-name">{step.name}</div>
                            <div className={`step-status ${state === "active" ? "active-text" : state === "done" ? "done-text" : ""}`}>
                              {state === "done" ? "完成" : state === "active" ? "進行中..." : "等待中"}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="progress-pct">{progress}%</div>
                  <div className="progress-bar-wrap">
                    <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
                  </div>
                </>
              ) : uploadError ? (
                <>
                  <div style={{ textAlign: "center", fontSize: 40, marginBottom: 16 }}>❌</div>
                  <div className="modal-title" style={{ textAlign: "center" }}>上傳失敗</div>
                  <div className="error-box">{uploadError}</div>
                  <div className="btn-row">
                    <button className="btn btn-secondary" onClick={() => setShowModal(false)}>關閉</button>
                    <button className="btn btn-primary" onClick={handleUpload}>重試</button>
                  </div>
                </>
              ) : (
                <>
                  <div className="success-icon">✅</div>
                  <div className="modal-title" style={{ textAlign: "center" }}>上傳成功！</div>
                  <div className="modal-sub" style={{ textAlign: "center", marginBottom: 20 }}>
                    {pages.length} 頁已儲存為 <strong>{uploadResult?.name}</strong>
                  </div>
                  {uploadResult?.webViewLink && (
                    <a className="success-link" href={uploadResult.webViewLink} target="_blank" rel="noreferrer">
                      <span style={{ flex: 1 }}>在 Google Drive 中開啟</span>
                      <span>↗</span>
                    </a>
                  )}
                  <div className="btn-row">
                    <button className="btn btn-secondary"
                      onClick={() => { setShowModal(false); setPages([]); setSelectedPage(null); }}>
                      繼續掃描
                    </button>
                    <button className="btn btn-primary" onClick={() => setShowModal(false)}>關閉</button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
