function setCookiesFromString(cookieString) {
  const cookies = cookieString.split(";").map((c) => c.trim());

  cookies.forEach((cookie) => {
    const idx = cookie.indexOf("=");
    if (idx === -1) return;

    const name = cookie.substring(0, idx).trim();
    const value = cookie.substring(idx + 1).trim();

    document.cookie = `${name}=${value}; path=/; SameSite=Lax`;
  });
}

// Usage
const cookieString =
  "_fbp=fb.1.1769015692275.22736236079249630; session=c146dac1-f9d2-47b3-8706-1287c0420659; session.sig=29uKCVeliCJepGQO0i4d-IL6jj0; _ga=GA1.1.235310253.1758883343; _ga_Z3MXP7MPYD=GS2.1.s1770272181$o1$g0$t1770272181$j60$l0$h0; _ga_RBPW36QR49=GS2.1.s1768231587$o6$g0$t1768231587$j60$l0$h0";

setCookiesFromString(cookieString);
