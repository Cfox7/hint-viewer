import { useState } from 'react';

interface SpoilerLog {
  "Wrinkly Hints": {
    [hintLocation: string]: string;
  };
}

interface UploadProps {
  setSpoilerData: (data: SpoilerLog | null) => void;
}

function Upload({ setSpoilerData }: UploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setError(null);

    try {
      const text = await selectedFile.text();
      const json = JSON.parse(text);
      setSpoilerData(json);
      console.log('Loaded spoiler data:', json);
    } catch (err) {
      setError('Failed to parse JSON file');
      console.error('Parse error:', err);
    }
  };

  return (
    <div style={{ padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }}>
      <h3>Upload Spoiler Log</h3>
      <input
        type="file"
        accept=".json"
        onChange={handleFileChange}
      />
      {file && (
        <div style={{ marginTop: '10px' }}>
          <p style={{ color: 'green' }}>✓ Loaded: {file.name}</p>
        </div>
      )}
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
}

export default Upload;