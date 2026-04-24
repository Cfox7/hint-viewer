import { Link } from 'react-router-dom';

function DkHome() {
  return (
    <>
      <h2 className="gradient-jumpman">Welcome to the DK64 Randomizer Hint Viewer!</h2>
      <p>
        This site allows <a href="https://dk64randomizer.com" target="_blank" rel="noreferrer">DK64 Randomizer</a> broadcasters to securely upload and share spoiler logs for their seeds.
        Before generating your seed, make sure to select "Generate Spoiler Log" as you'll need it to use this site.
      </p>
      <p>
        Log in with your Twitch account to access the hint viewer and upload your spoiler log. After logging in, you can view and manage your hints on the <Link to="/upload">Upload page</Link>.
      </p>
      <p>We currently support:</p>
      <ul>
        <li>Standard Non-Progressive hints, which includes rando Wrinkly Kong locations.</li>
        <li>Progressive hints</li>
      </ul>
      <h2 className="gradient-jumpman">Using the Hint Viewer</h2>
      <p>
        You reveal individual hints by clicking on the eye icon <i className="bi-eye"></i> to the right of the hint title.
      </p>
      <p>
        For Non-Progressive hints: When selecting which hints to reveal, you'll look at what level you are currently in and the color of the door frame. Which will match
        the color of the Kong in the base game:</p>
      <ul>
        <li>Donkey Kong: Yellow</li>
        <li>Diddy Kong: Red</li>
        <li>Lanky Kong: Blue</li>
        <li>Tiny Kong: Purple</li>
        <li>Chunky Kong: Green</li>
      </ul>
      <p>So for example: A Red Door framed Wrinkly Kong in Jungle Japes will be under Jungle Japes, Japes Diddy.</p>
      <p>For Progressive hints: The hints will automatically be separated into Batches. To see what batch you have unlocked, refer to the in-game hint tracker in the pause menu.
        To unlock a full batch at a time you can select the "Reveal Level(Batch #)" below the hint viewer.
      </p>
      <p>
        This is still in early development, so expect some bugs and missing features. Feedback is welcome!
      </p>
    </>
  );
}

export default DkHome;