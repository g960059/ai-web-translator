
export class TranslationOverlay {
    private shadowRoot: ShadowRoot | null = null;
    private container: HTMLElement | null = null;
    private progressBar: HTMLElement | null = null;
    private statusText: HTMLElement | null = null;
    private resumeBtn: HTMLElement | null = null;
    private stopBtn: HTMLElement | null = null;
    private toggleBtn: HTMLElement | null = null;
    public onStop: (() => void) | null = null;
    public onResume: (() => void) | null = null;
    public onToggle: (() => void) | null = null;

    constructor() { }

    private create() {
        if (this.shadowRoot) return;

        const host = document.createElement('div');
        host.id = 'ai-translator-overlay-host';
        host.style.position = 'fixed';
        host.style.bottom = '20px';
        host.style.right = '20px';
        host.style.zIndex = '2147483647'; // Max z-index
        host.style.fontFamily = 'sans-serif';

        document.body.appendChild(host);
        this.shadowRoot = host.attachShadow({ mode: 'closed' });

        this.container = document.createElement('div');
        this.container.style.backgroundColor = 'white';
        this.container.style.color = '#333';
        this.container.style.padding = '12px 16px';
        this.container.style.borderRadius = '8px';
        this.container.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
        this.container.style.display = 'flex';
        this.container.style.flexDirection = 'column';
        this.container.style.gap = '10px';
        this.container.style.minWidth = '240px';
        this.container.style.border = '1px solid #eee';

        const titleRow = document.createElement('div');
        titleRow.style.display = 'flex';
        titleRow.style.justifyContent = 'space-between';
        titleRow.style.alignItems = 'center';

        const title = document.createElement('span');
        title.style.fontWeight = 'bold';
        title.style.fontSize = '14px';
        title.textContent = 'AI Translator';

        this.statusText = document.createElement('span');
        this.statusText.style.fontSize = '12px';
        this.statusText.style.color = '#666';
        this.statusText.textContent = 'Preparing...';

        titleRow.appendChild(title);
        titleRow.appendChild(this.statusText);

        const progressContainer = document.createElement('div');
        progressContainer.style.width = '100%';
        progressContainer.style.height = '6px';
        progressContainer.style.backgroundColor = '#eee';
        progressContainer.style.borderRadius = '3px';
        progressContainer.style.overflow = 'hidden';

        this.progressBar = document.createElement('div');
        this.progressBar.style.width = '0%';
        this.progressBar.style.height = '100%';
        this.progressBar.style.backgroundColor = '#007bff';
        this.progressBar.style.transition = 'width 0.3s ease';

        progressContainer.appendChild(this.progressBar);

        // Control Row (Stop / Resume)
        const controlRow = document.createElement('div');
        controlRow.style.display = 'flex';
        controlRow.style.gap = '8px';
        controlRow.style.marginTop = '4px';

        // Stop Button
        this.stopBtn = document.createElement('button');
        this.stopBtn.textContent = 'Pause/Stop';
        this.stopBtn.style.fontSize = '12px';
        this.stopBtn.style.padding = '4px 10px';
        this.stopBtn.style.color = '#666';
        this.stopBtn.style.backgroundColor = '#f0f0f0';
        this.stopBtn.style.border = '1px solid #ccc';
        this.stopBtn.style.borderRadius = '4px';
        this.stopBtn.style.cursor = 'pointer';
        this.stopBtn.style.flex = '1';

        this.stopBtn.onclick = () => {
            if (this.onStop) this.onStop();
            // We update UI via update() from main logic usually, but let's give check
        };

        // Resume Button
        this.resumeBtn = document.createElement('button');
        this.resumeBtn.textContent = 'Resume';
        this.resumeBtn.style.fontSize = '12px';
        this.resumeBtn.style.padding = '4px 10px';
        this.resumeBtn.style.color = 'white';
        this.resumeBtn.style.backgroundColor = '#28a745';
        this.resumeBtn.style.border = '1px solid #218838';
        this.resumeBtn.style.borderRadius = '4px';
        this.resumeBtn.style.cursor = 'pointer';
        this.resumeBtn.style.display = 'none'; // Hidden initially
        this.resumeBtn.style.flex = '1';

        this.resumeBtn.onclick = () => {
            if (this.onResume) this.onResume();
        };

        controlRow.appendChild(this.stopBtn);
        controlRow.appendChild(this.resumeBtn);

        // View Row (Toggle Original/Translated)
        const viewRow = document.createElement('div');
        viewRow.style.display = 'flex';
        viewRow.style.marginTop = '4px';
        viewRow.style.borderTop = '1px solid #eee';
        viewRow.style.paddingTop = '8px';

        this.toggleBtn = document.createElement('button');
        this.toggleBtn.textContent = 'Show Original';
        this.toggleBtn.style.fontSize = '12px';
        this.toggleBtn.style.padding = '6px 10px';
        this.toggleBtn.style.color = '#007bff';
        this.toggleBtn.style.backgroundColor = 'transparent';
        this.toggleBtn.style.border = '1px solid #007bff';
        this.toggleBtn.style.borderRadius = '4px';
        this.toggleBtn.style.cursor = 'pointer';
        this.toggleBtn.style.width = '100%';
        this.toggleBtn.style.display = 'none'; // Hidden initially

        this.toggleBtn.onclick = () => {
            if (this.onToggle) this.onToggle();
        };

        viewRow.appendChild(this.toggleBtn);

        this.container.appendChild(titleRow);
        this.container.appendChild(progressContainer);
        this.container.appendChild(controlRow);
        this.container.appendChild(viewRow);
        this.shadowRoot.appendChild(this.container);
    }

