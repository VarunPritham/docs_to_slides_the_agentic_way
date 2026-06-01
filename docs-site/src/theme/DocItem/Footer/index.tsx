import React, { useState } from 'react';
import Footer from '@theme-original/DocItem/Footer';
import type FooterType from '@theme/DocItem/Footer';
import type { WrapperProps } from '@docusaurus/types';
import styles from './styles.module.css';

type Props = WrapperProps<typeof FooterType>;

type Status = 'idle' | 'generating' | 'done' | 'error';

const STEPS = [
  'Reading file…',
  'Cleaning MDX…',
  'Extracting content…',
  'Resolving attachments…',
  'Chunking into slides…',
  'Condensing prose…',
  'Designing layouts…',
  'Assembling slides…',
];

function GenerateSlidesButton(): JSX.Element {
  const [status, setStatus]       = useState<Status>('idle');
  const [slidesUrl, setSlidesUrl] = useState<string>('');
  const [slideCount, setSlideCount] = useState<number>(0);
  const [errorMsg, setErrorMsg]   = useState<string>('');
  const [stepIdx, setStepIdx]     = useState<number>(0);

  const handleGenerate = async () => {
    setStatus('generating');
    setErrorMsg('');
    setStepIdx(0);

    // Cycle through step labels while waiting
    const interval = setInterval(() => {
      setStepIdx(i => (i + 1) % STEPS.length);
    }, 800);

    const docPath = window.location.pathname;

    try {
      const res = await fetch('http://localhost:8000/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ doc_path: docPath }),
      });

      clearInterval(interval);

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || 'Server error');
      }

      const data = await res.json();
      setSlidesUrl(data.slides_url);
      setSlideCount(data.slide_count);
      setStatus('done');
      // Use named target so repeat clicks refresh the same tab instead of opening new ones
      window.open(data.slides_url, 'slidev-preview');
    } catch (e: any) {
      clearInterval(interval);
      setErrorMsg(e.message || 'Failed to connect to pipeline server');
      setStatus('error');
    }
  };

  return (
    <div className={styles.container}>
      <button
        className={styles.button}
        onClick={handleGenerate}
        disabled={status === 'generating'}
      >
        {status === 'generating'
          ? `⏳ ${STEPS[stepIdx]}`
          : '▶ Generate Slides'}
      </button>

      {status === 'done' && slidesUrl && (
        <span className={styles.success}>
          ✓ {slideCount} slides ready —{' '}
          <a href={slidesUrl} target="_blank" rel="noreferrer">
            open presentation
          </a>
        </span>
      )}

      {status === 'error' && (
        <span className={styles.error}>
          ✗ {errorMsg}
          {errorMsg.includes('connect') && (
            <> — is <code>python server.py</code> running?</>
          )}
        </span>
      )}
    </div>
  );
}

export default function DocItemFooterWrapper(props: Props): JSX.Element {
  return (
    <>
      <Footer {...props} />
      <GenerateSlidesButton />
    </>
  );
}
