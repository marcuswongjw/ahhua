// Browser speech adapter with explicit playback lifecycle for the avatar.
export function speechLanguage(text) {
  const han = (text.match(/[\u3400-\u9fff]/g) || []).length;
  const latin = (text.match(/[a-z]/gi) || []).length;
  return han > latin ? 'zh-CN' : 'en-SG';
}
export function createVoicePlayer({ synthesis, Utterance, onState, onError }) {
  let generation = 0;
  function stop() { generation++; synthesis?.cancel(); onState(false); }
  function play(text) {
    stop();
    if (!synthesis || !Utterance) { onError(); return; }
    const current = generation;
    const utterance = new Utterance(text.replace(/[😊🍲]/gu, ''));
    utterance.lang = speechLanguage(text); utterance.rate = .94;
    const voices = synthesis.getVoices();
    const voice = voices.find(x => x.lang === utterance.lang) || voices.find(x => x.lang.startsWith(utterance.lang.slice(0,2)));
    if (voice) utterance.voice = voice;
    utterance.onstart = () => { if (current === generation) onState(true); };
    utterance.onend = () => { if (current === generation) onState(false); };
    utterance.onerror = event => {
      if (current !== generation) return;
      onState(false);
      if (!['canceled','interrupted'].includes(event.error)) onError();
    };
    try { synthesis.speak(utterance); } catch { onState(false); onError(); }
  }
  return { play, stop };
}
