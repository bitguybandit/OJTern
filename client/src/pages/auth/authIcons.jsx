import React from 'react';

const stroke = {
  width: 18,
  height: 18,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round',
  strokeLinejoin: 'round'
};

export const ArrowLeftIcon = (props) => (
  <svg {...stroke} {...props}>
    <path d="M19 12H5" />
    <path d="m12 19-7-7 7-7" />
  </svg>
);

export const ArrowRightIcon = (props) => (
  <svg {...stroke} {...props}>
    <path d="M5 12h14" />
    <path d="m12 5 7 7-7 7" />
  </svg>
);

export const MailIcon = (props) => (
  <svg {...stroke} {...props}>
    <rect x="2.5" y="4.5" width="19" height="15" rx="2.5" />
    <path d="m3.5 7.5 7.6 5.2a2 2 0 0 0 2.2 0l7.6-5.2" />
  </svg>
);

export const LockIcon = (props) => (
  <svg {...stroke} {...props}>
    <rect x="4" y="10.5" width="16" height="10" rx="2.5" />
    <path d="M8.2 10.5V7.2a3.8 3.8 0 0 1 7.6 0v3.3" />
  </svg>
);

export const EyeIcon = (props) => (
  <svg {...stroke} {...props}>
    <path d="M2.6 12S6.1 5.8 12 5.8 21.4 12 21.4 12 17.9 18.2 12 18.2 2.6 12 2.6 12Z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

export const EyeOffIcon = (props) => (
  <svg {...stroke} {...props}>
    <path d="M10.4 6.2A9.6 9.6 0 0 1 12 6.1c5.9 0 9.4 5.9 9.4 5.9a17.4 17.4 0 0 1-2.7 3.4" />
    <path d="M6.5 7.6A16.6 16.6 0 0 0 2.6 12s3.5 5.9 9.4 5.9a9.4 9.4 0 0 0 4-.8" />
    <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
    <path d="m3.5 3.5 17 17" />
  </svg>
);

export const UserIcon = (props) => (
  <svg {...stroke} {...props}>
    <circle cx="12" cy="8.2" r="3.6" />
    <path d="M4.8 20a7.2 7.2 0 0 1 14.4 0" />
  </svg>
);

export const SchoolIcon = (props) => (
  <svg {...stroke} {...props}>
    <path d="M12 3.6 2.8 8 12 12.4 21.2 8 12 3.6Z" />
    <path d="M6.6 10.1v5.4c0 1.8 2.4 3.2 5.4 3.2s5.4-1.4 5.4-3.2v-5.4" />
  </svg>
);

export const ChevronDownIcon = (props) => (
  <svg {...stroke} {...props}>
    <path d="m6 9.5 6 6 6-6" />
  </svg>
);

export const CheckIcon = (props) => (
  <svg {...stroke} strokeWidth={2.4} {...props}>
    <path d="m4.8 12.6 4.8 4.8L19.4 7" />
  </svg>
);

export const CapIcon = (props) => (
  <svg {...stroke} {...props}>
    <path d="M21.5 9.4 12 4.6 2.5 9.4 12 14.2l9.5-4.8Z" />
    <path d="M6.4 11.8v4.4c0 1.7 2.5 3 5.6 3s5.6-1.3 5.6-3v-4.4" />
  </svg>
);

export const BuildingIcon = (props) => (
  <svg {...stroke} {...props}>
    <path d="M6.2 21V4.6A1.6 1.6 0 0 1 7.8 3h6.4a1.6 1.6 0 0 1 1.6 1.6V21" />
    <path d="M6.2 21H3.6a.6.6 0 0 1-.6-.6V11a1 1 0 0 1 1-1h2.2" />
    <path d="M15.8 21h4.6a.6.6 0 0 0 .6-.6V9.4a1 1 0 0 0-1-1h-4.2" />
    <path d="M9.4 7.2h3.2M9.4 10.8h3.2M9.4 14.4h3.2" />
  </svg>
);

export const ClipboardIcon = (props) => (
  <svg {...stroke} {...props}>
    <rect x="6.4" y="4.2" width="11.2" height="16.6" rx="2.2" />
    <path d="M9.6 4.2V3.1A1.4 1.4 0 0 1 11 1.7h2a1.4 1.4 0 0 1 1.4 1.4v1.1" />
    <path d="M9.8 10.6h4.4M9.8 14.4h4.4" />
  </svg>
);

export const ShieldUserIcon = (props) => (
  <svg {...stroke} {...props}>
    <path d="M12 21.4 4.8 18V8.6L12 5.6l7.2 3V18L12 21.4Z" />
    <circle cx="12" cy="11.6" r="2.1" />
    <path d="M8.6 16.7a3.8 3.8 0 0 1 6.8 0" />
  </svg>
);

export const SparkleIcon = (props) => (
  <svg width={26} height={26} viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M9.9 2.4c.36 0 .54.23.64.5l1.32 3.66 3.66 1.32c.27.1.5.28.5.64s-.23.54-.5.64l-3.66 1.32-1.32 3.66c-.1.27-.28.5-.64.5s-.54-.23-.64-.5l-1.32-3.66-3.66-1.32c-.27-.1-.5-.28-.5-.64s.23-.54.5-.64l3.66-1.32 1.32-3.66c.1-.27.28-.5.64-.5Z" />
    <path d="M17.7 13.2c.22 0 .33.14.39.3l.63 1.75 1.75.63c.16.06.3.17.3.39s-.14.33-.3.39l-1.75.63-.63 1.75c-.06.16-.17.3-.39.3s-.33-.14-.39-.3l-.63-1.75-1.75-.63c-.16-.06-.3-.17-.3-.39s.14-.33.3-.39l1.75-.63.63-1.75c.06-.16.17-.3.39-.3Z" />
  </svg>
);
