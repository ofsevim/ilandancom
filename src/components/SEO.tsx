import React, { useEffect } from 'react';

interface SEOProps {
  title?: string;
  description?: string;
}

const siteTitle = 'ilandan.online';
const defaultDesc = "Türkiye'nin en modern ilan platformu. Emlak, vasıta, elektronik ve daha fazlası.";

const SEO: React.FC<SEOProps> = ({ title, description }) => {
  useEffect(() => {
    document.title = title ? `${title} — ${siteTitle}` : `${siteTitle} — Türkiye'nin İlan Platformu`;
    const descEl = document.querySelector('meta[name="description"]');
    if (descEl) descEl.setAttribute('content', description || defaultDesc);
  }, [title, description]);

  return null;
};

export default SEO;

