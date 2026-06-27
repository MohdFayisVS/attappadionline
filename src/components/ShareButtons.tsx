import React from "react";

interface ShareButtonsProps {
  url?: string;
  title: string;
  summary?: string;
  layout?: "row" | "inline" | "bubble";
}

export default function ShareButtons({ url, title, summary = "", layout = "row" }: ShareButtonsProps) {
  // Generate robust share URLs suitable for mobile or desktop browser viewports
  const shareUrl = url || window.location.href;
  const rawText = `Attappadi Online: ${title} ${summary ? `- ${summary}` : ""}`;
  
  const fbShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
  const xShareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(rawText)}`;
  const waShareUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(rawText + "\n" + shareUrl)}`;

  const handleShareClick = (e: React.MouseEvent<HTMLAnchorElement>, platform: string) => {
    // Open in a small popup if on desktop, or default action on mobile
    if (window.innerWidth > 768) {
      e.preventDefault();
      window.open(
        (e.currentTarget as HTMLAnchorElement).href,
        `${platform}-share-dialog`,
        "width=626,height=436,scrollbars=yes,resizable=yes"
      );
    }
  };

  const isBubble = layout === "bubble";

  return (
    <div className={`flex items-center gap-1.5 ${isBubble ? "justify-end pt-1" : "py-2"}`} id="social-share-strip">
      <span className="text-[10px] font-black tracking-widest text-[#052962] uppercase mr-1 select-none">
        Share:
      </span>
      
      {/* 1. Facebook */}
      <a
        href={fbShareUrl}
        onClick={(e) => handleShareClick(e, "facebook")}
        target="_blank"
        rel="noopener noreferrer"
        className="p-1 px-2 text-[10px] sm:text-xs font-bold rounded bg-[#1877F2] text-white hover:bg-[#155fc2] transition flex items-center gap-1 shadow-2xs hover:translate-y-[-1px]"
        title="Share on Facebook"
      >
        <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
          <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c4.56-.93 8-4.96 8-9.75z"/>
        </svg>
        {!isBubble && <span className="hidden sm:inline">Facebook</span>}
      </a>

      {/* 2. Twitter / X */}
      <a
        href={xShareUrl}
        onClick={(e) => handleShareClick(e, "twitter")}
        target="_blank"
        rel="noopener noreferrer"
        className="p-1 px-2 text-[10px] sm:text-xs font-bold rounded bg-[#000000] text-white hover:bg-slate-800 border border-slate-700 transition flex items-center gap-1 shadow-2xs hover:translate-y-[-1px]"
        title="Share on Twitter"
      >
        <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
        {!isBubble && <span className="hidden sm:inline">X / Twitter</span>}
      </a>

      {/* 3. WhatsApp */}
      <a
        href={waShareUrl}
        onClick={(e) => handleShareClick(e, "whatsapp")}
        target="_blank"
        rel="noopener noreferrer"
        className="p-1 px-2 text-[10px] sm:text-xs font-bold rounded bg-[#25D366] text-white hover:bg-[#20ba5a] transition flex items-center gap-1 shadow-2xs hover:translate-y-[-1px]"
        title="Send via WhatsApp"
      >
        <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.457L0 24zm6.59-4.846c1.6.95 3.1 1.45 4.7 1.45 5.4 0 9.8-4.4 9.8-9.8s-4.4-9.8-9.8-9.8c-5.4 0-9.8 4.4-9.8 9.8 0 1.9.5 3.7 1.6 5.3L2.25 19.3l3.6-1.15-.3.2z M15.4 12.95c-.45-.22-2.65-1.3-3.05-1.45-.4-.15-.7-.22-.95.15-.25.37-.95 1.2-1.15 1.4-.2.22-.4.25-.85.03-.45-.22-1.9-.7-3.6-2.2-1.33-1.18-2.22-2.64-2.48-3.09-.26-.45-.03-.7.2-.92.2-.2.45-.5.67-.77.22-.26.3-.45.45-.75s.07-.56-.03-.8c-.1-.22-.95-2.28-1.3-3.12-.35-.83-.7-1.1-1.08-1.1H4c-.37 0-.95.15-1.45.7-.5.56-1.92 1.88-1.92 4.6 0 2.7 1.98 5.34 2.26 5.7.28.37 3.9 5.95 9.45 8.35 1.3.56 2.3.9 3.07 1.14 1.34.42 2.56.36 3.53.22 1.08-.15 2.65-.45 3.03-1.05.37-.6.37-1.12.26-1.23-.1-.13-.4-.28-.85-.5z"/>
        </svg>
        {!isBubble && <span className="hidden sm:inline">WhatsApp</span>}
      </a>
    </div>
  );
}
