import { useTwitchAuth } from '../hooks/useTwitchAuth';

function Config() {
  const { isAuthorized } = useTwitchAuth();

  return (
    <div style={{ color: 'white', padding: '20px' }}>
      <p>Hello, configs!</p>
      {window.Twitch?.ext && <p>Twitch SDK loaded</p>}
      {isAuthorized && <p>Authorized</p>}
    </div>
  );
}

export default Config;
