function Config() {
  return (
    <div className="carousel-container no-spoiler-container">
      <div className="hint-text">
        <h1 className="gradient-jumpman level-title">Hint Viewer — Usage</h1>

        <div className="no-spoiler-message">
          <p>
            This extension displays hints to your viewers. To set it up:
          </p>

          <ol className="no-spoiler-list">
            <li>
              Visit <a href="https://hint-viewer.vercel.app" target="_blank" rel="noopener noreferrer">the broadcaster site</a> and sign in with your Twitch account.
            </li>
            <li>
              Upload a spoiler log on the broadcaster site. Everything you see in your Hint Viewer will be mirrored to your viewers.
            </li>
            <li>
              Return to your channel and ensure the extension is active. Refresh if needed.
            </li>
          </ol>

          <p>
            Notes: This extension currently supports Donkey Kong 64 Randomizer only.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Config;
