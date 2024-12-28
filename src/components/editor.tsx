import React, { useCallback, useState } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { json } from '@codemirror/lang-json';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface BSONEditorProps {
  initialValue: string;
  onChange?: (value: string) => void;
  readOnly?: boolean;
}

const BSONEditor: React.FC<BSONEditorProps> = ({ initialValue, onChange, readOnly = false }) => {
  const [error, setError] = useState<string>('');
  const [editorValue, setEditorValue] = useState<string>(initialValue);

  const handleChange = useCallback(
    (value: string) => {
      setEditorValue(value);
      setError('');

      try {
        onChange?.(value);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Invalid BSON format';
        setError(errorMessage);
      }
    },
    [onChange],
  );

  return (
    <>
      {error && (
        <Alert variant='destructive'>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <CodeMirror
        value={editorValue}
        height='400px'
        extensions={[json()]}
        onChange={handleChange}
        readOnly={readOnly}
        className='border rounded-md'
        theme='light'
      />
    </>
  );
};

export default BSONEditor;
