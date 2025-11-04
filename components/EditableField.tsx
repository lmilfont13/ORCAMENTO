
import React, { useState, useRef, useEffect } from 'react';

interface EditableFieldProps {
  initialValue: string;
  onSave: (value: string) => void;
  className?: string;
  isTextarea?: boolean;
}

const EditableField: React.FC<EditableFieldProps> = ({ initialValue, onSave, className, isTextarea = false }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(initialValue);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleBlur = () => {
    setIsEditing(false);
    onSave(value);
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !isTextarea) {
        handleBlur();
    }
  };

  if (isEditing) {
    if (isTextarea) {
      return (
        <textarea
          ref={inputRef as React.RefObject<HTMLTextAreaElement>}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onBlur={handleBlur}
          className={`${className} w-full bg-yellow-100 border border-yellow-300 rounded-md p-1 -m-1`}
          rows={3}
        />
      );
    }
    return (
      <input
        ref={inputRef as React.RefObject<HTMLInputElement>}
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        className={`${className} w-full bg-yellow-100 border border-yellow-300 rounded-md p-1 -m-1`}
      />
    );
  }

  return (
    <div
      onClick={() => setIsEditing(true)}
      className={`${className} cursor-pointer hover:bg-gray-100 p-1 -m-1 rounded-md whitespace-pre-wrap`}
    >
      {value || (isTextarea ? 'Clique para editar...' : '...')}
    </div>
  );
};

export default EditableField;
   