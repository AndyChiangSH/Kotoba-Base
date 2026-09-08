import { useEffect, useMemo, useState } from 'react'
import {
  BookOpen,
  Bookmark,
  Check,
  ChevronDown,
  CircleHelp,
  ExternalLink,
  LoaderCircle,
  Mic,
  Moon,
  Play,
  Search,
  Settings,
  Sparkles,
  Sun,
  Volume2,
  X,
} from 'lucide-react'

type Word = {
  id: string
  japanese: string
  reading: string
  meaning: string
  level: string
  example: { japanese: string; reading: string; translation: string }
  collocations: string[]
  related: { word: string; reading: string; note: string }[]
}

type SettingsState = { apiKey: string; model: string; theme: 'light' | 'dark' }

const starterWords: Word[] = [
  {
    id: 'taberu', japanese: '食べる', reading: 'たべる', meaning: '吃；食用', level: 'N5',
    example: { japanese: '毎朝、パンを食べます。', reading: 'まいあさ、パンをたべます。', translation: '每天早上吃麵包。' },
    collocations: ['ご飯を食べる', '一緒に食べる', 'たくさん食べる'],
    related: [{ word: '食事', reading: 'しょくじ', note: '用餐、飲食（名詞）' }, { word: '飲む', reading: 'のむ', note: '喝；服用（動詞）' }],
  },
  {
    id: 'yoyaku', japanese: '予約', reading: 'よやく', meaning: '預約；預訂', level: 'N4',
    example: { japanese: 'ホテルを予約しました。', reading: 'ホテルをよやくしました。', translation: '我預訂了飯店。' },
    collocations: ['予約をする', '予約を変更する', '事前予約'],
    related: [{ word: '予定', reading: 'よてい', note: '預定；計畫（名詞）' }, { word: '約束', reading: 'やくそく', note: '約定；承諾（名詞）' }],
  },
  {
    id: 'kirei', japanese: '綺麗', reading: 'きれい', meaning: '漂亮；乾淨', level: 'N5',
    example: { japanese: 'この花はとても綺麗ですね。', reading: 'このはなはとてもきれいですね。', translation: '這朵花真漂亮呢。' },
    collocations: ['綺麗な景色', '綺麗にする', 'とても綺麗'],
    related: [{ word: '美しい', reading: 'うつくしい', note: '美麗；優美（い形容詞）' }, { word: '清潔', reading: 'せいけつ', note: '清潔；衛生（な形容詞）' }],
  },
  {
    id: 'benkyou', japanese: '勉強', reading: 'べんきょう', meaning: '學習；用功', level: 'N5',
    example: { japanese: '日本語を勉強しています。', reading: 'にほんごをべんきょうしています。', translation: '我正在學習日文。' },
    collocations: ['日本語を勉強する', '勉強になる', '勉強を始める'],
    related: [{ word: '学ぶ', reading: 'まなぶ', note: '學習；習得（動詞）' }, { word: '練習', reading: 'れんしゅう', note: '練習；訓練（名詞）' }],
  },
]

const models = ['Gemini 3.1 Flash Lite', 'Gemini 3.5 Flash Lite', 'Gemini 2.5 Flash', 'Gemini 3 Flash', 'Gemini 3.5 Flash']
const modelIds: Record<string, string> = {
  'Gemini 3.1 Flash Lite': 'gemini-3.1-flash-lite-preview',
  'Gemini 3.5 Flash Lite': 'gemini-3.5-flash-lite-preview',
  'Gemini 2.5 Flash': 'gemini-2.5-flash',
  'Gemini 3 Flash': 'gemini-3-flash-preview',
  'Gemini 3.5 Flash': 'gemini-3.5-flash-preview',
}

function RubyText({ text, reading }: { text: string; reading: string }) {
  return <ruby>{text}<rt>{reading}</rt></ruby>
}

