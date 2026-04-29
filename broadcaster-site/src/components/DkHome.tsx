import { Link } from 'react-router-dom';
import { FaEye, FaCheck, FaUpload, FaTasks, FaEdit } from 'react-icons/fa';
import { MdNotificationImportant } from 'react-icons/md';

const KONG_COLORS: { name: string; color: string }[] = [
  { name: 'Donkey Kong', color: '#f5c518' },
  { name: 'Diddy Kong',  color: '#e63946' },
  { name: 'Lanky Kong',  color: '#4488cc' },
  { name: 'Tiny Kong',   color: '#9b59b6' },
  { name: 'Chunky Kong', color: '#2ecc71' },
];

function IconPill({ children }: { children: React.ReactNode }) {
  return <span className="icon-pill">{children}</span>;
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="home-section">
      <h3 className="home-section-title">{title}</h3>
      {children}
    </section>
  );
}

function DkHome() {
  return (
    <>
      <h2 className="gradient-jumpman" style={{ marginBottom: '1.5rem' }}>Welcome to the DK64 Randomizer Hint Viewer!</h2>

      <Section title="Getting Started">
        <p>
          This site lets <a href="https://dk64randomizer.com" target="_blank" rel="noreferrer">DK64 Randomizer</a> broadcasters securely share hints with their viewers. There are two ways to get started:
        </p>
        <ul>
          <li><strong><FaUpload style={{ verticalAlign: 'middle' }} /> <Link to="/upload">Upload</Link></strong> — Upload a spoiler log generated with "Generate Spoiler Log" enabled. Hints are populated automatically.</li>
          <li><strong><FaTasks style={{ verticalAlign: 'middle' }} /> <Link to="/create">Create</Link></strong> — Manually enter and edit hints without a spoiler log.</li>
        </ul>
        <p>We currently support:</p>
        <ul>
          <li>Standard Non-Progressive hints (Wrinkly Kong locations)</li>
          <li>Direct Instrument and Direct Shop hints</li>
          <li>Progressive hints when spoiler log is uploaded (grouped into Batches automatically)</li>
          <li>Foolish / WOTH automatic grouping when those keywords appear in a hint</li>
        </ul>
      </Section>

      <Section title="Revealing and Completing Hints">
        <ol>
          <li>Click <IconPill><FaEye /></IconPill> next to a hint to reveal it to your viewers.</li>
          <li>Once revealed, click <IconPill><FaCheck /></IconPill> to mark it as completed.</li>
          <li>After completing, click <IconPill><FaEdit /></IconPill> to select the item found at that location, it will appear with a <IconPill><MdNotificationImportant /></IconPill> indicator in the extension.</li>
        </ol>
      </Section>

      <Section title="Reading Non-Progressive Hints">
        <p>
          Each hint belongs to a Kong based on the color of the Wrinkly Kong door frame in that level. The colors match the Kong's theme color in the base game:
        </p>
        <ul>
          {KONG_COLORS.map(({ name, color }) => (
            <li key={name} className="kong-list-item">
              <span className="kong-color-dot" style={{ background: color }} />
              {name}
            </li>
          ))}
        </ul>
        <p>
          For example: a red door frame in Jungle Japes means the hint is listed under <strong>Japes Japes, Diddy</strong>.
        </p>
      </Section>

      <Section title="Progressive Hints">
        <p>
          Hints are grouped into Batches automatically. Check the in-game hint tracker in the pause menu to see which batch you've unlocked.
          Use the <strong>Reveal Level (Batch #)</strong> button below the hint viewer to unlock a full batch at once.
        </p>
      </Section>

      <div className="dev-note">
        This project is still in active development — expect occasional bugs and new features. Feedback is welcome!
      </div>
    </>
  );
}

export default DkHome;
