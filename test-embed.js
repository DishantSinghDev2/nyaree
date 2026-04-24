const url1 = "https://www.instagram.com/reel/DFZJ6XnSS_g/?igsh=cHNjMG5jZjVnOWU1";
const getInstaEmbedUrl = (url) => {
  try {
    const urlObj = new URL(url);
    urlObj.search = "";
    let pathname = urlObj.pathname;
    if (!pathname.endsWith('/')) pathname += '/';
    return `${urlObj.origin}${pathname}embed/`;
  } catch {
    return url;
  }
}
console.log("Insta: ", getInstaEmbedUrl(url1));

const url2 = "https://youtube.com/shorts/kP9I51_RtdE?si=xyz";
const getYoutubeEmbedUrl = (url) => {
  try {
    const urlObj = new URL(url);
    if (urlObj.pathname.includes('/shorts/')) {
      const id = urlObj.pathname.split('/shorts/')[1].split('/')[0];
      return `https://www.youtube.com/embed/${id}`;
    }
    return url;
  } catch {
    return url;
  }
}
console.log("Youtube: ", getYoutubeEmbedUrl(url2));