function App() {
  const [words, setWords] = useState<Word[]>(() => JSON.parse(localStorage.getItem('kotoba-words') || 'null') || starterWords)
  const [settings, setSettings] = useState<SettingsState>(() => JSON.parse(localStorage.getItem('kotoba-settings') || 'null') || { apiKey: '', model: models[2], theme: 'light' })
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState<Word | null>(starterWords[0])
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [notice, setNotice] = useState('')
  const [isListening, setIsListening] = useState(false)

  useEffect(() => { localStorage.setItem('kotoba-words', JSON.stringify(words)) }, [words])
  useEffect(() => { localStorage.setItem('kotoba-settings', JSON.stringify(settings)); document.documentElement.dataset.theme = settings.theme }, [settings])

  const filteredWords = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    if (!normalized) return words
    return words.filter((word) => `${word.japanese}${word.reading}${word.meaning}`.toLowerCase().includes(normalized))
  }, [query, words])

  const speak = (text: string) => {
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = 'zh-TW'
    window.speechSynthesis.speak(utterance)
  }

  const listen = () => {
    const SpeechRecognition = window.webkitSpeechRecognition
    if (!SpeechRecognition) { setNotice('此瀏覽器尚未支援語音輸入，建議使用最新版 Chrome。'); return }
    const recognition = new SpeechRecognition()
    recognition.lang = 'ja-JP'; recognition.interimResults = false
    setIsListening(true)
    recognition.onresult = (event: SpeechRecognitionEvent) => setQuery(event.results[0][0].transcript)
    recognition.onend = () => setIsListening(false)
    recognition.onerror = () => { setIsListening(false); setNotice('語音輸入沒有收到清楚的內容。') }
    recognition.start()
  }

  const translate = async () => {
    const cleanQuery = query.trim()
    if (!cleanQuery) { setNotice('先輸入一個日文單字或中文意思。'); return }
    const localWord = words.find((word) => `${word.japanese}${word.reading}${word.meaning}`.toLowerCase().includes(cleanQuery.toLowerCase()))
    if (localWord) { setSelected(localWord); setNotice('已從你的單字庫找到'); return }
    if (!settings.apiKey) { setNotice('找不到單字。請先在設定中填入 Gemini API Key。'); setIsSettingsOpen(true); return }
    setIsSearching(true); setNotice('正在向 Gemini 詢問單字資料…')
    const prompt = `你是日文老師。請針對「${cleanQuery}」回傳 JSON，不要 markdown。所有日文漢字的 reading 請用平假名，中文說明簡潔。格式：{"japanese":"","reading":"","meaning":"","level":"N5","example":{"japanese":"","reading":"","translation":""},"collocations":[""],"related":[{"word":"","reading":"","note":""}]}`
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${modelIds[settings.model]}:generateContent?key=${settings.apiKey}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] },), })
      if (!response.ok) throw new Error('API request failed')
      const data = await response.json()
      const raw = data.candidates?.[0]?.content?.parts?.[0]?.text?.replace(/```json|```/g, '').trim()
      if (!raw) throw new Error('Empty response')
      const result = JSON.parse(raw) as Omit<Word, 'id'>
      const resultWithId = { ...result, id: `${result.japanese}-${Date.now()}` }
      setSelected(resultWithId); setNotice('翻譯完成，可以儲存到單字庫')
    } catch { setNotice('Gemini 暫時無法回應，請檢查 API Key、模型或網路連線。') }
    finally { setIsSearching(false) }
  }

  const saveWord = () => {
    if (!selected) return
    if (words.some((word) => word.japanese === selected.japanese && word.reading === selected.reading)) { setNotice('這個單字已經在單字庫裡了'); return }
    setWords((current) => [selected, ...current]); setNotice('已儲存到你的單字庫')
  }

  return (
    <div className="app-shell">
      <nav className="topbar">
        <div className="brand"><span className="brand-mark"><BookOpen size={18} /></span><span>日文單字庫</span><span className="version-badge">v0.0</span></div>
        <button className="icon-button" aria-label="開啟設定" onClick={() => setIsSettingsOpen(true)}><Settings size={19} /><span>設定</span></button>
      </nav>

      <main className="workspace">
        <header className="intro">
          <div><p className="eyebrow">YOUR PERSONAL WORD BANK</p><h1>把每一次遇見，<em>留下來。</em></h1><p className="intro-copy">搜尋、理解、收藏日文單字。你的語言學習，從一個詞開始累積。</p></div>
          <div className="word-count"><strong>{words.length.toString().padStart(2, '0')}</strong><span>個單字<br />已收藏</span></div>
        </header>

        <section className="search-panel">
          <div className="search-row"><div className="search-input-wrap"><Search size={20} /><input value={query} onChange={(event) => setQuery(event.target.value)} onKeyDown={(event) => event.key === 'Enter' && translate()} placeholder="輸入日文單字或中文意思…" /><button className={`mic-button ${isListening ? 'listening' : ''}`} aria-label="日語語音輸入" onClick={listen}><Mic size={19} /></button></div><button className="translate-button" onClick={translate} disabled={isSearching}>{isSearching ? <LoaderCircle className="spin" size={18} /> : <Sparkles size={18} />}翻譯</button></div>
          <div className="search-hint"><span><CircleHelp size={14} /> 可以輸入「食べる」或「吃」</span><span>支援日語語音輸入</span></div>
        </section>

        {notice && <div className="notice"><span>{notice}</span><button onClick={() => setNotice('')} aria-label="關閉提示"><X size={15} /></button></div>}

        <div className="content-grid">
          <section className="library-section"><div className="section-heading"><div><p className="eyebrow">MY COLLECTION</p><h2>我的單字庫</h2></div><span className="result-count">{filteredWords.length} 個單字</span></div><div className="word-list">{filteredWords.map((word) => <button key={word.id} className={`word-row ${selected?.id === word.id ? 'active' : ''}`} onClick={() => setSelected(word)}><span className="word-japanese"><RubyText text={word.japanese} reading={word.reading} /></span><span className="word-meaning">{word.meaning}</span><span className="level">{word.level}</span><ChevronDown className="row-arrow" size={16} /></button>)}{filteredWords.length === 0 && <div className="empty-state"><Search size={24} /><p>單字庫裡還沒有這個詞</p><span>按下翻譯，讓 Gemini 幫你查詢</span></div>}</div></section>

          {selected && <section className="detail-section"><div className="detail-topline"><span className="eyebrow">WORD DETAIL</span><button className="save-button" onClick={saveWord}><Bookmark size={17} />儲存單字</button></div><div className="detail-title"><div><h2><RubyText text={selected.japanese} reading={selected.reading} /></h2><p>{selected.meaning}</p></div><span className="large-level">{selected.level}</span></div><div className="detail-block example-block"><div className="block-label"><span>例句</span><button className="audio-button" onClick={() => speak(selected.example.translation)} title="播放中文翻譯"><Volume2 size={16} /></button></div><p className="example-japanese"><RubyText text={selected.example.japanese} reading={selected.example.reading} /></p><p className="example-translation">{selected.example.translation}</p></div><div className="detail-block"><div className="block-label"><span>常見搭配詞</span></div><div className="chips">{selected.collocations.map((item) => <span key={item}>{item}</span>)}</div></div><div className="detail-block"><div className="block-label"><span>相關詞比較</span></div><div className="related-list">{selected.related.map((item) => <div className="related-item" key={item.word}><strong><RubyText text={item.word} reading={item.reading} /></strong><span>{item.note}</span></div>)}</div></div><div className="listen-bar"><div><Volume2 size={18} /><span>中文語音輸出</span></div><button onClick={() => speak(selected.example.translation)}><Play size={14} fill="currentColor" />播放翻譯</button></div></section>}
        </div>
      </main>

      <footer><span>2026/09/08&nbsp; | &nbsp;Copyright © 2026 Andy Chiang</span><a href="https://github.com/AndyChiangSH/Kotoba-Base" target="_blank" rel="noreferrer">GitHub <ExternalLink size={13} /></a></footer>

      {isSettingsOpen && <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && setIsSettingsOpen(false)}><section className="settings-modal" role="dialog" aria-modal="true"><div className="modal-header"><div><p className="eyebrow">PREFERENCES</p><h2>設定</h2></div><button className="close-button" onClick={() => setIsSettingsOpen(false)} aria-label="關閉設定"><X size={19} /></button></div><label className="field-label">Gemini API Key<a href="https://aistudio.google.com/apikey" target="_blank" rel="noreferrer">Google AI Studio <ExternalLink size={13} /></a></label><input className="text-field" type="password" value={settings.apiKey} onChange={(event) => setSettings({ ...settings, apiKey: event.target.value })} placeholder="貼上你的 API Key" /><p className="field-help">API Key 只會儲存在這個瀏覽器，不會上傳到 Kotoba Base。</p><label className="field-label">Gemini 模型</label><select className="text-field" value={settings.model} onChange={(event) => setSettings({ ...settings, model: event.target.value })}>{models.map((model) => <option key={model}>{model}</option>)}</select><label className="field-label">介面主題</label><div className="theme-options"><button className={settings.theme === 'light' ? 'selected' : ''} onClick={() => setSettings({ ...settings, theme: 'light' })}><Sun size={17} />淺色{settings.theme === 'light' && <Check size={15} />}</button><button className={settings.theme === 'dark' ? 'selected' : ''} onClick={() => setSettings({ ...settings, theme: 'dark' })}><Moon size={17} />深色{settings.theme === 'dark' && <Check size={15} />}</button></div><button className="done-button" onClick={() => setIsSettingsOpen(false)}>完成</button></section></div>}
    </div>
  )
}

declare global { interface Window { webkitSpeechRecognition: new () => SpeechRecognition } interface SpeechRecognition { lang: string; interimResults: boolean; onresult: (event: SpeechRecognitionEvent) => void; onend: () => void; onerror: () => void; start: () => void } }

export default App
