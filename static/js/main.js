/**
 * Official Google Gemini Chatbot UI Engine
 * Personal Assistant logic with model popovers, copy buttons & capability presets
 */

document.addEventListener('DOMContentLoaded', () => {
    // --- Application State ---
    const state = {
        models: [],
        currentModel: 'gemini-3.6-flash',
        history: [], // [{ role: 'user'|'model', content: string }]
        isConfigured: false,
        isGenerating: false
    };

    // Category Prompt Templates
    const CATEGORY_PROMPTS = {
        learning: "Explain the fundamentals of Quantum Computing in clear, step-by-step detail with real-world analogies.",
        coding: "Write a clean, production-ready Python Flask endpoint with JWT authentication and line-by-line comments.",
        assessment: "Create a 5-question multiple choice quiz on Web Security with answer key and explanations.",
        creating: "Draft a creative presentation structure and content outline including slide visuals, PPT structure, PDF document summary, and image concept descriptions for [Topic].",
        techdev: "Design a scalable cloud microservices architecture for real-time high-concurrency applications."
    };

    // --- DOM Elements ---
    const elements = {
        // Layout Controls
        appLayout: document.getElementById('appLayout'),
        sidebar: document.getElementById('sidebar'),
        sidebarToggleBtn: document.getElementById('sidebarToggleBtn'),
        mobileMenuToggle: document.getElementById('mobileMenuToggle'),
        newChatBtn: document.getElementById('newChatBtn'),

        // Model Selector Dropdown
        modelPillBtn: document.getElementById('modelPillBtn'),
        headerModelLabel: document.getElementById('headerModelLabel'),
        modelDropdown: document.getElementById('modelDropdown'),
        modelOptionsList: document.getElementById('modelOptionsList'),

        // Header Actions
        headerClearChatBtn: document.getElementById('headerClearChatBtn'),

        // Viewport & Messages
        chatViewport: document.getElementById('chatViewport'),
        greetingHero: document.getElementById('greetingHero'),
        messagesContainer: document.getElementById('messagesContainer'),
        thinkingIndicator: document.getElementById('thinkingIndicator'),

        // Input Capsule & + Menu
        chatTextarea: document.getElementById('chatTextarea'),
        sendActionBtn: document.getElementById('sendActionBtn'),
        plusBtn: document.getElementById('plusBtn'),
        plusPopupMenu: document.getElementById('plusPopupMenu'),
        popAttachFile: document.getElementById('popAttachFile'),
        popInsertCode: document.getElementById('popInsertCode'),
        popClearChat: document.getElementById('popClearChat'),
        hiddenFileInput: document.getElementById('hiddenFileInput'),

        // Status Elements
        statusDot: document.getElementById('statusDot'),
        statusText: document.getElementById('statusText')
    };

    // --- Setup Marked Options ---
    if (window.marked) {
        window.marked.setOptions({
            highlight: function(code, lang) {
                if (window.hljs && lang && window.hljs.getLanguage(lang)) {
                    return window.hljs.highlight(code, { language: lang }).value;
                }
                return window.hljs ? window.hljs.highlightAuto(code).value : code;
            },
            breaks: true
        });
    }

    // Initialize
    init();

    async function init() {
        setupEventListeners();
        await fetchModelsAndStatus();
    }

    // --- Fetch Models & API Status ---
    async function fetchModelsAndStatus() {
        try {
            const res = await fetch('/api/models');
            const data = await res.json();
            
            state.models = data.models || [];
            state.isConfigured = data.is_configured;

            updateStatusUI(state.isConfigured);
            renderModelDropdownOptions();
        } catch (err) {
            console.error('Error fetching model configuration:', err);
            updateStatusUI(false);
        }
    }

    function updateStatusUI(isConfigured) {
        if (isConfigured) {
            if (elements.statusDot) elements.statusDot.style.backgroundColor = '#38A169';
            if (elements.statusText) elements.statusText.textContent = 'API Key Active';
        } else {
            if (elements.statusDot) elements.statusDot.style.backgroundColor = '#E53E3E';
            if (elements.statusText) elements.statusText.textContent = 'Key Required';
        }
    }

    function renderModelDropdownOptions() {
        elements.modelOptionsList.innerHTML = '';
        
        state.models.forEach(model => {
            const isSelected = model.id === state.currentModel;
            const item = document.createElement('div');
            item.className = `model-opt-item ${isSelected ? 'selected' : ''}`;
            item.dataset.modelId = model.id;

            item.innerHTML = `
                <div class="model-opt-text">
                    <span class="model-opt-title">${model.name}</span>
                    <span class="model-opt-desc">${model.description}</span>
                </div>
                <i class="fa-solid fa-check model-check-icon"></i>
            `;

            item.addEventListener('click', () => selectModel(model.id));
            elements.modelOptionsList.appendChild(item);
        });

        updateHeaderModelPillLabel();
    }

    function selectModel(modelId) {
        state.currentModel = modelId;
        
        document.querySelectorAll('.model-opt-item').forEach(opt => {
            opt.classList.toggle('selected', opt.dataset.modelId === modelId);
        });

        updateHeaderModelPillLabel();
        elements.modelDropdown.classList.add('hidden');
    }

    function updateHeaderModelPillLabel() {
        const activeModel = state.models.find(m => m.id === state.currentModel);
        const name = activeModel ? activeModel.name : 'Gemini 3.6 Flash';
        elements.headerModelLabel.textContent = name;
    }

    // --- Event Listeners ---
    function setupEventListeners() {
        // Collapsible Sidebar Toggles
        elements.sidebarToggleBtn?.addEventListener('click', () => {
            elements.appLayout.classList.toggle('sidebar-collapsed');
        });

        elements.mobileMenuToggle?.addEventListener('click', () => {
            elements.appLayout.classList.toggle('mobile-sidebar-open');
        });

        // New Chat & Clear Session
        elements.newChatBtn?.addEventListener('click', resetChatSession);
        elements.headerClearChatBtn?.addEventListener('click', resetChatSession);

        // Model Selector Dropdown Popover
        elements.modelPillBtn?.addEventListener('click', (e) => {
            e.stopPropagation();
            elements.modelDropdown.classList.toggle('hidden');
        });

        document.addEventListener('click', (e) => {
            if (!elements.modelDropdown.contains(e.target) && e.target !== elements.modelPillBtn) {
                elements.modelDropdown.classList.add('hidden');
            }
            if (!elements.plusPopupMenu.contains(e.target) && e.target !== elements.plusBtn) {
                elements.plusPopupMenu.classList.add('hidden');
            }
        });

        // + Action Button Popover Menu
        elements.plusBtn?.addEventListener('click', (e) => {
            e.stopPropagation();
            elements.plusPopupMenu.classList.toggle('hidden');
        });

        elements.popAttachFile?.addEventListener('click', () => {
            elements.hiddenFileInput.click();
            elements.plusPopupMenu.classList.add('hidden');
        });

        elements.hiddenFileInput?.addEventListener('change', handleFileAttachment);

        elements.popInsertCode?.addEventListener('click', () => {
            elements.chatTextarea.value += "\n```python\n# Write your code here\n\n```\n";
            autoResizeTextarea();
            elements.chatTextarea.focus();
            elements.plusPopupMenu.classList.add('hidden');
        });

        elements.popClearChat?.addEventListener('click', () => {
            resetChatSession();
            elements.plusPopupMenu.classList.add('hidden');
        });

        // Input Field Handling
        elements.chatTextarea.addEventListener('input', autoResizeTextarea);
        elements.chatTextarea.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        });

        elements.sendActionBtn.addEventListener('click', sendMessage);

        // Capability Cards & Sidebar Menu Items
        document.querySelectorAll('.cap-card').forEach(card => {
            card.addEventListener('click', () => {
                const prompt = card.dataset.prompt;
                if (prompt) {
                    elements.chatTextarea.value = prompt;
                    sendMessage();
                }
            });
        });

        document.querySelectorAll('.category-item').forEach(item => {
            item.addEventListener('click', () => {
                const cat = item.dataset.category;
                if (CATEGORY_PROMPTS[cat]) {
                    elements.chatTextarea.value = CATEGORY_PROMPTS[cat];
                    autoResizeTextarea();
                    elements.chatTextarea.focus();
                }
            });
        });
    }

    // --- Messaging & Gemini API Logic ---
    async function sendMessage() {
        const text = elements.chatTextarea.value.trim();
        if (!text || state.isGenerating) return;

        // Hide Hero Greeting
        elements.greetingHero.classList.add('hidden');

        // Render User Bubble
        renderUserMessage(text);
        state.history.push({ role: 'user', content: text });

        // Reset Textarea
        elements.chatTextarea.value = '';
        autoResizeTextarea();

        // Show Thinking Indicator
        setThinkingState(true);

        try {
            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: text,
                    model: state.currentModel,
                    history: state.history.slice(-10)
                })
            });

            const data = await res.json();
            setThinkingState(false);

            if (data.success) {
                const reply = data.reply;
                renderAssistantResponse(reply, data.model_used || state.currentModel);
                state.history.push({ role: 'model', content: reply });
            } else {
                const errText = data.error || 'Failed to connect to Gemini API.';
                renderAssistantResponse(`⚠️ **Error**: ${errText}`, 'System');
            }

        } catch (err) {
            setThinkingState(false);
            console.error('Chat API Error:', err);
            renderAssistantResponse('⚠️ **Network Error**: Unable to reach backend server. Please verify `python app.py` is running.', 'System');
        }
    }

    function renderUserMessage(text) {
        const row = document.createElement('div');
        row.className = 'message-row user';

        row.innerHTML = `
            <div class="message-body">
                <div class="user-bubble">${escapeHtml(text).replace(/\n/g, '<br>')}</div>
            </div>
        `;

        elements.messagesContainer.appendChild(row);
        scrollToBottom();
    }

    function renderAssistantResponse(content, modelUsed) {
        const row = document.createElement('div');
        row.className = 'message-row assistant';

        let formattedMarkdown = content;
        if (window.marked) {
            formattedMarkdown = window.marked.parse(content);
        } else {
            formattedMarkdown = `<p>${escapeHtml(content).replace(/\n/g, '<br>')}</p>`;
        }

        row.innerHTML = `
            <div class="sparkle-avatar">
                <i class="fa-solid fa-sparkles"></i>
            </div>
            <div class="message-body">
                <div class="assistant-content">
                    ${formattedMarkdown}
                </div>
                <div class="response-actions">
                    <button class="action-btn-sm copy-response-btn" title="Copy text">
                        <i class="fa-regular fa-copy"></i> Copy
                    </button>
                    <button class="action-btn-sm retry-btn" title="Retry response">
                        <i class="fa-solid fa-arrow-rotate-right"></i> Retry
                    </button>
                    <span class="model-used-tag">${modelUsed}</span>
                </div>
            </div>
        `;

        // Wrap code blocks with Copy Code button
        row.querySelectorAll('pre').forEach(pre => {
            const container = document.createElement('div');
            container.className = 'code-container';

            const header = document.createElement('div');
            header.className = 'code-header';
            header.innerHTML = `
                <span>code</span>
                <button class="copy-code-btn"><i class="fa-regular fa-copy"></i> Copy code</button>
            `;

            const codeEl = pre.querySelector('code');
            const codeText = codeEl ? codeEl.innerText : pre.innerText;

            header.querySelector('.copy-code-btn').addEventListener('click', () => {
                navigator.clipboard.writeText(codeText);
                header.querySelector('.copy-code-btn').innerHTML = '<i class="fa-solid fa-check"></i> Copied!';
                setTimeout(() => {
                    header.querySelector('.copy-code-btn').innerHTML = '<i class="fa-regular fa-copy"></i> Copy code';
                }, 2000);
            });

            pre.parentNode.insertBefore(container, pre);
            container.appendChild(header);
            container.appendChild(pre);

            if (window.hljs && codeEl) {
                window.hljs.highlightElement(codeEl);
            }
        });

        // Response level copy button
        row.querySelector('.copy-response-btn')?.addEventListener('click', () => {
            navigator.clipboard.writeText(content);
            const btn = row.querySelector('.copy-response-btn');
            btn.innerHTML = '<i class="fa-solid fa-check"></i> Copied';
            setTimeout(() => {
                btn.innerHTML = '<i class="fa-regular fa-copy"></i> Copy';
            }, 2000);
        });

        // Retry button
        row.querySelector('.retry-btn')?.addEventListener('click', () => {
            const lastUserMsg = [...state.history].reverse().find(m => m.role === 'user');
            if (lastUserMsg) {
                elements.chatTextarea.value = lastUserMsg.content;
                sendMessage();
            }
        });

        elements.messagesContainer.appendChild(row);
        scrollToBottom();
    }

    function setThinkingState(isThinking) {
        state.isGenerating = isThinking;
        if (isThinking) {
            elements.thinkingIndicator.classList.remove('hidden');
            scrollToBottom();
        } else {
            elements.thinkingIndicator.classList.add('hidden');
        }
    }

    function resetChatSession() {
        state.history = [];
        elements.messagesContainer.innerHTML = '';
        elements.greetingHero.classList.remove('hidden');
        elements.chatTextarea.value = '';
        autoResizeTextarea();
    }

    function handleFileAttachment(e) {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const content = event.target.result;
            elements.chatTextarea.value += `\n--- Attached Document: ${file.name} ---\n${content}\n`;
            autoResizeTextarea();
            elements.chatTextarea.focus();
        };
        reader.readAsText(file);
    }

    // --- Helpers ---
    function autoResizeTextarea() {
        elements.chatTextarea.style.height = 'auto';
        elements.chatTextarea.style.height = Math.min(elements.chatTextarea.scrollHeight, 140) + 'px';
    }

    function scrollToBottom() {
        elements.chatViewport.scrollTop = elements.chatViewport.scrollHeight;
    }

    function escapeHtml(str) {
        return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }
});
