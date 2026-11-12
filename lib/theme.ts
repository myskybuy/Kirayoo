// Shared by the root layout (server) and ThemeToggle (client).
export const THEME_KEY = 'kirayo-theme';

/** Runs in <head> before first paint (no flash): saved choice, else the OS setting. */
export const THEME_BOOT = `(function(){try{var t=localStorage.getItem('${THEME_KEY}');if(t!=='light'&&t!=='dark')t=matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';document.documentElement.dataset.theme=t;}catch(e){document.documentElement.dataset.theme='light';}})();`;
