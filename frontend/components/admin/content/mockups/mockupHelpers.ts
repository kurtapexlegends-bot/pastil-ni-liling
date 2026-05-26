import React from 'react';

export const getBgStyle = (bgColor: string): React.CSSProperties => {
  switch (bgColor) {
    case 'bg-brand-yellow': 
    case 'bg-yellow-500':
      return { backgroundColor: '#d1a340' };
    case 'bg-brand-green': 
    case 'bg-green-700':
      return { backgroundColor: '#7ca33a' };
    case 'bg-brand-earth': 
      return { backgroundColor: '#1b2d16' };
    case 'bg-brand-red': 
    case 'bg-red-700':
      return { backgroundColor: '#a82e1a' };
    case 'bg-brand-gray': 
    case 'bg-zinc-100':
      return { backgroundColor: '#efebe4' };
    default: 
      return { backgroundColor: '#d1a340' };
  }
};

export const getTextStyle = (textColor: string): React.CSSProperties => {
  switch (textColor) {
    case 'text-brand-earth': 
      return { color: '#1b2d16' };
    case 'text-white': 
      return { color: '#ffffff' };
    case 'text-brand-yellow': 
      return { color: '#d1a340' };
    default: 
      return { color: '#1b2d16' };
  }
};
