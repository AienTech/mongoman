import React, { useState } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { json } from '@codemirror/lang-json';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { EJSON } from 'bson';

interface Props {
  initialValue: object;
  onChange: (newValue: object) => void;
}

const DocumentEditor = ({ onChange, initialValue }: Props) => {
  const [error, setError] = useState<string>('');

  const initialValueString = JSON.stringify(initialValue, null, 2);

  return (
    <>
      <CodeMirror
        value={initialValueString}
        height='300px'
        theme='light'
        extensions={[json()]}
        onChange={(value) => {
          try {
            const parsedValue = EJSON.parse(value);

            if (typeof parsedValue !== 'object' || Array.isArray(parsedValue) || parsedValue === null) {
              setError('Input must be a valid JSON object');
              return;
            }

            setError('');
            onChange(parsedValue);
          } catch {
            setError('Invalid JSON: Please enter a valid JSON object');
          }
        }}
        className='mb-4 border rounded'
      />
      {error && (
        <Alert variant='destructive' className='mt-2'>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </>
  );
};

export default DocumentEditor;