    public show() {
        if (!this.shadowRoot) this.create();
        if (this.container) this.container.style.display = 'flex';
        if (this.stopBtn) this.stopBtn!.style.display = 'block';
        if (this.resumeBtn) this.resumeBtn!.style.display = 'none';
        // Toggle btn visibility depends on state, usually hidden at start
    }

    public update(percent: number, status?: string) {
        if (!this.shadowRoot) this.create();
        if (this.progressBar) this.progressBar!.style.width = `${percent}%`;
        if (this.statusText) this.statusText!.textContent = status || `${percent}%`;
    }

    public setStoppedState() {
        if (this.stopBtn) this.stopBtn!.style.display = 'none';
        if (this.resumeBtn) this.resumeBtn!.style.display = 'block';
    }

    public setProcessingState() {
        if (this.stopBtn) this.stopBtn!.style.display = 'block';
        if (this.resumeBtn) this.resumeBtn!.style.display = 'none';
    }

    public showToggle(isTranslaed: boolean) {
        if (!this.shadowRoot) this.create();
        if (this.toggleBtn) {
            this.toggleBtn.style.display = 'block';
            this.toggleBtn.textContent = isTranslaed ? 'Show Original' : 'Show Translation';
            this.toggleBtn.style.backgroundColor = isTranslaed ? 'transparent' : '#007bff';
            this.toggleBtn.style.color = isTranslaed ? '#007bff' : 'white';
        }
    }

    public hide() {
        if (this.container) {
            this.container.style.display = 'none';
        }
    }

    public complete() {
        if (this.statusText) this.statusText!.textContent = 'Done';
        if (this.progressBar) this.progressBar!.style.backgroundColor = '#28a745';
        if (this.stopBtn) this.stopBtn!.style.display = 'none';
        if (this.resumeBtn) this.resumeBtn!.style.display = 'none';
    }

    public showToast(message: string, duration = 3000) {
        if (!this.shadowRoot) this.create();

        const toast = document.createElement('div');
        toast.textContent = message;
        toast.style.position = 'absolute';
        toast.style.bottom = '60px'; // Above controls
        toast.style.left = '50%';
        toast.style.transform = 'translateX(-50%)';
        toast.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
        toast.style.color = 'white';
        toast.style.padding = '8px 12px';
        toast.style.borderRadius = '4px';
        toast.style.fontSize = '12px';
        toast.style.opacity = '0';
        toast.style.transition = 'opacity 0.3s ease';
        toast.style.pointerEvents = 'none';

        this.container?.appendChild(toast);

        // Trigger reflow
        requestAnimationFrame(() => {
            toast.style.opacity = '1';
        });

        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => {
                toast.remove();
            }, 300);
        }, duration);
    }
}

export const overlay = new TranslationOverlay();
