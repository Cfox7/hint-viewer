import { FaUpload, FaTasks, FaEye, FaCheck, FaEdit } from 'react-icons/fa';

function Step({ number, children }: { number: number; children: React.ReactNode }) {
  return (
    <div className="config-step">
      <span className="config-step-number">{number}</span>
      <span>{children}</span>
    </div>
  );
}

function Config() {
  return (
    <div className="config-page">
      <h1 className="gradient-jumpman config-title">HintViewer</h1>
      <p className="config-subtitle">DK64 Randomizer</p>

      <section className="config-section">
        <h2 className="config-section-title">Setup</h2>
        <Step number={1}>
          Go to <a href="https://hintviewer.com" target="_blank" rel="noopener noreferrer">hintviewer.com</a> and sign in with your Twitch account.
        </Step>
        <Step number={2}>
          Load your hints using <FaUpload className="config-inline-icon" /> <strong>Upload</strong> (spoiler log JSON) or <FaTasks className="config-inline-icon" /> <strong>Create</strong> (manual entry).
        </Step>
        <Step number={3}>
          Activate the extension as a panel on your channel. Viewers will see hints update live.
        </Step>
      </section>

      <section className="config-section">
        <h2 className="config-section-title">During a Run</h2>
        <div className="config-legend">
          <div className="config-legend-item"><FaEye className="config-inline-icon" /> Reveal a hint to viewers</div>
          <div className="config-legend-item"><FaCheck className="config-inline-icon" /> Mark a hint as completed</div>
          <div className="config-legend-item"><FaEdit className="config-inline-icon" /> Set the item found at that location</div>
        </div>
      </section>
    </div>
  );
}

export default Config;
