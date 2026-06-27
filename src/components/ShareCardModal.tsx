import { useState, useRef } from "react";
import { X, Calendar, MapPin, Download, Share2, Copy, Check, Languages } from "lucide-react";
import { NewsPost, EventItem, NoticeItem, LpgDelivery } from "../types";

interface ShareCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: NewsPost | EventItem | NoticeItem | LpgDelivery | null;
  lang: "en" | "ml";
}

export default function ShareCardModal({ isOpen, onClose, data, lang: defaultLang }: ShareCardModalProps) {
  if (!isOpen || !data) return null;

  // Determine if it is a NewsPost, an EventItem, a NoticeItem, or an LpgDelivery
  const isNews = "category" in data;
  const isNotice = "severity" in data;
  const isLpg = "agencyNameEn" in data;
  
  // State tracking for language preference toggle
  const [lang, setLang] = useState<"ml" | "en">(defaultLang || "ml");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [copied, setCopied] = useState(false);

  // Parse fields safely based on type
  const title = isNews 
    ? (lang === "en" ? (data as NewsPost).titleEn : (data as NewsPost).titleMl)
    : isNotice
      ? (lang === "en" ? (data as NoticeItem).titleEn : (data as NoticeItem).titleMl)
      : isLpg
        ? (lang === "en" ? (data as LpgDelivery).agencyNameEn : (data as LpgDelivery).agencyNameMl)
        : (lang === "en" ? (data as EventItem).titleEn : (data as EventItem).titleMl);

  const summary = isNews
    ? (lang === "en" ? (data as NewsPost).contentEn : (data as NewsPost).contentMl)
    : isNotice
      ? (lang === "en" ? (data as NoticeItem).contentEn : (data as NoticeItem).contentMl)
      : isLpg
        ? (lang === "en" 
            ? `📍 Areas Covered:\n${(data as LpgDelivery).areasEn}\n\n⚡ Status: ${(data as LpgDelivery).statusEn === "Delivering Today" ? "Delivering Today" : (data as LpgDelivery).statusEn}\n📞 Helpline No.: ${(data as LpgDelivery).contact}`
            : `📍 ഉൾപ്പെടുന്ന മേഖലകൾ:\n${(data as LpgDelivery).areasMl}\n\n⚡ Status: ${((data as LpgDelivery).statusMl === "ഇന്നത്തെ ഡെലിവറി" || (data as LpgDelivery).statusMl === "ഇന്ന് വിതരണമുണ്ട്") ? "ഇന്ന് വിതരണമുണ്ട്" : (data as LpgDelivery).statusMl}\n📞 ഹെൽപ്‌ലൈൻ: ${(data as LpgDelivery).contact}`)
        : (lang === "en" ? (data as EventItem).descriptionEn : (data as EventItem).descriptionMl);

  const image = isNews 
    ? (data as NewsPost).image 
    : isNotice
      ? ((data as NoticeItem).image || "")
      : isLpg
        ? ""
        : "https://images.unsplash.com/photo-1508962914676-134849a727f0?q=80&w=1000&auto=format&fit=crop";

  const dateStr = isNews
    ? new Date((data as NewsPost).publishedAt).toLocaleDateString(lang === "ml" ? "ml-IN" : "en-US")
    : isNotice
      ? new Date((data as NoticeItem).date).toLocaleDateString(lang === "ml" ? "ml-IN" : "en-US")
      : isLpg
        ? (data as LpgDelivery).date
        : new Date((data as EventItem).date).toLocaleDateString(lang === "ml" ? "ml-IN" : "en-US");

  const badgeText = isNews 
    ? (data as NewsPost).category.toUpperCase()
    : isNotice
      ? (data as NoticeItem).type.toUpperCase()
      : isLpg
        ? "LPG TODAY"
        : "EVENT";

  // Location representation
  const location = isNews
    ? ((data as NewsPost).regions && (data as NewsPost).regions[0] ? (data as NewsPost).regions[0] : "Attappadi")
    : isNotice
      ? "Attappadi"
      : isLpg
        ? "Attappadi Area"
        : (lang === "ml" ? (data as EventItem).locationMl : (data as EventItem).locationEn);

  // Dynamic absolute share link
  const cardShareUrl = typeof window !== "undefined"
    ? `${window.location.origin}/?activeSection=${isNews ? "news" : isNotice ? "notices" : isLpg ? "local-services" : "events"}&id=${data.id}`
    : `https://attappadionline.com/posts/${data.id}`;

  const shareText = isLpg
    ? `LPG Gas Delivery: ${title}`
    : `Attappadi Online News: ${title}`;

  // Direct Social Share links
  const socialShares = {
    whatsapp: `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText + "\n" + cardShareUrl)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(cardShareUrl)}`,
    twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(cardShareUrl)}&text=${encodeURIComponent(shareText)}`,
    telegram: `https://t.me/share/url?url=${encodeURIComponent(cardShareUrl)}&text=${encodeURIComponent(shareText)}`
  };

  const handleShareClick = (platform: "whatsapp" | "facebook" | "twitter" | "telegram") => {
    window.open(socialShares[platform], "_blank", "width=600,height=450,resizable=yes");
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(cardShareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // 100% ROBUST CANVAS-BASED GRAPHIC GENERATOR (No HTML parser crash risk!)
  const generateCanvasImageBlob = (): Promise<Blob | null> => {
    return new Promise(async (resolve) => {
      try {
        // Ensure Anek Malayalam and Playfair Display are loaded before painting canvas
        try {
          if (document.fonts) {
            await Promise.all([
              document.fonts.load("800 34px 'Anek Malayalam'"),
              document.fonts.load("800 34px 'Playfair Display'"),
              document.fonts.load("bold 18px 'Anek Malayalam'"),
              document.fonts.load("bold 16px 'Anek Malayalam'"),
              document.fonts.load("bold 18px system-ui"),
              document.fonts.load("bold 16px system-ui"),
              document.fonts.load("500 18px 'Anek Malayalam'"),
              document.fonts.load("500 18px system-ui")
            ]);
          }
        } catch (e) {
          console.warn("Font pre-loading failed/interrupted but continuing:", e);
        }

        // Pre-create a temporary context to measure text layout lines accurately
        const tempCanvas = document.createElement("canvas");
        const tempCtx = tempCanvas.getContext("2d");
        const getLinesCount = (textStr: string, fontString: string, maxW: number): number => {
          if (!tempCtx) return 1;
          tempCtx.font = fontString;
          const paragraphs = textStr.split("\n");
          let count = 0;
          for (let p = 0; p < paragraphs.length; p++) {
            const para = paragraphs[p];
            if (para.trim() === "" && p > 0 && p < paragraphs.length - 1) {
              count += 0.5;
              continue;
            }
            const words = para.split(" ");
            let currentLine = "";
            for (let i = 0; i < words.length; i++) {
              const testLine = currentLine ? currentLine + " " + words[i] : words[i];
              const metrics = tempCtx.measureText(testLine);
              if (metrics.width > maxW) {
                count++;
                currentLine = words[i];
              } else {
                currentLine = testLine;
              }
            }
            if (currentLine) {
              count++;
            }
          }
          return count;
        };

        let calculatedHeight = 1000;
        if (isNotice || isLpg) {
          let noticeY = 140; // Starts below header
          noticeY += 45; // Date banner height

          const titleFont = lang === "ml"
            ? "800 32px 'Anek Malayalam', sans-serif"
            : "900 29px system-ui, -apple-system, sans-serif";
          const titleLines = getLinesCount(title || "", titleFont, 800 - 108); // paddingX is 54 (x2 = 108)
          noticeY += titleLines * 42 + 15;

          const contentFont = lang === "ml"
            ? "500 22px 'Anek Malayalam', sans-serif"
            : "500 20px system-ui, -apple-system, sans-serif";
          const contentLines = getLinesCount(summary || "", contentFont, 800 - 108);
          noticeY += Math.min(contentLines, 10) * 32 + 25;

          if (!isLpg && (data as NoticeItem).image) {
            noticeY += 235; // 220 container height + 15 spacing
          }

          calculatedHeight = Math.max(540, noticeY + 140);
        } else {
          // News card height computation
          let newsY = 600; // Starts below image at 560
          newsY += 45; // Date banner

          const titleFont = lang === "ml"
            ? "800 32px 'Anek Malayalam', sans-serif"
            : "800 34px 'Playfair Display', Georgia, serif";
          const titleLineHeight = lang === "ml" ? 44 : 46;
          const titleLines = getLinesCount(title || "", titleFont, 800 - 96); // paddingX is 48 (x2 = 96)
          newsY += Math.min(titleLines, 3) * titleLineHeight + 25;

          calculatedHeight = Math.max(820, newsY + 140);
        }

        const canvas = document.createElement("canvas");
        // Maintain a beautiful, crisp vertical ratio ideal for messaging & status sharing matching the card ratio
        canvas.width = 800;
        canvas.height = calculatedHeight;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(null);
          return;
        }

        const wrapTextOnCanvas = (textStr: string, startX: number, startY: number, lineH: number, maxW: number, limitLines: number): number => {
          const paragraphs = textStr.split("\n");
          let lines: string[] = [];
          
          for (let p = 0; p < paragraphs.length; p++) {
            const para = paragraphs[p];
            if (para.trim() === "" && p > 0 && p < paragraphs.length - 1) {
              lines.push(""); // Preserve empty paragraph spacing
              continue;
            }
            const words = para.split(" ");
            let currentLine = "";
            for (let i = 0; i < words.length; i++) {
              const testLine = currentLine ? currentLine + " " + words[i] : words[i];
              const metrics = ctx.measureText(testLine);
              if (metrics.width > maxW) {
                if (currentLine) lines.push(currentLine);
                currentLine = words[i];
              } else {
                currentLine = testLine;
              }
            }
            if (currentLine) {
              lines.push(currentLine);
            }
          }

          const drawLimit = Math.min(lines.length, limitLines);
          let targetY = startY;
          for (let i = 0; i < drawLimit; i++) {
            let textToDraw = lines[i];
            if (i === limitLines - 1 && lines.length > limitLines) {
              textToDraw = textToDraw.substring(0, textToDraw.length - 3) + "...";
            }
            if (textToDraw === "") {
              targetY += lineH / 2;
            } else {
              ctx.fillText(textToDraw, startX, targetY);
              targetY += lineH;
            }
          }
          return targetY;
        };

        if (isNotice || isLpg) {
          const isLpgItem = isLpg;
          let bgColor = "#f8fafc"; // bg-slate-50
          let headerColor = "#052962";
          let borderCol = "#cbd5e1"; // default slate-300/slate-200
          let badgeLabel = "";
          let alertIcon = "";

          if (isLpgItem) {
            bgColor = "#fffbeb"; // bg-amber-50 / LPG warm color
            headerColor = "#b45309"; // amber-700
            borderCol = "#fde68a"; // amber-200
            badgeLabel = lang === "ml" ? "എൽ.പി.ജി ഗ്യാസ് വിതരണം" : "LPG TODAY DELIVERY";
            alertIcon = "🚚";
          } else {
            const noticeItem = data as NoticeItem;
            const isHigh = noticeItem.severity === "high";
            const isCaution = noticeItem.type === "caution";
            badgeLabel = lang === "ml" ? "ഔദ്യോഗിക അറിയിപ്പ്" : "OFFICIAL NOTICE";
            alertIcon = "📢";

            if (isHigh) {
              bgColor = "#fff1f2"; // bg-rose-50
              headerColor = "#be123c"; // rose-700
              borderCol = "#fecdd3"; // rose-200
              badgeLabel = lang === "ml" ? "അടിയന്തര ജാഗ്രത" : "CRITICAL ALERT";
              alertIcon = "⚠️";
            } else if (isCaution) {
              bgColor = "#fffbeb"; // bg-amber-50
              headerColor = "#d97706"; // amber-650 / amber-600
              borderCol = "#fde68a"; // amber-200
              badgeLabel = lang === "ml" ? "ജാഗ്രതാ നിർദ്ദേശം" : "CAUTION ALERT";
              alertIcon = "⚠️";
            }
          }

          // 1. Fill beautiful notification background
          ctx.fillStyle = bgColor;
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          // 1.5 Draw a thick top colored border representing the top stripe
          ctx.fillStyle = headerColor;
          ctx.fillRect(0, 0, canvas.width, 24);

          // 1.6 Draw remaining sides thin border
          ctx.strokeStyle = borderCol;
          ctx.lineWidth = 3;
          ctx.strokeRect(1.5, 1.5, canvas.width - 3, canvas.height - 3);

          // 1.7 Draw Official Alert Badge as full width capsule of the content area
          const paddingX = 54;
          ctx.fillStyle = headerColor;
          const badgeX = paddingX;
          const badgeW = canvas.width - (paddingX * 2); // 692 px
          const badgeH = 50;
          const badgeY = 56;
          ctx.beginPath();
          ctx.roundRect ? ctx.roundRect(badgeX, badgeY, badgeW, badgeH, 12) : ctx.rect(badgeX, badgeY, badgeW, badgeH);
          ctx.fill();

          ctx.fillStyle = "#ffffff";
          ctx.font = lang === "ml" 
            ? "bold 24px 'Anek Malayalam', sans-serif" 
            : "bold 22px system-ui, -apple-system, sans-serif";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(`${alertIcon}  ${badgeLabel}`, canvas.width / 2, badgeY + badgeH / 2);

          // Reset text alignment for subsequent content
          ctx.textAlign = "left";
          ctx.textBaseline = "top";

          let currentY = 140;

          // 2. Date info
          ctx.fillStyle = "#64748b"; // Slate-500
          ctx.font = lang === "ml"
            ? "bold 22px 'Anek Malayalam', sans-serif"
            : "bold 20px system-ui, -apple-system, sans-serif";
          ctx.fillText(`📅  ${dateStr}`, paddingX, currentY);
          currentY += 45;

          // 3. Title (Notice title or Gas Agency title)
          ctx.fillStyle = "#0f172a"; // Slate-900
          ctx.font = lang === "ml"
            ? "800 32px 'Anek Malayalam', sans-serif"
            : "900 29px system-ui, -apple-system, sans-serif";
          
          const maxTextWidth = canvas.width - (paddingX * 2);
          currentY = wrapTextOnCanvas(title, paddingX, currentY, 42, maxTextWidth, 2);
          currentY += 15;

          // 4. Content (Description of Notice or Gas route summary)
          ctx.fillStyle = "#334155"; // Slate-700
          ctx.font = lang === "ml"
            ? "500 22px 'Anek Malayalam', sans-serif"
            : "500 20px system-ui, -apple-system, sans-serif";
          
          currentY = wrapTextOnCanvas(summary, paddingX, currentY, 32, maxTextWidth, 10);
          currentY += 25;

          // 5. Draw Image Attachment inside card-like box if exists
          if (!isLpgItem) {
            const noticeItem = data as NoticeItem;
            if (noticeItem.image) {
              await new Promise<void>((imgResolve) => {
                const img = new Image();
                img.crossOrigin = "anonymous";
                img.src = noticeItem.image || "";
                img.onload = () => {
                  const maxImgH = 220;
                  const imgW = canvas.width - (paddingX * 2);
                  
                  // Draw a beautiful container box with standard rounded corners and thin border
                  ctx.fillStyle = "#ffffff";
                  ctx.strokeStyle = "#cbd5e1";
                  ctx.lineWidth = 1.5;
                  ctx.beginPath();
                  ctx.roundRect ? ctx.roundRect(paddingX, currentY, imgW, maxImgH, 12) : ctx.rect(paddingX, currentY, imgW, maxImgH);
                  ctx.fill();
                  ctx.stroke();

                  ctx.save();
                  ctx.beginPath();
                  ctx.roundRect ? ctx.roundRect(paddingX + 2, currentY + 2, imgW - 4, maxImgH - 4, 10) : ctx.rect(paddingX + 2, currentY + 2, imgW - 4, maxImgH - 4);
                  ctx.clip();

                  const imgRatio = img.width / img.height;
                  const targetRatio = (imgW - 4) / (maxImgH - 4);
                  let drawW = imgW - 4;
                  let drawH = maxImgH - 4;
                  let offsetX = paddingX + 2;
                  let offsetY = currentY + 2;

                  if (imgRatio > targetRatio) {
                    drawH = (imgW - 4) / imgRatio;
                    offsetY += (maxImgH - 4 - drawH) / 2;
                  } else {
                    drawW = (maxImgH - 4) * imgRatio;
                    offsetX += (imgW - 4 - drawW) / 2;
                  }

                  ctx.drawImage(img, offsetX, offsetY, drawW, drawH);
                  ctx.restore();
                  imgResolve();
                };
                img.onerror = () => {
                  imgResolve();
                };
                setTimeout(imgResolve, 2500);
              });
            }
          }

          // 6. Horizontal rule above footer
          const footerBorderY = canvas.height - 110;
          ctx.strokeStyle = `${headerColor}30`;
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(paddingX, footerBorderY);
          ctx.lineTo(canvas.width - paddingX, footerBorderY);
          ctx.stroke();

          // 7. Footer elements
          const footerTextY = canvas.height - 70;
          ctx.fillStyle = "#94a3b8"; // Slate-400
          ctx.font = "bold 18px 'JetBrains Mono', monospace, sans-serif";
          ctx.fillText(isLpgItem ? "LPG GAS DISTRIBUTION" : "NOTICE/ALERTS", paddingX, footerTextY);

          // Draw Branding Wordmark on Right
          ctx.textAlign = "right";
          ctx.textBaseline = "middle";
          ctx.font = "italic 800 32px 'Playfair Display', Georgia, serif";

          const textPartOnline = "online";
          const textPartAttapadi = "attappadi";
          const onlineWidth = ctx.measureText(textPartOnline).width;

          ctx.fillStyle = "#005689"; // online in blue
          ctx.fillText(textPartOnline, canvas.width - paddingX, footerTextY + 9);

          ctx.fillStyle = "#052962"; // attappadi in navy
          ctx.fillText(textPartAttapadi, canvas.width - paddingX - onlineWidth - 3, footerTextY + 9);

          // Reset baseline
          ctx.textAlign = "left";
          ctx.textBaseline = "top";

          // Export as Blob
          canvas.toBlob((blob) => {
            resolve(blob);
          }, "image/png");

          return;
        }

        // 1. Draw solid pristine background
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // 2. Load and draw Image
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.src = image;

        await new Promise<void>((imgResolve) => {
          img.onload = () => {
            // Object-cover crop logic
            const targetWidth = canvas.width;
            const targetHeight = 560;
            const imgRatio = img.width / img.height;
            const targetRatio = targetWidth / targetHeight;

            let srcX = 0, srcY = 0, srcWidth = img.width, srcHeight = img.height;
            if (imgRatio > targetRatio) {
              srcWidth = img.height * targetRatio;
              srcX = (img.width - srcWidth) / 2;
            } else {
              srcHeight = img.width / targetRatio;
              srcY = (img.height - srcHeight) / 2;
            }

            ctx.drawImage(img, srcX, srcY, srcWidth, srcHeight, 0, 0, targetWidth, targetHeight);
            imgResolve();
          };
          img.onerror = () => {
            const gradient = ctx.createLinearGradient(0, 0, canvas.width, 560);
            gradient.addColorStop(0, "#052962");
            gradient.addColorStop(1, "#005689");
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, canvas.width, 560);

            // Large abstract news brand monogram in center
            ctx.fillStyle = "rgba(255, 255, 255, 0.12)";
            ctx.font = "italic bold 140px 'Playfair Display', Georgia, serif";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText("attappadi", canvas.width / 2, 280);
            imgResolve();
          };
          setTimeout(imgResolve, 3000);
        });

        // 3. Draw Category stamp (Y: 40)
        ctx.fillStyle = badgeText === "BREAKING" ? "#c70000" : "#052962";
        const badgeX = 40;
        const badgeY = 40;
        const badgeW = 150;
        const badgeH = 42;
        const br = 4;
        
        ctx.beginPath();
        ctx.roundRect ? ctx.roundRect(badgeX, badgeY, badgeW, badgeH, br) : ctx.rect(badgeX, badgeY, badgeW, badgeH);
        ctx.fill();

        ctx.fillStyle = "#ffffff";
        ctx.font = lang === "ml" 
          ? "bold 15px 'Anek Malayalam', sans-serif" 
          : "bold 15px system-ui, -apple-system, sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(badgeText, badgeX + badgeW / 2, badgeY + badgeH / 2);

        // Reset text alignment for content
        ctx.textAlign = "left";
        ctx.textBaseline = "top";

        // 4. Content section
        const paddingX = 48;
        let currentY = 600;

        // 5. Calendar Icon & Date
        ctx.fillStyle = "#94a3b8"; // Slate color
        ctx.font = lang === "ml"
          ? "bold 18px 'Anek Malayalam', sans-serif"
          : "bold 18px system-ui, -apple-system, sans-serif";
        ctx.fillText(`📅  ${dateStr}`, paddingX, currentY);
        currentY += 45;

        // 6. Draw Headline Title with elegant 'Playfair Display' / Serif font styling
        ctx.fillStyle = "#052962";
        ctx.font = lang === "ml"
          ? "800 32px 'Anek Malayalam', sans-serif"
          : "800 34px 'Playfair Display', Georgia, serif";
        const titleLineHeight = lang === "ml" ? 44 : 46;
        const maxTextWidth = canvas.width - (paddingX * 2);

        currentY = wrapTextOnCanvas(title, paddingX, currentY, titleLineHeight, maxTextWidth, 3);

        // 8. Footer Horizontal rule divider
        const footerBorderY = canvas.height - 110;
        ctx.strokeStyle = "#f1f5f9";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(paddingX, footerBorderY);
        ctx.lineTo(canvas.width - paddingX, footerBorderY);
        ctx.stroke();

        // 9. Footer Components: Small Location Badge on left, and Elegant Brand typography wordmark on right
        const footerElementsY = footerBorderY + 30;

        ctx.font = lang === "ml"
          ? "bold 16px 'Anek Malayalam', sans-serif"
          : "bold 16px system-ui, -apple-system, sans-serif";
        const displayLocText = `📍 ${location.toUpperCase()}`;
        const locWidth = ctx.measureText(displayLocText).width + 24;
        const locHeight = 38;

        ctx.fillStyle = "rgba(0, 86, 137, 0.08)";
        ctx.beginPath();
        ctx.roundRect 
          ? ctx.roundRect(paddingX, footerElementsY, locWidth, locHeight, 6) 
          : ctx.rect(paddingX, footerElementsY, locWidth, locHeight);
        ctx.fill();

        ctx.fillStyle = "#005689";
        ctx.fillText(displayLocText, paddingX + 12, footerElementsY + 10);

        ctx.textAlign = "right";
        ctx.textBaseline = "middle";
        ctx.font = "italic bold 30px 'Playfair Display', Georgia, serif";

        const textPartOnline = "online";
        const textPartAttapadi = "attappadi";
        const onlineWidth = ctx.measureText(textPartOnline).width;

        ctx.fillStyle = "#005689";
        ctx.fillText(textPartOnline, canvas.width - paddingX, footerElementsY + 19);

        ctx.fillStyle = "#052962";
        ctx.fillText(textPartAttapadi, canvas.width - paddingX - onlineWidth - 3, footerElementsY + 19);

        ctx.textAlign = "left";
        ctx.textBaseline = "top";

        // Export as Blob
        canvas.toBlob((blob) => {
          resolve(blob);
        }, "image/png");
      } catch (e) {
        console.error("Canvas drawing failed", e);
        resolve(null);
      }
    });
  };

  const handleDownloadCard = async () => {
    setIsGenerating(true);
    setIsSuccess(false);

    const blob = await generateCanvasImageBlob();
    if (blob) {
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      const cleanTitle = title.substring(0, 20).replace(/[^a-zA-Z0-9\s]/g, "");
      link.download = `attappadionline_card_${cleanTitle || "news"}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      setIsSuccess(true);
      setTimeout(() => setIsSuccess(false), 3500);
    } else {
      alert("Failed to render card as image.");
    }
    setIsGenerating(false);
  };

  // Share functionality utilizing Web Share API (file sharing or url fallback)
  const handleShareCard = async () => {
    setIsSharing(true);

    const blob = await generateCanvasImageBlob();
    if (blob && navigator.canShare && navigator.share) {
      try {
        const cleanTitle = title.substring(0, 20).replace(/[^a-zA-Z0-9\s]/g, "");
        const file = new File([blob], `attappadionline_card_${cleanTitle || "news"}.png`, { type: "image/png" });
        
        await navigator.share({
          files: [file],
          title: "Attappadi Online News",
          text: title
        });
      } catch (err) {
        console.log("File sharing failed, falling back to url sharing:", err);
        try {
          await navigator.share({
            title: "Attappadi Online News",
            text: title,
            url: cardShareUrl
          });
        } catch (e) {
          console.log("Text sharing dismissed");
        }
      }
    } else if (navigator.share) {
      try {
        await navigator.share({
          title: "Attappadi Online News",
          text: title,
          url: cardShareUrl
        });
      } catch (e) {
        console.log("Native sharing fallback dismissed");
      }
    } else {
      // Fallback: Copy link and let user know
      handleCopyLink();
      alert("Web Share API is not supported on this browser. The post link has been successfully copied to your clipboard so you can paste & share it!");
    }
    setIsSharing(false);
  };

  return (
    <div id="share-card-modal-container" className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[120] flex items-center justify-center p-4 overflow-y-auto">
      
      {/* Container Modals Grid */}
      <div className="bg-slate-900 border border-slate-800 text-white rounded-2xl max-w-4xl w-full flex flex-col md:flex-row overflow-hidden shadow-2xl my-auto max-h-[92vh] md:max-h-none overflow-y-auto md:overflow-visible">
        
        {/* Left Aspect: Display identical looking card previews */}
        <div className="flex-1 p-6 md:p-8 flex flex-col items-center justify-center bg-slate-950 border-b md:border-b-0 md:border-r border-slate-800 relative min-h-[420px] md:min-h-[520px]">
          <span className="absolute top-4 left-4 text-[10px] text-slate-500 font-extrabold uppercase tracking-widest select-none">
            Card Output Preview
          </span>

          {/* Interactive display box replicating EXACT look of News Post of site or Notice */}
          {isNotice || isLpg ? (
            (() => {
              const isLpgItem = isLpg;
              let bgColorClass = "bg-slate-50 border-slate-200";
              let borderTopClass = "border-t-[#052962]";
              let headerBgClass = "bg-[#052962]";
              let badgeLabel = "";
              let alertIcon = "";

              if (isLpgItem) {
                bgColorClass = "bg-amber-50/75 border-amber-200";
                borderTopClass = "border-t-amber-700";
                headerBgClass = "bg-amber-700";
                badgeLabel = lang === "ml" ? "എൽ.പി.ജി ഗ്യാസ് വിതരണം" : "LPG TODAY DELIVERY";
                alertIcon = "🚚";
              } else {
                const noticeItem = data as NoticeItem;
                const isHigh = noticeItem.severity === "high";
                const isCaution = noticeItem.type === "caution";
                badgeLabel = lang === "ml" ? "ഔദ്യോഗിക അറിയിപ്പ്" : "OFFICIAL NOTICE";
                alertIcon = "📢";

                if (isHigh) {
                  bgColorClass = "bg-rose-50 border-rose-200";
                  borderTopClass = "border-t-rose-600";
                  headerBgClass = "bg-rose-700";
                  badgeLabel = lang === "ml" ? "അടിയന്തര ജാഗ്രത" : "CRITICAL ALERT";
                  alertIcon = "⚠️";
                } else if (isCaution) {
                  bgColorClass = "bg-amber-50 border-amber-200";
                  borderTopClass = "border-t-amber-500";
                  headerBgClass = "bg-amber-600";
                  badgeLabel = lang === "ml" ? "ജാഗ്രതാ നിർദ്ദേശം" : "CAUTION ALERT";
                  alertIcon = "⚠️";
                }
              }

              return (
                <div className={`w-full max-w-[360px] md:w-[360px] shadow-2xl rounded-lg overflow-hidden ${bgColorClass} text-slate-900 border border-t-[10px] ${borderTopClass} flex flex-col justify-between p-4 space-y-4`}>
                  <div className="space-y-3 font-anek-malayalam">
                    {/* Official Banner Tag */}
                    <div className={`px-2.5 py-1.5 rounded-md ${headerBgClass} text-white text-[11px] font-extrabold text-center tracking-wider select-none`}>
                      {alertIcon} {badgeLabel}
                    </div>

                    {/* Date label */}
                    <div className="flex items-center text-[11px] text-gray-505 font-bold select-none font-mono">
                      <Calendar className="w-3.5 h-3.5 mr-1 text-slate-400" />
                      <span>{dateStr}</span>
                    </div>

                    {/* Notice/LPG Agency Title */}
                    <h4 className="font-extrabold text-slate-900 leading-snug text-sm">
                      {title}
                    </h4>

                    {/* Notice/LPG Content Description */}
                    <p className="text-[11px] text-slate-600 leading-relaxed font-semibold whitespace-pre-wrap select-text max-h-40 overflow-y-auto pr-1">
                      {summary}
                    </p>

                    {/* Attachment Image Preview inside Card if exists */}
                    {!isLpgItem && image && (
                      <div className="w-full rounded-lg overflow-hidden border border-slate-200/60 bg-white max-h-36 flex items-center justify-center">
                        <img 
                          src={image} 
                          alt="Attachment" 
                          className="max-h-36 object-contain w-full"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    )}
                  </div>

                  {/* Ribbon Brand Foot */}
                  <div className="pt-3 border-t border-slate-200/40 flex justify-between items-center">
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wide font-mono">
                      {isLpgItem ? "LPG GAS DISTRIBUTION" : "NOTICE/ALERTS"}
                    </span>
                    <span className="font-serif-guardian font-extrabold italic text-sm text-[#052962] tracking-tight">
                      attappadi<span className="text-[#005689]">online</span>
                    </span>
                  </div>
                </div>
              );
            })()
          ) : (
            <div className="w-full max-w-[360px] md:w-[360px] shadow-2xl rounded-lg overflow-hidden bg-white text-slate-900 border border-slate-200 flex flex-col justify-between">
              
              {/* HTML Core replicating News Design */}
              <div>
                {/* Photo Header */}
                <div className="relative aspect-video overflow-hidden bg-slate-100">
                  <img 
                    src={image} 
                    alt={title} 
                    className="object-cover w-full h-full select-none"
                    referrerPolicy="no-referrer"
                  />
                  
                  {/* Category Stamp */}
                  <span className={`absolute top-2.5 left-2.5 text-[10px] uppercase font-extrabold tracking-widest px-2.5 py-1 rounded-sm text-white shadow-sm ${badgeText === "BREAKING" ? "bg-red-700" : "bg-[#052962]"}`}>
                    {isNews ? (data as NewsPost).category : "EVENT"}
                  </span>
                </div>

                {/* Body Content */}
                <div className="p-4 space-y-3">
                  
                  {/* Meta with views removed */}
                  <div className="flex items-center text-[11px] text-gray-400 font-bold select-none">
                    <Calendar className="w-3.5 h-3.5 mr-1 text-slate-400" />
                    <span>{dateStr}</span>
                  </div>

                  {/* Headline using the header font */}
                  <h4 className="font-serif-guardian font-extrabold text-[#052962] leading-snug text-base line-clamp-3">
                    {title}
                  </h4>

                </div>
              </div>

              {/* Card Footer tags without view counts & read more links, but WITH title brand label */}
              <div className="p-4 pt-0 border-t border-gray-100 flex justify-between items-center bg-white">
                
                {/* Location item */}
                <span className="flex items-center gap-0.5 text-[10px] text-[#005689] font-bold bg-sky-50 px-2 py-1 rounded border border-sky-100 capitalize">
                  <MapPin className="w-3 h-3 text-[#005689]" />
                  {location}
                </span>

                {/* BRAND LABEL: same serif-guardian font of header title */}
                <span className="font-serif-guardian font-extrabold italic text-sm text-[#052962] tracking-tight">
                  attappadi<span className="text-[#005689]">online</span>
                </span>

              </div>

            </div>
          )}
        </div>

        {/* Right Aspect: Controls */}
        <div className="w-full md:w-[350px] p-6 md:p-8 flex flex-col justify-between bg-slate-900">
          
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-[#ffe500] font-black text-xs tracking-widest uppercase flex items-center gap-1.5">
                  📁 DOWNLOAD & SHARE
                </h3>
                <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
                  Grab or Share high quality local graphic cards instantly
                </p>
              </div>
              <button 
                onClick={onClose}
                className="p-1.5 rounded-md hover:bg-slate-800 text-slate-400 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Language Switch Toggle control */}
            <div className="space-y-2">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                <Languages className="w-3.5 h-3.5" /> Toggle Card Language
              </span>
              <div className="grid grid-cols-2 bg-slate-950 p-1 rounded-lg border border-slate-800">
                <button
                  type="button"
                  onClick={() => setLang("ml")}
                  className={`py-1.5 text-xs font-bold rounded-md transition ${lang === "ml" ? "bg-[#ffe500] text-slate-950" : "text-slate-400 hover:text-white"}`}
                >
                  മലയാളം
                </button>
                <button
                  type="button"
                  onClick={() => setLang("en")}
                  className={`py-1.5 text-xs font-bold rounded-md transition ${lang === "en" ? "bg-[#ffe500] text-slate-950" : "text-slate-400 hover:text-white"}`}
                >
                  English
                </button>
              </div>
            </div>

            {/* Direct Platform Quick Shares */}
            <div className="space-y-2">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                ⚡ Send Directly to Social Platform
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleShareClick("whatsapp")}
                  className="py-2 px-3 bg-[#25D366] hover:bg-[#20ba5a] text-white rounded text-xs font-bold flex items-center justify-center gap-1.5 transition"
                >
                  <span>WhatsApp</span>
                </button>
                <button
                  onClick={() => handleShareClick("facebook")}
                  className="py-2 px-3 bg-[#1877F2] hover:bg-[#155fc2] text-white rounded text-xs font-bold flex items-center justify-center gap-1.5 transition"
                >
                  <span>Facebook</span>
                </button>
                <button
                  onClick={() => handleShareClick("twitter")}
                  className="py-2 px-3 bg-[#000000] border border-slate-700 hover:bg-slate-800 text-white rounded text-xs font-bold flex items-center justify-center gap-1.5 transition"
                >
                  <span>X / Twitter</span>
                </button>
                <button
                  onClick={() => handleShareClick("telegram")}
                  className="py-2 px-3 bg-[#0088cc] hover:bg-[#0077b5] text-white rounded text-xs font-bold flex items-center justify-center gap-1.5 transition"
                >
                  <span>Telegram</span>
                </button>
              </div>
            </div>

            {/* Clipboard Copy link */}
            <div className="pt-2">
              <button
                onClick={handleCopyLink}
                className="w-full py-2 bg-slate-950 hover:bg-slate-900 border border-slate-800 rounded text-xs text-slate-300 font-bold flex items-center justify-center gap-2 transition"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span className="text-emerald-400">Copied to Clipboard!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copy Web Share Link</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-800 space-y-3 mt-4 md:mt-0">
            {isSuccess && (
              <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-2 rounded text-xs font-bold flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Card saved successfully to device download storage!</span>
              </div>
            )}

            {/* Core Action Buttons */}
            <div className="flex flex-col gap-2">
              {/* Share directly using browser dialogs */}
              <button
                onClick={handleShareCard}
                disabled={isSharing}
                className="w-full py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs uppercase tracking-widest rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Share2 className="w-4 h-4" />
                <span>{isSharing ? "Sharing Dialog Active..." : "Share From Site"}</span>
              </button>

              {/* Download image file */}
              <button
                onClick={handleDownloadCard}
                disabled={isGenerating}
                className="w-full py-2.5 bg-[#ffe500] hover:bg-[#e6ce00] text-slate-950 font-extrabold text-xs uppercase tracking-widest rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-md"
              >
                {isGenerating ? (
                  <>
                    <span className="animate-spin text-slate-950 text-xs">⏳</span>
                    <span>Saving Card...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 text-slate-950" />
                    <span>Download Card</span>
                  </>
                )}
              </button>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
