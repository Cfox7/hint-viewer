import { FaUpload, FaTasks, FaEye, FaCheck, FaEdit, FaCog, FaStore } from 'react-icons/fa';

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
      <h1 className="theme-gradient-text config-title">HintViewer</h1>
      <p className="config-subtitle">Currently supports Donkey Kong 64 and Ocarina of Time Randomizer</p>

      <section className="config-section">
        <h2 className="config-section-title">Setup</h2>
        <Step number={1}>
          Go to <a href="https://hintviewer.com" target="_blank" rel="noopener noreferrer">hintviewer.com</a> and sign in with your Twitch account.
        </Step>
        <Step number={2}>
          Select which game you are playing at the top middle of the header. This will determine the layout of the hints.
        </Step>
        <Step number={3}>
          Load your hints using <FaUpload className="config-inline-icon" /> <strong>Upload</strong> (spoiler log JSON) or <FaTasks className="config-inline-icon" /> <strong>Create</strong> (manual entry).
        </Step>
        <Step number={4}>
          Activate the extension as a panel on your channel. Viewers will see hints update live.
        </Step>
        <Step number={5}>
          After uploading a spoiler log, use <FaCog className="config-inline-icon" /> <strong>Seed Settings</strong> to review and adjust
          the settings for your seed. Save them so viewers can see the rules of the seed in the extension.
        </Step>
      </section>

      <section className="config-section">
        <h2 className="config-section-title">During a Run</h2>
        <div className="config-legend">
          <div className="config-legend-item"><FaEye className="config-inline-icon" /> Reveal a hint to viewers</div>
          <div className="config-legend-item"><FaCheck className="config-inline-icon" /> Mark a hint as completed</div>
          <div className="config-legend-item"><FaEdit className="config-inline-icon" /> Set the item found at that location</div>
          <div className="config-legend-item">
            <FaStore className="config-inline-icon" /> While playing DK64, use the <strong>Shop Tracker</strong> to track moves and items
            purchased from Cranky, Funky, and Candy across each level.
          </div>
        </div>
      </section>
    </div>
  );
}

export default Config;
