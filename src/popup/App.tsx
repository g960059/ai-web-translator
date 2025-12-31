import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';

// Simple Icons
const SettingsIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3"></circle>
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
    </svg>
);

const BackIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="19" y1="12" x2="5" y2="12"></line>
        <polyline points="12 19 5 12 12 5"></polyline>
    </svg>
);

// Type definitions
type OpenRouterModels = Record<string, any>;

const App = () => {
    const [apiKey, setApiKey] = useState('');
    const [model, setModel] = useState('openai/gpt-3.5-turbo');
    const [translationMode, setTranslationMode] = useState('quality');
    const [translationScope, setTranslationScope] = useState('page');
    const [status, setStatus] = useState('');
    const [view, setView] = useState<'main' | 'settings'>('main');

    const [stats, setStats] = useState<any>(null);
    const [analyzing, setAnalyzing] = useState(false);
    const [progress, setProgress] = useState(0);
    const [isTranslating, setIsTranslating] = useState(false);
    const [modelPricing, setModelPricing] = useState<OpenRouterModels>({});

    useEffect(() => {
        chrome.storage.local.get(['apiKey', 'model', 'cachedModels', 'cachedModelsTimestamp', 'translationMode', 'translationScope'], (result) => {
            if (result.apiKey) setApiKey(result.apiKey);
            if (result.model) setModel(result.model);
            if (result.translationMode) setTranslationMode(result.translationMode);
            if (result.translationScope) setTranslationScope(result.translationScope);
            if (!result.apiKey) setView('settings');

            // Model Pricing Cache Logic (24h)
            const now = Date.now();
            const ONE_DAY = 24 * 60 * 60 * 1000;

            if (result.cachedModels && result.cachedModelsTimestamp && (now - result.cachedModelsTimestamp < ONE_DAY)) {
                setModelPricing(result.cachedModels);
                const modelsMap: OpenRouterModels = {};
                result.cachedModels.forEach((m: any) => {
                    modelsMap[m.id] = m;
                });
                setModelPricing(modelsMap);
            } else {
                // Fetch fresh models
                fetch('https://openrouter.ai/api/v1/models')
                    .then(res => res.json())
                    .then(data => {
                        if (data && data.data) {
                            const modelsMap: OpenRouterModels = {};
                            data.data.forEach((m: any) => {
                                modelsMap[m.id] = m;
                            });
                            setModelPricing(modelsMap);
                            chrome.storage.local.set({
                                cachedModels: data.data,
                                cachedModelsTimestamp: now
                            });
                        }
                    })
                    .catch(err => console.error("Failed to fetch models", err));
            }
        });

        // Listen for messages
        const listener = (request: any) => {
            if (request.action === 'progress') {
                setProgress(request.percent);
                setStatus(request.percent < 100 ? 'Translating...' : 'Done');
            }
        };
        chrome.runtime.onMessage.addListener(listener);
        return () => chrome.runtime.onMessage.removeListener(listener);
    }, []);

    const saveSettings = () => {
        chrome.storage.local.set({ apiKey, model, translationMode, translationScope }, () => {
            setStatus('Settings saved');
            setTimeout(() => {
                setStatus('');
                if (apiKey) setView('main');
            }, 1000);
        });
    };

    const handleClearCache = async () => {
        if (confirm('Clear translation cache for this page?')) {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            if (tab.id) {
                // Send message to content script to clear relevant cache
                try {
                    const response = await chrome.tabs.sendMessage(tab.id, { action: 'clear_page_cache' });
                    if (response && response.success) {
                        setStatus('Page cache cleared');
                    } else {
                        setStatus('Failed (Refresh page first)');
                    }
                } catch (e) {
                    // Content script might not be injected
                    setStatus('Error: Refresh page');
                }
                setTimeout(() => setStatus(''), 2000);
            }
        }
    };

    const getCostEstimate = (charCount: number, currentModel: string) => {
        if (!charCount) return 0;

        // Estimate tokens: English roughly 0.5 tokens/char.
        const estInputTokens = Math.ceil(charCount / 2);
        // Assume output length is roughly similar
        const estOutputTokens = estInputTokens;

        // Try to find dynamic pricing
        const modelInfo = modelPricing[currentModel];

        let cost = 0;

        if (modelInfo && modelInfo.pricing) {
            // Pricing from API is per token (numerical string or number)
            const promptPrice = parseFloat(modelInfo.pricing.prompt) || 0;
            const completionPrice = parseFloat(modelInfo.pricing.completion) || 0;

            cost = (estInputTokens * promptPrice) + (estOutputTokens * completionPrice);
        } else {
            // Fallback Heuristics (Per Million Tokens)
            // These are combined input+output costs for 1M tokens each.
            let costPerTransactionUnit = 2.0; // Default for gpt-3.5-turbo, haiku (0.5 + 1.5)
            if (currentModel.includes('gpt-4o')) costPerTransactionUnit = 12.5; // Input 2.5 + Output 10
            else if (currentModel.includes('flash')) costPerTransactionUnit = 0.5; // Input 0.1 + Output 0.4

            // Heuristic assumes costPerTransactionUnit is for 1M input + 1M output.
            // So, if we have estInputTokens, we divide by 1M and multiply by the unit cost.
            // This implicitly assumes estInputTokens == estOutputTokens for the unit cost.
            cost = (estInputTokens / 1000000) * costPerTransactionUnit;
        }

        return cost;
    };

    const handleAnalyzeCost = async () => {
        setAnalyzing(true);
        setStats(null);

        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (tab.id) {
            chrome.tabs.sendMessage(tab.id, { action: 'get_stats' }, (response) => {
                setAnalyzing(false);
                if (chrome.runtime.lastError) {
                    setStats({ error: "Could not connect to page." });
                    return;
                }

                // Response: { nodeCount, quality: { charCount }, efficiency: { charCount } }
                if (response) {
                    const qualityEst = getCostEstimate(response.quality.charCount, model);
                    const efficiencyEst = getCostEstimate(response.efficiency.charCount, model);

                    setStats({
                        nodeCount: response.nodeCount,
                        quality: {
                            chars: response.quality.charCount,
                            usd: qualityEst
                        },
                        efficiency: {
                            chars: response.efficiency.charCount,
                            usd: efficiencyEst
                        },
                        savings: qualityEst > 0 ? ((1 - (efficiencyEst / qualityEst)) * 100).toFixed(1) : "0"
                    });
                }
            });
        } else {
            setAnalyzing(false);
        }
    };

    const handleTranslate = async () => {
        setIsTranslating(true);
        setProgress(0);
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (tab.id) {
            chrome.tabs.sendMessage(tab.id, { action: 'translate', translationMode: translationMode });
            // Close popup to let user see the in-page overlay
            window.close();
        }
    };

    if (view === 'settings') {
        return (
            <div style={{ width: '320px', padding: '16px', fontFamily: 'sans-serif' }}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
                    <button onClick={() => setView('main')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, marginRight: '10px' }}>
                        <BackIcon />
                    </button>
                    <h2 style={{ margin: 0, fontSize: '18px' }}>Settings</h2>
                </div>

                <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>OpenRouter API Key:</label>
                    <input
                        type="password"
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        style={{ width: '100%', padding: '8px', boxSizing: 'border-box', borderRadius: '4px', border: '1px solid #ccc' }}
                    />
                </div>

                <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Model:</label>
                    <input
                        type="text"
                        value={model}
                        onChange={(e) => setModel(e.target.value)}
                        placeholder="e.g. openai/gpt-3.5-turbo"
                        style={{ width: '100%', padding: '8px', boxSizing: 'border-box', borderRadius: '4px', border: '1px solid #ccc' }}
                    />
                </div>

                {/* Translation Mode Toggle */}
                <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Translation Mode:</label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                        <button
                            onClick={() => setTranslationMode('quality')}
                            style={{
                                padding: '8px', borderRadius: '4px', border: `1px solid ${translationMode === 'quality' ? '#007bff' : '#ccc'}`,
                                backgroundColor: translationMode === 'quality' ? '#e7f3ff' : '#fff',
                                color: translationMode === 'quality' ? '#007bff' : '#333',
                                cursor: 'pointer', fontSize: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center'
                            }}
                        >
                            <span style={{ fontWeight: 'bold' }}>Quality</span>
                            <span style={{ fontSize: '10px', opacity: 0.75 }}>Raw HTML</span>
                        </button>
                        <button
                            onClick={() => setTranslationMode('efficiency')}
                            style={{
                                padding: '8px', borderRadius: '4px', border: `1px solid ${translationMode === 'efficiency' ? '#28a745' : '#ccc'}`,
                                backgroundColor: translationMode === 'efficiency' ? '#e6ffe6' : '#fff',
                                color: translationMode === 'efficiency' ? '#28a745' : '#333',
                                cursor: 'pointer', fontSize: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center'
                            }}
                        >
                            <span style={{ fontWeight: 'bold' }}>Efficiency</span>
                            <span style={{ fontSize: '10px', opacity: 0.75 }}>Tag Minified</span>
                        </button>
                    </div>
                    <p style={{ fontSize: '10px', color: '#888', marginTop: '4px', lineHeight: '1.3' }}>
                        Efficiency mode minifies HTML tags to save tokens (~30-50%) while preserving design.
                    </p>
                </div>

                <button
                    onClick={saveSettings}
                    style={{ width: '100%', padding: '10px', marginBottom: '24px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                >
                    Save Settings
                </button>

                <hr style={{ border: 'none', borderTop: '1px solid #eee', margin: '20px 0' }} />

                <button
                    onClick={handleClearCache}
                    style={{ width: '100%', padding: '8px', backgroundColor: '#fff', color: '#d9534f', border: '1px solid #d9534f', borderRadius: '4px', cursor: 'pointer' }}
                >
                    Clear Cache for This Page
                </button>

                <hr style={{ border: 'none', borderTop: '1px solid #eee', margin: '20px 0' }} />

                <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Cost Analysis:</label>
                    <button
                        onClick={handleAnalyzeCost}
                        disabled={analyzing}
                        style={{ width: '100%', padding: '10px', marginBottom: '12px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                    >
                        {analyzing ? 'Analyzing...' : 'Analyze Page Cost'}
                    </button>

                    {stats && !stats.error && (
                        <div style={{ fontSize: '13px', backgroundColor: '#f8f9fa', padding: '12px', borderRadius: '8px', border: '1px solid #eee' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', paddingBottom: '8px', borderBottom: '1px solid #ddd' }}>
                                <span>Translatable Blocks:</span>
                                <strong>{stats.nodeCount}</strong>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px', borderRadius: '4px', backgroundColor: translationMode === 'quality' ? '#e7f3ff' : 'transparent' }}>
                                <div>
                                    <div style={{ fontWeight: 'bold', color: '#333' }}>Quality Mode</div>
                                    <div style={{ fontSize: '10px', color: '#666' }}>{stats.quality.chars.toLocaleString()} chars</div>
                                </div>
                                <div style={{ fontWeight: 'bold', color: '#333' }}>${stats.quality.usd.toFixed(6)}</div>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px', borderRadius: '4px', backgroundColor: translationMode === 'efficiency' ? '#e6ffe6' : 'transparent', marginTop: '4px' }}>
                                <div>
                                    <div style={{ fontWeight: 'bold', color: '#333' }}>Efficiency Mode</div>
                                    <div style={{ fontSize: '10px', color: '#666' }}>{stats.efficiency.chars.toLocaleString()} chars</div>
                                </div>
                                <div style={{ fontWeight: 'bold', color: '#28a745' }}>${stats.efficiency.usd.toFixed(6)}</div>
                            </div>

                            {parseFloat(stats.savings) > 0 && (
                                <div style={{ textAlign: 'center', backgroundColor: '#d4edda', color: '#155724', borderRadius: '4px', padding: '4px', marginTop: '8px', fontWeight: 'bold', fontSize: '10px' }}>
                                    Efficiency saves {stats.savings}%
                                </div>
                            )}

                            <div style={{ fontSize: '9px', textAlign: 'right', color: '#888', paddingTop: '8px' }}>
                                Est. based on current model pricing
                            </div>
                        </div>
                    )}
                    {stats && stats.error && (
                        <div style={{ fontSize: '12px', color: 'red', backgroundColor: '#ffe6e6', padding: '8px', borderRadius: '4px' }}>{stats.error}</div>
                    )}
                </div>

                {status && <div style={{ color: status.includes('Failed') || status.includes('Error') ? 'red' : 'green', marginTop: '16px', textAlign: 'center' }}>{status}</div>}
            </div>
        );
    }

    // Main View
    return (
        <div style={{ width: '320px', padding: '16px', fontFamily: 'sans-serif' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ margin: 0, fontSize: '18px' }}>AI Web Translator</h2>
                <button onClick={() => setView('settings')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#666' }}>
                    <SettingsIcon />
                </button>
            </div>

            {/* Action Section */}
            <button
                onClick={handleTranslate}
                style={{
                    width: '100%',
                    padding: '14px',
                    backgroundColor: '#28a745',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    fontSize: '16px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}
            >
                START TRANSLATION
            </button>

            <p style={{ fontSize: '12px', color: '#888', textAlign: 'center', marginTop: '12px' }}>
                Progress will be shown on the page.
            </p>
        </div>
    );
};

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>,
);
