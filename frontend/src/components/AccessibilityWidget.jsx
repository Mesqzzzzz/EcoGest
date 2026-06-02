import React, { useState, useEffect } from 'react';
import { 
  Accessibility, Type, Eye, RotateCcw, X, Check, MousePointer, Palette, Activity, Info
} from 'lucide-react';

const COLORBLIND_MODES = [
  { id: 'none', label: 'Desativado' },
  { id: 'protanopia', label: 'Protanopia (Sem Vermelho)' },
  { id: 'deuteranopia', label: 'Deuteranopia (Sem Verde)' },
  { id: 'tritanopia', label: 'Tritanopia (Sem Azul)' },
  { id: 'grayscale', label: 'Monocromático (Preto e Branco)' }
];

const FONT_SIZES = [
  { id: 'normal', label: '100% (Normal)' },
  { id: 'medium', label: '115% (Médio)' },
  { id: 'large', label: '130% (Grande)' },
  { id: 'xl', label: '150% (Extra)' }
];

const DEFAULT_SETTINGS = {
  fontSize: 'normal',
  dyslexic: false,
  spacing: false,
  underlineLinks: false,
  colorblindMode: 'none',
  highContrast: false,
  invertColors: false,
  readingGuide: false,
  largeCursor: false,
  noAnimations: false
};

