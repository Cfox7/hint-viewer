import { Link } from 'react-router-dom';
import { FaEye, FaCheck, FaUpload, FaTasks } from 'react-icons/fa';
import { MdNotificationImportant } from 'react-icons/md';

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

function OotHome() {
  return (
    <>
      <Section title="Getting Started">
        <p>
          This site lets <a href="https://ootrandomizer.com/" target="_blank" rel="noreferrer">Ocarina of Time Randomizer</a> broadcasters securely share hints with their viewers. 
          Once you log in there are two ways to get started:
        </p>
        <ul>
          <li><strong><FaUpload style={{ verticalAlign: 'middle' }} /> <Link to="/upload">Upload</Link></strong> — Upload a spoiler log generated with "Create Spoiler Log" enabled. Hints are populated automatically.</li>
          <li><strong><FaTasks style={{ verticalAlign: 'middle' }} /> <Link to="/create">Create</Link></strong> — Manually enter and edit hints without a spoiler log.</li>
        </ul>
        <p>We currently support:</p>
        <ul>
          <li>Standard Non-Progressive hints (Gossip Stone locations)</li>
          <li>Direct hints</li>
          <li>Foolish / WOTH automatic grouping when those keywords appear in a hint</li>
        </ul>
      </Section>

      <Section title="Reading Hints">
        <p>
          Hints come from Gossip Stones scattered throughout Hyrule. Each region in the carousel contains a list of gossip stone locations for that area. When you reach a stone in-game, find the matching entry and reveal it to show the hint text to your viewers.
        </p>
        <p>
          For example, the <strong>Colossus</strong> region might list <strong>Spirit Temple</strong>. After reading the stone in-game, reveal that entry to display its hint.
        </p>
      </Section>

      <Section title="Revealing and Completing Hints">
        <ol>
          <li>Click <IconPill><FaEye /></IconPill> next to a hint to reveal it to your viewers.</li>
          <li>Once revealed, click <IconPill><FaCheck /></IconPill> to mark it as completed.</li>
          <li>After completing, use the dropdown to select the item found at that location. It will appear with a <IconPill><MdNotificationImportant /></IconPill> indicator in the extension.</li>
        </ol>
      </Section>

      <Section title="Creating Hints">
        <p>
          When manually creating hints on the <strong><FaTasks style={{ verticalAlign: 'middle' }} /> <Link to="/create">Create</Link></strong> page, certain keywords will automatically group hints into their own sections:
        </p>
        <ul>
          <li>
            Hints containing <strong style={{ color: '#FF0000' }}>foolish</strong> or <strong><span style={{ color: '#FF0000' }}>0</span> major</strong> will be grouped into a <strong>Foolish Hints</strong> section.
          </li>
          <li>
            Hints containing <strong style={{ color: '#FFA010' }}>path to</strong> or a <strong>greater than 0 major</strong> count (i.e. <strong><span style={{ color: '#FFA010' }}>1</span> major</strong>) will be grouped into a <strong>Path/Major Hints</strong> section.
          </li>
        </ul>
        <p>
          This grouping happens automatically whenever hints are saved. The keywords are case-insensitive and will also be color-coded when displayed to viewers.
        </p>
      </Section>

      <Section title="Seed Settings">
        <p>
          When uploading a spoiler log, seed settings are automatically extracted and saved. You can also configure them manually
          using the <strong>Seed Settings</strong> button on the <strong><FaUpload style={{ verticalAlign: 'middle' }} /> <Link to="/upload">Upload</Link></strong> or <strong><FaTasks style={{ verticalAlign: 'middle' }} /> <Link to="/create">Create</Link></strong> pages.
        </p>
        <p>
          Choose from presets like <strong>S9 Tournament</strong>, <strong>SGL 2026</strong>, or <strong>League S9</strong> to quickly populate common tournament settings,
          or pick individual settings from the full list. Selected settings and their values are displayed to viewers in the extension.
        </p>
      </Section>

    </>
  );
}

export default OotHome;
