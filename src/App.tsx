import { useEffect, useMemo, useState } from 'react'
import {
  BookOpen,
  Bookmark,
  Check,
  ClipboardPaste,
  CircleHelp,
  ExternalLink,
  LoaderCircle,
  Mic,
  Moon,
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
  partOfSpeech: string
  examples: { japanese: string; reading: string; translation: string }[]
  collocations: { word: string; reading: string; meaning: string }[]
  related: { word: string; reading: string; note: string }[]
}

type SettingsState = { apiKey: string; model: string; theme: 'light' | 'dark' }

const starterWords: Word[] = [
  {
    id: 'taberu', japanese: '食べる', reading: 'たべる', meaning: '吃；食用', level: 'N5',
    partOfSpeech: '動詞・一段動詞',
    examples: [{ japanese: '毎朝、パンを食べます。', reading: 'まいあさ、パンをたべます。', translation: '每天早上吃麵包。' }, { japanese: '一緒に昼ご飯を食べませんか。', reading: 'いっしょにひるごはんをたべませんか。', translation: '要不要一起吃午餐？' }, { japanese: '野菜をたくさん食べてください。', reading: 'やさいをたくさんたべてください。', translation: '請多吃蔬菜。' }],
    collocations: [{ word: 'ご飯を食べる', reading: 'ごはんをたべる', meaning: '吃飯' }, { word: '一緒に食べる', reading: 'いっしょにたべる', meaning: '一起吃' }, { word: 'たくさん食べる', reading: 'たくさんたべる', meaning: '吃很多' }],
    related: [{ word: '食事', reading: 'しょくじ', note: '用餐、飲食（名詞）' }, { word: '飲む', reading: 'のむ', note: '喝；服用（動詞）' }, { word: '料理', reading: 'りょうり', note: '料理；菜餚（名詞）' }],
  },
  {
    id: 'yoyaku', japanese: '予約', reading: 'よやく', meaning: '預約；預訂', level: 'N4',
    partOfSpeech: '名詞・サ變動詞',
    examples: [{ japanese: 'ホテルを予約しました。', reading: 'ホテルをよやくしました。', translation: '我預訂了飯店。' }, { japanese: 'レストランの予約をお願いします。', reading: 'レストランのよやくをおねがいします。', translation: '麻煩幫我預約餐廳。' }, { japanese: '予約を変更したいです。', reading: 'よやくをへんこうしたいです。', translation: '我想更改預約。' }],
    collocations: [{ word: '予約をする', reading: 'よやくをする', meaning: '進行預約' }, { word: '予約を変更する', reading: 'よやくをへんこうする', meaning: '更改預約' }, { word: '事前予約', reading: 'じぜんよやく', meaning: '事前預約' }],
    related: [{ word: '予定', reading: 'よてい', note: '預定；計畫（名詞）' }, { word: '約束', reading: 'やくそく', note: '約定；承諾（名詞）' }, { word: '申込み', reading: 'もうしこみ', note: '申請；報名（名詞）' }],
  },
  {
    id: 'kirei', japanese: '綺麗', reading: 'きれい', meaning: '漂亮；乾淨', level: 'N5',
    partOfSpeech: 'な形容詞',
    examples: [{ japanese: 'この花はとても綺麗ですね。', reading: 'このはなはとてもきれいですね。', translation: '這朵花真漂亮呢。' }, { japanese: '部屋を綺麗に掃除しました。', reading: 'へやをきれいにそうじしました。', translation: '把房間打掃得很乾淨。' }, { japanese: '綺麗な海を見たいです。', reading: 'きれいなうみをみたいです。', translation: '我想看美麗的海。' }],
    collocations: [{ word: '綺麗な景色', reading: 'きれいなけしき', meaning: '漂亮的景色' }, { word: '綺麗にする', reading: 'きれいにする', meaning: '弄乾淨' }, { word: 'とても綺麗', reading: 'とてもきれい', meaning: '非常漂亮' }],
    related: [{ word: '美しい', reading: 'うつくしい', note: '美麗；優美（い形容詞）' }, { word: '清潔', reading: 'せいけつ', note: '清潔；衛生（な形容詞）' }, { word: '汚い', reading: 'きたない', note: '骯髒；不乾淨（い形容詞）' }],
  },
  {
    id: 'benkyou', japanese: '勉強', reading: 'べんきょう', meaning: '學習；用功', level: 'N5',
    partOfSpeech: '名詞・サ變動詞',
    examples: [{ japanese: '日本語を勉強しています。', reading: 'にほんごをべんきょうしています。', translation: '我正在學習日文。' }, { japanese: '毎日二時間勉強します。', reading: 'まいにちにじかんべんきょうします。', translation: '每天學習兩個小時。' }, { japanese: '試験のために勉強を始めました。', reading: 'しけんのためにべんきょうをはじめました。', translation: '為了考試開始學習。' }],
    collocations: [{ word: '日本語を勉強する', reading: 'にほんごをべんきょうする', meaning: '學習日文' }, { word: '勉強になる', reading: 'べんきょうになる', meaning: '學到很多' }, { word: '勉強を始める', reading: 'べんきょうをはじめる', meaning: '開始學習' }],
    related: [{ word: '学ぶ', reading: 'まなぶ', note: '學習；習得（動詞）' }, { word: '練習', reading: 'れんしゅう', note: '練習；訓練（名詞）' }, { word: '研究', reading: 'けんきゅう', note: '研究；鑽研（名詞）' }],
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
  if (!/[一-龯々]/.test(text)) return <>{text}</>
  return <ruby>{text}<rt>{reading}</rt></ruby>
}

function App() {
  const [words, setWords] = useState<Word[]>(() => {
    const stored = JSON.parse(localStorage.getItem('kotoba-words') || 'null')
    return Array.isArray(stored) && stored.every((word) => Array.isArray(word.examples) && word.partOfSpeech) ? stored : starterWords
  })
  const [settings, setSettings] = useState<SettingsState>(() => JSON.parse(localStorage.getItem('kotoba-settings') || 'null') || { apiKey: '', model: models[2], theme: 'light' })
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState<Word | null>(starterWords[0])
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [notice, setNotice] = useState('')
  const [isNoticeLeaving, setIsNoticeLeaving] = useState(false)
  const [isListening, setIsListening] = useState(false)

  useEffect(() => { localStorage.setItem('kotoba-words', JSON.stringify(words)) }, [words])
  useEffect(() => { localStorage.setItem('kotoba-settings', JSON.stringify(settings)); document.documentElement.dataset.theme = settings.theme }, [settings])
  useEffect(() => {
    if (!notice) return
    setIsNoticeLeaving(false)
    const fadeTimer = window.setTimeout(() => setIsNoticeLeaving(true), 3000)
    const removeTimer = window.setTimeout(() => setNotice(''), 3400)
    return () => { window.clearTimeout(fadeTimer); window.clearTimeout(removeTimer) }
  }, [notice])

  const filteredWords = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    if (!normalized) return words
    return words.filter((word) => `${word.japanese}${word.reading}${word.meaning}`.toLowerCase().includes(normalized))
  }, [query, words])

  const pasteQuery = async () => {
    try {
      setQuery(await navigator.clipboard.readText())
    } catch {
      setNotice('無法讀取剪貼簿，請確認瀏覽器已允許貼上。')
    }
  }

  const speakJapanese = (text: string) => {
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = 'ja-JP'
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
    const prompt = `你是日文老師。請針對「${cleanQuery}」回傳 JSON，不要 markdown。請用 Gemini 判斷 JLPT 難度，只能是 N5、N4、N3、N2、N1。只有日文漢字需要 reading，假名與中文不需重複標注。請至少提供 3 句不同例句、3 個搭配詞（每個附中文意思）、3 個同義詞/反義詞/相似詞。格式：{"japanese":"","reading":"","meaning":"","level":"N5","partOfSpeech":"","examples":[{"japanese":"","reading":"","translation":""},{"japanese":"","reading":"","translation":""},{"japanese":"","reading":"","translation":""}],"collocations":[{"word":"","reading":"","meaning":""},{"word":"","reading":"","meaning":""},{"word":"","reading":"","meaning":""}],"related":[{"word":"","reading":"","note":""},{"word":"","reading":"","note":""},{"word":"","reading":"","note":""}]}`
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
    const savedWord = words.some((word) => word.japanese === selected.japanese && word.reading === selected.reading)
    if (savedWord) {
      setWords((current) => current.filter((word) => word.id !== selected.id))
      setNotice('已取消儲存單字')
      return
    }
    setWords((current) => [selected, ...current]); setNotice('已儲存單字')
  }

  return (
    <div className="app-shell">
      <main className="workspace">
        <div className="page-tools"><div className="brand"><span className="brand-mark"><BookOpen size={18} /></span><span>日文單字庫</span><span className="version-badge">v0.2</span></div><button className="icon-button" aria-label="開啟設定" onClick={() => setIsSettingsOpen(true)}><Settings size={19} /><span>設定</span></button></div>

        <section className="search-panel">
          <div className="search-row"><div className="search-input-wrap"><Search size={20} /><input value={query} onChange={(event) => setQuery(event.target.value)} onKeyDown={(event) => event.key === 'Enter' && translate()} placeholder="輸入日文單字或中文意思…" />{query ? <button className="clear-button" aria-label="清空文字框" onClick={() => setQuery('')}><X size={17} /></button> : <button className="paste-button" aria-label="貼上剪貼簿內容" onClick={pasteQuery}><ClipboardPaste size={17} /><span>貼上</span></button>}<button className={`mic-button ${isListening ? 'listening' : ''}`} aria-label="日語語音輸入" onClick={listen}><Mic size={19} /></button></div><button className="translate-button" onClick={translate} disabled={isSearching}>{isSearching ? <LoaderCircle className="spin" size={18} /> : <Sparkles size={18} />}翻譯</button></div>
          <div className="search-hint"><span><CircleHelp size={14} /> 可以輸入「食べる」或「吃」</span><span>支援日語語音輸入</span></div>
        </section>

        {notice && <div className={`notice ${isNoticeLeaving ? 'leaving' : ''}`}><span>{notice}</span><button onClick={() => setNotice('')} aria-label="關閉提示"><X size={15} /></button></div>}

        <div className="content-grid">
          <section className="library-section"><div className="section-heading"><div><h2>我的單字庫</h2></div><span className="result-count">{filteredWords.length} 個單字</span></div><div className="word-list">{filteredWords.map((word) => <button key={word.id} className={`word-row ${selected?.id === word.id ? 'active' : ''}`} onClick={() => setSelected(word)}><span className="word-japanese"><RubyText text={word.japanese} reading={word.reading} /></span><span className="word-meaning">{word.meaning}</span><span className="level">{word.level}</span><Volume2 className="row-audio" size={16} onClick={(event) => { event.stopPropagation(); speakJapanese(word.japanese) }} /></button>)}{filteredWords.length === 0 && <div className="empty-state"><Search size={24} /><p>單字庫裡還沒有這個詞</p><span>按下翻譯，讓 Gemini 幫你查詢</span></div>}</div></section>

          {selected && <section className="detail-section"><div className="detail-topline"><span>單字卡</span><button className={`save-button ${words.some((word) => word.id === selected.id) ? 'saved' : ''}`} onClick={saveWord}><Bookmark size={17} fill={words.some((word) => word.id === selected.id) ? 'currentColor' : 'none'} />{words.some((word) => word.id === selected.id) ? '已儲存單字' : '儲存單字'}</button></div><div className="detail-title"><div><div className="word-title-line"><h2><RubyText text={selected.japanese} reading={selected.reading} /></h2><button className="audio-button" aria-label="播放日文單字" title="播放日文單字" onClick={() => speakJapanese(selected.japanese)}><Volume2 size={19} /></button></div><p>{selected.meaning}</p><span className="part-of-speech">{selected.partOfSpeech}</span></div><span className="large-level">{selected.level}</span></div><div className="detail-block example-block"><div className="block-label"><span>例句</span></div>{selected.examples.map((example, index) => <div className="example-item" key={`${example.japanese}-${index}`}><p className="example-japanese"><RubyText text={example.japanese} reading={example.reading} /></p><p className="example-translation">{example.translation}</p></div>)}</div><div className="detail-block"><div className="block-label"><span>常見搭配詞</span></div><div className="related-list">{selected.collocations.map((item) => <div className="related-item" key={item.word}><strong><RubyText text={item.word} reading={item.reading} /></strong><span>{item.meaning}</span></div>)}</div></div><div className="detail-block"><div className="block-label"><span>相關詞比較</span></div><div className="related-list">{selected.related.map((item) => <div className="related-item" key={item.word}><strong><RubyText text={item.word} reading={item.reading} /></strong><span>{item.note}</span></div>)}</div></div></section>}
        </div>
      </main>

      <footer><span>2026/09/08&nbsp; | &nbsp;Copyright © 2026 Andy Chiang</span><a href="https://github.com/AndyChiangSH/Kotoba-Base" target="_blank" rel="noreferrer">GitHub <ExternalLink size={13} /></a></footer>

      {isSettingsOpen && <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && setIsSettingsOpen(false)}><section className="settings-modal" role="dialog" aria-modal="true"><div className="modal-header"><div><h2>設定</h2></div><button className="close-button" onClick={() => setIsSettingsOpen(false)} aria-label="關閉設定"><X size={19} /></button></div><label className="field-label">Gemini API Key<a href="https://aistudio.google.com/apikey" target="_blank" rel="noreferrer">Google AI Studio <ExternalLink size={13} /></a></label><input className="text-field" type="password" value={settings.apiKey} onChange={(event) => setSettings({ ...settings, apiKey: event.target.value })} placeholder="貼上你的 API Key" /><p className="field-help">API Key 只會儲存在這個瀏覽器，不會上傳到 Kotoba Base。</p><label className="field-label">Gemini 模型</label><select className="text-field" value={settings.model} onChange={(event) => setSettings({ ...settings, model: event.target.value })}>{models.map((model) => <option key={model}>{model}</option>)}</select><label className="field-label">介面主題</label><div className="theme-options"><button className={settings.theme === 'light' ? 'selected' : ''} onClick={() => setSettings({ ...settings, theme: 'light' })}><Sun size={17} />淺色{settings.theme === 'light' && <Check size={15} />}</button><button className={settings.theme === 'dark' ? 'selected' : ''} onClick={() => setSettings({ ...settings, theme: 'dark' })}><Moon size={17} />深色{settings.theme === 'dark' && <Check size={15} />}</button></div><button className="done-button" onClick={() => setIsSettingsOpen(false)}>完成</button></section></div>}
    </div>
  )
}

declare global { interface Window { webkitSpeechRecognition: new () => SpeechRecognition } interface SpeechRecognition { lang: string; interimResults: boolean; onresult: (event: SpeechRecognitionEvent) => void; onend: () => void; onerror: () => void; start: () => void } }

export default App
