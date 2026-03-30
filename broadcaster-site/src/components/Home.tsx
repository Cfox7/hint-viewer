import { Link } from 'react-router-dom';

function Home() {
  return (
    <>
      <h2 className="gradient-jumpman">Welcome to the DK64 Randomizer Hint Viewer!</h2>
      <p>
        This site allows DK64 Randomizer broadcasters to securely upload and share spoiler logs for their seeds.
        Log in with your Twitch account to access the hint viewer and upload your spoiler log.
      </p>
      <p>
        After logging in, you can view and manage your hints on the <Link to="/upload">Upload page</Link>.
      </p>
      <p>
        Currently we support Standard hints with or without progressive hints. Future updates may include additional hint types and customization options.
      </p>
      <p>
        This is still in early development, so expect some bugs and missing features. Feedback is welcome!
      </p>
    </>
  );
}

export default Home;