export default function AccessibilityWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [settings, setSettings] = useState(() => {
    try {
      const saved = localStorage.getItem('ecogest_accessibility');
      return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  // Save settings and apply them to the root DOM
  useEffect(() => {
    localStorage.setItem('ecogest_accessibility', JSON.stringify(settings));
    
    const root = document.documentElement;

    // 1. Font Size
    root.classList.remove('accessibility-font-md', 'accessibility-font-lg', 'accessibility-font-xl');
    if (settings.fontSize === 'medium') root.classList.add('accessibility-font-md');
    else if (settings.fontSize === 'large') root.classList.add('accessibility-font-lg');
    else if (settings.fontSize === 'xl') root.classList.add('accessibility-font-xl');

    // Apply inline style for html scaling as backup/completive zoom
    if (settings.fontSize === 'normal') root.style.fontSize = '';
    else if (settings.fontSize === 'medium') root.style.fontSize = '115%';
    else if (settings.fontSize === 'large') root.style.fontSize = '130%';
    else if (settings.fontSize === 'xl') root.style.fontSize = '150%';

    // 2. Dyslexic Font
    if (settings.dyslexic) root.classList.add('accessibility-dyslexic');
    else root.classList.remove('accessibility-dyslexic');

    // 3. Word/Letter Spacing
    if (settings.spacing) root.classList.add('accessibility-spacing');
    else root.classList.remove('accessibility-spacing');

    // 4. Underline Links
    if (settings.underlineLinks) root.classList.add('accessibility-underline-links');
    else root.classList.remove('accessibility-underline-links');

    // 5. High Contrast
    if (settings.highContrast) root.classList.add('accessibility-high-contrast');
    else root.classList.remove('accessibility-high-contrast');

    // 6. Invert Colors
    if (settings.invertColors) root.classList.add('accessibility-invert-colors');
    else root.classList.remove('accessibility-invert-colors');

    // 7. Large Cursor
    if (settings.largeCursor) root.classList.add('accessibility-large-cursor');
    else root.classList.remove('accessibility-large-cursor');

    // 8. Disable Animations
    if (settings.noAnimations) root.classList.add('accessibility-no-animations');
    else root.classList.remove('accessibility-no-animations');

    // 9. Colorblind modes
    root.classList.remove('accessibility-protanopia', 'accessibility-deuteranopia', 'accessibility-tritanopia', 'accessibility-achromatopsia');
    if (settings.colorblindMode === 'protanopia') root.classList.add('accessibility-protanopia');
    else if (settings.colorblindMode === 'deuteranopia') root.classList.add('accessibility-deuteranopia');
    else if (settings.colorblindMode === 'tritanopia') root.classList.add('accessibility-tritanopia');
    else if (settings.colorblindMode === 'grayscale') root.classList.add('accessibility-achromatopsia');

  }, [settings]);

  // Handle reading guide mousemove positioning
  useEffect(() => {
    if (!settings.readingGuide) return;
    
    const handleMouseMove = (e) => {
      document.documentElement.style.setProperty('--reading-guide-y', `${e.clientY - 12}px`);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [settings.readingGuide]);

  const updateSetting = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const resetSettings = () => {
    setSettings(DEFAULT_SETTINGS);
  };

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end">
      {/* SVG Colorblind Filters Injection */}
      <svg style={{ position: 'absolute', width: 0, height: 0 }} aria-hidden="true">
        <defs>
          {/* Protanopia (red-weakness) */}
          <filter id="protanopia-filter">
            <feColorMatrix type="matrix" values="0.567, 0.433, 0, 0, 0, 0.558, 0.442, 0, 0, 0, 0, 0.242, 0.758, 0, 0, 0, 0, 0, 1, 0" />
          </filter>
          {/* Deuteranopia (green-weakness) */}
          <filter id="deuteranopia-filter">
            <feColorMatrix type="matrix" values="0.625, 0.375, 0, 0, 0, 0.7, 0.3, 0, 0, 0, 0, 0.3, 0.7, 0, 0, 0, 0, 0, 1, 0" />
          </filter>
          {/* Tritanopia (blue-weakness) */}
          <filter id="tritanopia-filter">
            <feColorMatrix type="matrix" values="0.95, 0.05,  0, 0, 0, 0,  0.433, 0.567, 0, 0, 0,  0.475, 0.525, 0, 0, 0,  0, 0, 1, 0" />
          </filter>
        </defs>
      </svg>

      {/* Reading Guide Ruler */}
      {settings.readingGuide && (
        <div 
          className="fixed left-0 right-0 h-6 bg-amber-400/25 border-y border-amber-400/40 pointer-events-none z-[9998] shadow-[0_0_15px_rgba(251,191,36,0.15)]"
          style={{
            top: 0,
            transform: 'translateY(var(--reading-guide-y, -100px))',
          }}
        />
      )}

      {/* Access widget main modal */}
      {isOpen && (
        <div className="absolute bottom-20 right-0 w-[420px] max-w-[calc(100vw-2rem)] rounded-3xl bg-white/95 backdrop-blur-xl border border-slate-200/60 shadow-2xl p-6 flex flex-col gap-6 animate-scale-in text-slate-800">
          
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="bg-emerald-100 text-emerald-700 p-2 rounded-xl">
                <Accessibility className="w-6 h-6 acc-icon" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-slate-800">Definições de Acessibilidade</h3>
                <p className="text-xs text-slate-500 font-medium">Ajuste o EcoGest às suas necessidades</p>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition"
              aria-label="Fechar painel de acessibilidade"
            >
              <X className="w-5 h-5 acc-icon" />
            </button>
          </div>

          {/* Panel Sections (Scrollable content) */}
          <div className="flex-1 overflow-y-auto max-h-[60vh] pr-1 space-y-6">
            
            {/* Section 1: Text & Layout */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <Type className="w-4 h-4 text-slate-400 acc-icon" /> Tipografia & Leitura
              </h4>
              
              <div className="space-y-3.5 bg-slate-50/70 border border-slate-100 rounded-2xl p-4">
                {/* Font Scaling Select */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-600">Tamanho da Letra (Zoom)</label>
                  <div className="grid grid-cols-4 gap-1.5 bg-slate-200/50 p-1 rounded-xl">
                    {FONT_SIZES.map(size => (
                      <button
                        key={size.id}
                        onClick={() => updateSetting('fontSize', size.id)}
                        className={`text-xs py-1.5 rounded-lg font-medium transition-all ${
                          settings.fontSize === size.id
                            ? 'bg-white text-emerald-700 shadow-sm font-semibold'
                            : 'text-slate-600 hover:bg-white/40'
                        }`}
                      >
                        {size.label.split(' ')[0]}
                      </button>
                    ))}
                  </div>
                </div>

                <hr className="border-slate-100" />

                {/* Dyslexia Mode Toggle */}
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-slate-700">Fonte para Dislexia</span>
                    <span className="text-xs text-slate-500">Aplica a fonte legível OpenDyslexic</span>
                  </div>
                  <button
                    onClick={() => updateSetting('dyslexic', !settings.dyslexic)}
                    className={`w-11 h-6 flex items-center rounded-full p-0.5 transition-colors duration-300 ease-in-out ${
                      settings.dyslexic ? 'bg-emerald-600' : 'bg-slate-300'
                    }`}
                  >
                    <span className={`bg-white w-5 h-5 rounded-full shadow-md transform transition-transform duration-300 ease-in-out ${
                      settings.dyslexic ? 'translate-x-5' : 'translate-x-0'
                    }`} />
                  </button>
                </div>

                <hr className="border-slate-100" />

                {/* Spacing Toggle */}
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-slate-700">Espaçamento Aumentado</span>
                    <span className="text-xs text-slate-500">Mais espaço entre letras, palavras e linhas</span>
                  </div>
                  <button
                    onClick={() => updateSetting('spacing', !settings.spacing)}
                    className={`w-11 h-6 flex items-center rounded-full p-0.5 transition-colors duration-300 ease-in-out ${
                      settings.spacing ? 'bg-emerald-600' : 'bg-slate-300'
                    }`}
                  >
                    <span className={`bg-white w-5 h-5 rounded-full shadow-md transform transition-transform duration-300 ease-in-out ${
                      settings.spacing ? 'translate-x-5' : 'translate-x-0'
                    }`} />
                  </button>
                </div>

                <hr className="border-slate-100" />

                {/* Links Highlight Toggle */}
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-slate-700">Destacar Links</span>
                    <span className="text-xs text-slate-500">Sublinha e realça todas as hiperligações</span>
                  </div>
                  <button
                    onClick={() => updateSetting('underlineLinks', !settings.underlineLinks)}
                    className={`w-11 h-6 flex items-center rounded-full p-0.5 transition-colors duration-300 ease-in-out ${
                      settings.underlineLinks ? 'bg-emerald-600' : 'bg-slate-300'
                    }`}
                  >
                    <span className={`bg-white w-5 h-5 rounded-full shadow-md transform transition-transform duration-300 ease-in-out ${
                      settings.underlineLinks ? 'translate-x-5' : 'translate-x-0'
                    }`} />
                  </button>
                </div>
              </div>
            </div>

            {/* Section 2: Colors & Contrast */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <Palette className="w-4 h-4 text-slate-400 acc-icon" /> Cores & Contraste
              </h4>

              <div className="space-y-3.5 bg-slate-50/70 border border-slate-100 rounded-2xl p-4">
                {/* Colorblind Selector */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-600">Simulador de Daltonismo</label>
                  <select
                    value={settings.colorblindMode}
                    onChange={(e) => updateSetting('colorblindMode', e.target.value)}
                    className="w-full bg-white border border-slate-200 text-sm rounded-xl py-2 px-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-700 font-medium transition"
                  >
                    {COLORBLIND_MODES.map(mode => (
                      <option key={mode.id} value={mode.id}>
                        {mode.label}
                      </option>
                    ))}
                  </select>
                </div>

                <hr className="border-slate-100" />

                {/* High Contrast Toggle */}
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-slate-700">Aumentar Contraste</span>
                    <span className="text-xs text-slate-500">Intensifica as cores e contornos</span>
                  </div>
                  <button
                    onClick={() => updateSetting('highContrast', !settings.highContrast)}
                    className={`w-11 h-6 flex items-center rounded-full p-0.5 transition-colors duration-300 ease-in-out ${
                      settings.highContrast ? 'bg-emerald-600' : 'bg-slate-300'
                    }`}
                  >
                    <span className={`bg-white w-5 h-5 rounded-full shadow-md transform transition-transform duration-300 ease-in-out ${
                      settings.highContrast ? 'translate-x-5' : 'translate-x-0'
                    }`} />
                  </button>
                </div>

                <hr className="border-slate-100" />

                {/* Invert Colors Toggle */}
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-slate-700">Inverter Cores</span>
                    <span className="text-xs text-slate-500">Inverte as cores preservando imagens</span>
                  </div>
                  <button
                    onClick={() => updateSetting('invertColors', !settings.invertColors)}
                    className={`w-11 h-6 flex items-center rounded-full p-0.5 transition-colors duration-300 ease-in-out ${
                      settings.invertColors ? 'bg-emerald-600' : 'bg-slate-300'
                    }`}
                  >
                    <span className={`bg-white w-5 h-5 rounded-full shadow-md transform transition-transform duration-300 ease-in-out ${
                      settings.invertColors ? 'translate-x-5' : 'translate-x-0'
                    }`} />
                  </button>
                </div>
              </div>
            </div>

            {/* Section 3: Navigation & Aids */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <Activity className="w-4 h-4 text-slate-400 acc-icon" /> Foco & Navegação
              </h4>

              <div className="space-y-3.5 bg-slate-50/70 border border-slate-100 rounded-2xl p-4">
                {/* Reading Guide Toggle */}
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-slate-700">Régua de Leitura</span>
                    <span className="text-xs text-slate-500">Barra horizontal que acompanha o rato</span>
                  </div>
                  <button
                    onClick={() => updateSetting('readingGuide', !settings.readingGuide)}
                    className={`w-11 h-6 flex items-center rounded-full p-0.5 transition-colors duration-300 ease-in-out ${
                      settings.readingGuide ? 'bg-emerald-600' : 'bg-slate-300'
                    }`}
                  >
                    <span className={`bg-white w-5 h-5 rounded-full shadow-md transform transition-transform duration-300 ease-in-out ${
                      settings.readingGuide ? 'translate-x-5' : 'translate-x-0'
                    }`} />
                  </button>
                </div>

                <hr className="border-slate-100" />

                {/* Large Cursor Toggle */}
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-slate-700">Cursor Grande</span>
                    <span className="text-xs text-slate-500">Usa uma seta de alta visibilidade</span>
                  </div>
                  <button
                    onClick={() => updateSetting('largeCursor', !settings.largeCursor)}
                    className={`w-11 h-6 flex items-center rounded-full p-0.5 transition-colors duration-300 ease-in-out ${
                      settings.largeCursor ? 'bg-emerald-600' : 'bg-slate-300'
                    }`}
                  >
                    <span className={`bg-white w-5 h-5 rounded-full shadow-md transform transition-transform duration-300 ease-in-out ${
                      settings.largeCursor ? 'translate-x-5' : 'translate-x-0'
                    }`} />
                  </button>
                </div>

                <hr className="border-slate-100" />

                {/* Stop Animations Toggle */}
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-slate-700">Pausar Animações</span>
                    <span className="text-xs text-slate-500">Evita cansaço visual e tonturas</span>
                  </div>
                  <button
                    onClick={() => updateSetting('noAnimations', !settings.noAnimations)}
                    className={`w-11 h-6 flex items-center rounded-full p-0.5 transition-colors duration-300 ease-in-out ${
                      settings.noAnimations ? 'bg-emerald-600' : 'bg-slate-300'
                    }`}
                  >
                    <span className={`bg-white w-5 h-5 rounded-full shadow-md transform transition-transform duration-300 ease-in-out ${
                      settings.noAnimations ? 'translate-x-5' : 'translate-x-0'
                    }`} />
                  </button>
                </div>
              </div>
            </div>

          </div>

          {/* Footer with Info and Reset */}
          <div className="flex items-center justify-between border-t border-slate-100 pt-4 mt-2">
            <span className="text-[10px] font-medium text-slate-400 flex items-center gap-1">
              <Info className="w-3.5 h-3.5 acc-icon" /> Definições aplicadas globalmente
            </span>
            <button
              onClick={resetSettings}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-3 py-1.5 rounded-xl transition"
            >
              <RotateCcw className="w-3.5 h-3.5 acc-icon" /> Restaurar Padrões
            </button>
          </div>

        </div>
      )}

      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-full p-4 shadow-xl hover:scale-110 active:scale-95 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-emerald-500/30 group animate-pulse-ring"
        aria-label={isOpen ? "Fechar painel de acessibilidade" : "Abrir painel de acessibilidade"}
        title="Opções de Acessibilidade"
      >
        <Accessibility className="w-6 h-6 transform group-hover:rotate-12 transition-transform duration-300 acc-icon" />
      </button>
    </div>
  );
}
