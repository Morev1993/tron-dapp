import type { TronLinkParams } from "@/models/tronLink";

export function getTronLink(): Promise<TronLinkParams | null>  {
  return new Promise((resolve, reject) => {
    if (window.tronLink) {
      handleTronLink();
    } else {
      window.addEventListener('tronLink#initialized', handleTronLink, {
        once: true,
      });

      setTimeout(handleTronLink, 3000);
    }

    function handleTronLink() {
      const { tronLink } = window;
      if (tronLink) {
        resolve(tronLink);
      } else {
        console.error('Please install TronLink-Extension!');
        reject(null);
      }
    }
  })
  
}