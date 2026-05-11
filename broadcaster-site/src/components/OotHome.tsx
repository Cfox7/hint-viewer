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
      <h2 className="theme-gradient-text" style={{ marginBottom: '1.5rem' }}>Welcome to the Oot Randomizer Hint Viewer!</h2>

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

      <Section title="Revealing and Completing Hints">
        <ol>
          <li>Click <IconPill><FaEye /></IconPill> next to a hint to reveal it to your viewers.</li>
          <li>Once revealed, click <IconPill><FaCheck /></IconPill> to mark it as completed.</li>
          <li>After completing, use the dropdown to select the item found at that location. It will appear with a <IconPill><MdNotificationImportant /></IconPill> indicator in the extension.</li>
        </ol>
      </Section>

      <Section title="Reading Hints">
        <p>
          Hints come from Gossip Stones scattered throughout Hyrule. Each region in the carousel contains a list of gossip stone locations for that area. When you reach a stone in-game, find the matching entry and reveal it to show the hint text to your viewers.
        </p>
        <p>
          For example, the <strong>Colossus</strong> region might list <strong>Spirit Temple</strong>. After reading the stone in-game, reveal that entry to display its hint.
        </p>
      </Section>

      <div className="dev-note">
        This project is still in active development — expect occasional bugs and new features. Feedback is welcome!
      </div>
    </>
  );
}

export default OotHome;
