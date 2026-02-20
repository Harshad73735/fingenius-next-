// ThemeScript — runs inline in <head> BEFORE any paint.
// This ensures dark mode applies instantly with zero flash of unstyled content (FOUC).
export const ThemeScript = () => {
  const script = `
    (function() {
      try {
        var saved = localStorage.getItem('theme');
        if (saved === 'dark') {
          document.documentElement.classList.add('dark');
        } else if (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches) {
          // Respect the OS system preference if user has never set a preference
          document.documentElement.classList.add('dark');
          localStorage.setItem('theme', 'dark');
        }
      } catch (e) {}
    })();
  `;

  return (
    <script
      dangerouslySetInnerHTML={{ __html: script }}
      suppressHydrationWarning
    />
  );
};
