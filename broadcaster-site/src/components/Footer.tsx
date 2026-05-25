import { FaGithub, FaTwitch } from 'react-icons/fa';
import { SiBluesky } from 'react-icons/si';

const CURRENT_YEAR = new Date().getFullYear();

const SOCIAL_LINKS = [
  { href: 'https://github.com/Cfox7/hint-viewer', icon: FaGithub, label: 'GitHub' },
  { href: 'https://bsky.app/profile/hintviewer.com', icon: SiBluesky, label: 'Bluesky' },
  { href: 'https://www.twitch.tv/cfox', icon: FaTwitch, label: 'Twitch' },
] as const;

export function Footer() {
  return (
    <footer className="app-footer">
      <div className="app-footer-socials">
        {SOCIAL_LINKS.map(({ href, icon: Icon, label }) => (
          <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label}>
            <Icon />
          </a>
        ))}
      </div>
      <p className="app-footer-copyright">
        In-game imagery and system logos &copy; Nintendo, 1998-{CURRENT_YEAR}. HintViewer.com does not distribute copyrighted material.
      </p>
    </footer>
  );
}
