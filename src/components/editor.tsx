import React, { useCallback, useState } from 'react';
import { EJSON } from 'bson';
import CodeMirror from '@uiw/react-codemirror';
import { json } from '@codemirror/lang-json';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toJsonString, toString } from '@/lib/bson';

interface BSONEditorProps {
  initialValue: string;
  onChange?: (value: string) => void;
  readOnly?: boolean;
}

const BSONEditor: React.FC<BSONEditorProps> = ({ initialValue, onChange, readOnly = false }) => {
  const [error, setError] = useState<string>('');
  const [editorValue, setEditorValue] = useState<string>(initialValue);

  const validateBSON = (jsonStr: string): boolean => {
    try {
      EJSON.parse(jsonStr);
      return true;
    } catch (error: unknown) {
      return false;
    }
  };

  const handleChange = useCallback(
    (value: string) => {
      setEditorValue(value);
      setError('');

      try {
        if (!validateBSON(value)) {
          setError('Invalid BSON format');
          return;
        }

        onChange?.(value);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Invalid BSON format';
        setError(errorMessage);
      }
    },
    [onChange],
  );

  const formatBSON = (input: string): string => {
    try {
      return toString(input) || '';
    } catch {
      return input;
    }
  };

  return (
    <>
      {error && (
        <Alert variant='destructive'>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <CodeMirror
        value={formatBSON(editorValue)}
        height='400px'
        extensions={[json()]}
        onChange={handleChange}
        readOnly={readOnly}
        className='border rounded-md'
        theme='dark'
      />
    </>
  );
};

export default BSONEditor;
