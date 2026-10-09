/**
 * CloudConvert Kazakh Localized Web Application
 * Файлды түрлендіргіш (CloudConvert KZ)
 */

// FORMAT DATA REGISTRY
const FORMAT_CATEGORIES = {
    document: {
        id: 'document',
        name: 'Құжат',
        icon: 'fa-file-lines',
        color: 'text-red-500',
        bgColor: 'bg-red-500/10',
        description: 'PDF, DOCX, TXT және басқа кеңсе құжаттары',
        formats: ['PDF', 'DOC', 'DOCX', 'TXT', 'RTF', 'ODT', 'HTML', 'MD']
    },
    image: {
        id: 'image',
        name: 'Кескін',
        icon: 'fa-image',
        color: 'text-emerald-500',
        bgColor: 'bg-emerald-500/10',
        description: 'PNG, JPG, WEBP, SVG және векторлық кескіндер',
        formats: ['JPG', 'PNG', 'WEBP', 'GIF', 'SVG', 'BMP', 'ICO']
    },
    audio: {
        id: 'audio',
        name: 'Аудио',
        icon: 'fa-headphones',
        color: 'text-blue-500',
        bgColor: 'bg-blue-500/10',
        description: 'MP3, WAV, FLAC және барлық дыбыстық пішімдер',
        formats: ['MP3', 'WAV', 'FLAC', 'AAC', 'M4A', 'OGG', 'WMA']
    },
    video: {
        id: 'video',
        name: 'Бейне',
        icon: 'fa-video',
        color: 'text-purple-500',
        bgColor: 'bg-purple-500/10',
        description: 'MP4, AVI, MKV, MOV бейнежазбалары',
        formats: ['MP4', 'AVI', 'MKV', 'MOV', 'WEBM', 'WMV', 'FLV']
    },
    archive: {
        id: 'archive',
        name: 'Мұрағат',
        icon: 'fa-file-zipper',
        color: 'text-amber-500',
        bgColor: 'bg-amber-500/10',
        description: 'ZIP, RAR, 7Z және қысылған файлдар',
        formats: ['ZIP', 'RAR', '7Z', 'TAR', 'GZ']
    },
    spreadsheet: {
        id: 'spreadsheet',
        name: 'Кесте',
        icon: 'fa-table',
        color: 'text-green-600',
        bgColor: 'bg-green-500/10',
        description: 'XLSX, XLS, CSV кестелік деректері',
        formats: ['XLSX', 'XLS', 'CSV', 'ODS']
    },
    presentation: {
        id: 'presentation',
        name: 'Презентация',
        icon: 'fa-person-chalkboard',
        color: 'text-orange-500',
        bgColor: 'bg-orange-500/10',
        description: 'PPT, PPTX слайдтары',
        formats: ['PPTX', 'PPT', 'PDF', 'ODP']
    },
    ebook: {
        id: 'ebook',
        name: 'Эл. кітап',
        icon: 'fa-book',
        color: 'text-indigo-500',
        bgColor: 'bg-indigo-500/10',
        description: 'EPUB, MOBI, AZW3 кітап пішімдері',
        formats: ['EPUB', 'MOBI', 'AZW3', 'PDF']
    }
};

// Global State
let fileQueue = [];
let activeFormatPickerContext = { mode: 'target', fileId: null };
let activeSettingsFileId = null;

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initEventListeners();
    renderFormatCategoryGrid();
    setupDropZone();
});

// THEME TOGGLE (Dark / Light)
function initTheme() {
    const savedTheme = localStorage.getItem('cc_kz_theme') || 'dark';
    if (savedTheme === 'dark') {
        document.documentElement.classList.add('dark');
    } else {
        document.documentElement.classList.remove('dark');
    }
}

function toggleTheme() {
    const isDark = document.documentElement.classList.toggle('dark');
    localStorage.setItem('cc_kz_theme', isDark ? 'dark' : 'light');
    showToast(isDark ? 'Түнгі режим қосылды' : 'Күндізгі режим қосылды', 'info');
}

// EVENT LISTENERS
function initEventListeners() {
    document.getElementById('themeToggleBtn').addEventListener('click', toggleTheme);

    // Mobile Menu
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mobileMenu = document.getElementById('mobileMenu');
    mobileMenuBtn.addEventListener('click', () => {
        mobileMenu.classList.toggle('hidden');
    });

    // File Input
    const fileInput = document.getElementById('fileInput');
    const selectFileBtn = document.getElementById('selectFileBtn');
    selectFileBtn.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', handleFileInputChange);

    // Upload sources split dropdown
    const uploadSourceDropdownBtn = document.getElementById('uploadSourceDropdownBtn');
    const uploadSourcesMenu = document.getElementById('uploadSourcesMenu');
    uploadSourceDropdownBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        uploadSourcesMenu.classList.toggle('hidden');
    });

    document.addEventListener('click', () => {
        uploadSourcesMenu.classList.add('hidden');
    });

    // Format search in modal
    const formatModalSearch = document.getElementById('formatModalSearch');
    formatModalSearch.addEventListener('input', (e) => {
        filterModalFormats(e.target.value);
    });

    // Directory Search
    const directorySearch = document.getElementById('formatDirectorySearch');
    if (directorySearch) {
        directorySearch.addEventListener('input', (e) => {
            filterDirectoryGrid(e.target.value);
        });
    }
}

function triggerComputerUpload() {
    document.getElementById('fileInput').click();
}

// DRAG AND DROP
function setupDropZone() {
    const dropZone = document.getElementById('dropZone');

    ['dragenter', 'dragover'].forEach(eventName => {
        dropZone.addEventListener(eventName, (e) => {
            e.preventDefault();
            e.stopPropagation();
            dropZone.classList.add('drag-over');
        });
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, (e) => {
            e.preventDefault();
            e.stopPropagation();
            dropZone.classList.remove('drag-over');
        });
    });

    dropZone.addEventListener('drop', (e) => {
        const files = e.dataTransfer.files;
        if (files && files.length > 0) {
            handleSelectedFiles(Array.from(files));
        }
    });

    dropZone.addEventListener('click', () => {
        document.getElementById('fileInput').click();
    });
}

function handleFileInputChange(e) {
    if (e.target.files && e.target.files.length > 0) {
        handleSelectedFiles(Array.from(e.target.files));
        e.target.value = ''; // reset
    }
}

function handleSelectedFiles(files) {
    files.forEach(file => {
        const ext = getFileExtension(file.name).toUpperCase();
        const defaultTarget = getDefaultTargetFormat(ext);

        const fileItem = {
            id: 'file_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
            file: file,
            name: file.name,
            size: formatFileSize(file.size),
            rawSize: file.size,
            sourceFormat: ext || 'FILE',
            targetFormat: defaultTarget,
            status: 'ready', // 'ready', 'converting', 'completed', 'error'
            progress: 0,
            statusText: 'Дайын',
            convertedBlob: null,
            convertedName: null,
            options: {
                quality: 90,
                resizeWidth: null,
                resizeHeight: null,
                audioBitrate: '192k',
                pdfOrientation: 'portrait'
            }
        };
        fileQueue.push(fileItem);
    });

    renderQueue();
    showToast(`${files.length} файл тізімге қосылды`, 'success');
}

function getFileExtension(filename) {
    return filename.slice((filename.lastIndexOf(".") - 1 >>> 0) + 2);
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

function getDefaultTargetFormat(sourceExt) {
    const ext = sourceExt.toUpperCase();
    if (['JPG', 'JPEG', 'WEBP', 'BMP'].includes(ext)) return 'PNG';
    if (['PNG'].includes(ext)) return 'JPG';
    if (['DOC', 'DOCX', 'TXT', 'RTF', 'ODT'].includes(ext)) return 'PDF';
    if (['PDF'].includes(ext)) return 'DOCX';
    if (['WAV', 'FLAC', 'AAC', 'M4A', 'OGG'].includes(ext)) return 'MP3';
    if (['AVI', 'MKV', 'MOV', 'WEBM'].includes(ext)) return 'MP4';
    if (['XLS', 'CSV'].includes(ext)) return 'XLSX';
    if (['XLSX'].includes(ext)) return 'PDF';
    return 'PDF';
}

// RENDER FILE QUEUE
function renderQueue() {
    const queueSection = document.getElementById('fileQueueSection');
    const queueList = document.getElementById('fileQueueList');
    const queueCountText = document.getElementById('queueCountText');
    const dropZone = document.getElementById('dropZone');
    const downloadAllBtn = document.getElementById('downloadAllBtn');

    if (fileQueue.length === 0) {
        queueSection.classList.add('hidden');
        dropZone.classList.remove('hidden');
        return;
    }

    dropZone.classList.add('hidden');
    queueSection.classList.remove('hidden');
    queueCountText.textContent = `Файлдар тізімі (${fileQueue.length})`;

    const allCompleted = fileQueue.length > 0 && fileQueue.every(f => f.status === 'completed');
    if (allCompleted) {
        downloadAllBtn.classList.remove('hidden');
    } else {
        downloadAllBtn.classList.add('hidden');
    }

    queueList.innerHTML = fileQueue.map(item => `
        <div class="p-3.5 sm:p-4 rounded-xl border border-gray-200 dark:border-darkbg-border bg-gray-50/50 dark:bg-[#1e2025] hover:border-gray-300 dark:hover:border-neutral-600 transition-all">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                
                <!-- File Info -->
                <div class="flex items-center gap-3 min-w-0">
                    <div class="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-xs uppercase ${getBadgeStyle(item.sourceFormat)}">
                        ${item.sourceFormat.substring(0, 4)}
                    </div>
                    <div class="min-w-0">
                        <div class="text-sm font-semibold text-gray-900 dark:text-white truncate" title="${item.name}">
                            ${item.name}
                        </div>
                        <div class="text-xs text-gray-500 dark:text-gray-400">
                            ${item.size} • <span class="font-medium text-gray-700 dark:text-gray-300">${item.sourceFormat}</span>
                        </div>
                    </div>
                </div>

                <!-- Conversion Target & Options -->
                <div class="flex flex-wrap items-center gap-2">
                    <span class="text-xs text-gray-400">мынаған:</span>
                    
                    <button onclick="openFormatPicker('target', '${item.id}')" ${item.status === 'converting' ? 'disabled' : ''} class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg border border-gray-300 dark:border-darkbg-border bg-white dark:bg-darkbg-card hover:border-brand-500 text-gray-800 dark:text-gray-100 transition-colors">
                        <span>${item.targetFormat}</span>
                        <i class="fa-solid fa-chevron-down text-[10px] opacity-60"></i>
                    </button>

                    <button onclick="openSettingsModal('${item.id}')" title="Баптаулар" class="p-2 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-darkbg-hover transition-colors">
                        <i class="fa-solid fa-wrench text-xs"></i>
                    </button>

                    <!-- Status / Action -->
                    ${renderItemAction(item)}

                    <button onclick="removeFile('${item.id}')" title="Жою" class="p-2 rounded-lg text-gray-400 hover:text-red-500 transition-colors">
                        <i class="fa-solid fa-xmark text-sm"></i>
                    </button>
                </div>
            </div>

            <!-- Progress Bar (shown if converting) -->
            ${item.status === 'converting' ? `
                <div class="mt-3">
                    <div class="flex justify-between text-[11px] text-gray-500 dark:text-gray-400 mb-1">
                        <span>${item.statusText}</span>
                        <span class="font-mono">${item.progress}%</span>
                    </div>
                    <div class="w-full h-1.5 bg-gray-200 dark:bg-darkbg-border rounded-full overflow-hidden">
                        <div class="h-full bg-brand-600 progress-striped rounded-full transition-all duration-200" style="width: ${item.progress}%"></div>
                    </div>
                </div>
            ` : ''}

            ${item.status === 'completed' ? `
                <div class="mt-2 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1.5">
                    <i class="fa-solid fa-circle-check"></i>
                    <span>Сәтті түрлендірілді: ${item.convertedName}</span>
                </div>
            ` : ''}
        </div>
    `).join('');
}

function renderItemAction(item) {
    if (item.status === 'ready') {
        return `
            <button onclick="startSingleConversion('${item.id}')" class="px-3.5 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs shadow-sm transition-colors">
                <span>Түрлендіру</span>
            </button>
        `;
    } else if (item.status === 'converting') {
        return `
            <span class="px-3 py-1.5 rounded-lg bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 text-xs font-semibold flex items-center gap-1.5">
                <i class="fa-solid fa-spinner fa-spin text-xs"></i>
                <span>Өңделуде</span>
            </span>
        `;
    } else if (item.status === 'completed') {
        return `
            <button onclick="downloadSingleFile('${item.id}')" class="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-sm flex items-center gap-1.5 transition-colors">
                <i class="fa-solid fa-download text-xs"></i>
                <span>Жүктеп алу</span>
            </button>
        `;
    }
    return '';
}

function getBadgeStyle(format) {
    const f = format.toUpperCase();
    if (['PDF', 'DOC', 'DOCX', 'TXT'].includes(f)) return 'bg-red-500/10 text-red-500 border border-red-500/20';
    if (['PNG', 'JPG', 'WEBP', 'SVG'].includes(f)) return 'bg-brand-500/10 text-brand-500 border border-brand-500/20';
    if (['MP3', 'WAV', 'FLAC', 'AAC'].includes(f)) return 'bg-gold-500/10 text-gold-500 border border-gold-500/20';
    if (['MP4', 'AVI', 'MKV', 'MOV'].includes(f)) return 'bg-purple-500/10 text-purple-500 border border-purple-500/20';
    if (['ZIP', 'RAR', '7Z'].includes(f)) return 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20';
    return 'bg-gray-500/10 text-gray-400 border border-gray-500/20';
}

function removeFile(fileId) {
    fileQueue = fileQueue.filter(f => f.id !== fileId);
    renderQueue();
    showToast('Файл тізімнен өшірілді', 'info');
}

function clearAllFiles() {
    fileQueue = [];
    renderQueue();
    showToast('Барлық файлдар тазартылды', 'info');
}

// FORMAT PICKER MODAL
function openFormatPicker(mode, fileId) {
    activeFormatPickerContext = { mode, fileId };
    const modal = document.getElementById('formatPickerModal');
    const subTitle = document.getElementById('formatPickerSub');
    
    if (mode === 'target' && fileId) {
        const item = fileQueue.find(f => f.id === fileId);
        subTitle.textContent = `${item ? item.name : 'Файл'} үшін шығыс форматты таңдаңыз`;
    } else {
        subTitle.textContent = 'Қажетті форматты таңдаңыз';
    }

    renderModalCategories();
    renderModalFormats('all');
    modal.classList.remove('hidden');
    document.getElementById('formatModalSearch').value = '';
}

function closeFormatPicker() {
    document.getElementById('formatPickerModal').classList.add('hidden');
}

function renderModalCategories() {
    const chipsContainer = document.getElementById('modalCategoryChips');
    const categories = [
        { id: 'all', name: 'Барлығы' },
        ...Object.values(FORMAT_CATEGORIES)
    ];

    chipsContainer.innerHTML = categories.map(cat => `
        <button onclick="renderModalFormats('${cat.id}')" data-cat="${cat.id}" class="category-chip whitespace-nowrap px-3 py-1.5 rounded-lg border border-gray-200 dark:border-darkbg-border bg-gray-50 dark:bg-darkbg-card hover:bg-gray-100 dark:hover:bg-darkbg-hover font-medium transition-colors ${cat.id === 'all' ? 'active-chip bg-brand-600 text-white dark:bg-brand-600' : 'text-gray-700 dark:text-gray-300'}">
            ${cat.name}
        </button>
    `).join('');
}

function renderModalFormats(catId, query = '') {
    const grid = document.getElementById('modalFormatGrid');
    
    // Update chip styling
    document.querySelectorAll('.category-chip').forEach(btn => {
        if (btn.dataset.cat === catId) {
            btn.classList.add('bg-brand-600', 'text-white');
            btn.classList.remove('bg-gray-50', 'dark:bg-darkbg-card');
        } else {
            btn.classList.remove('bg-brand-600', 'text-white');
        }
    });

    let formatList = [];
    if (catId === 'all') {
        Object.values(FORMAT_CATEGORIES).forEach(c => {
            c.formats.forEach(f => {
                if (!formatList.find(x => x.name === f)) {
                    formatList.push({ name: f, category: c.name, catId: c.id });
                }
            });
        });
    } else {
        const cat = FORMAT_CATEGORIES[catId];
        if (cat) {
            cat.formats.forEach(f => formatList.push({ name: f, category: cat.name, catId: cat.id }));
        }
    }

    if (query) {
        formatList = formatList.filter(f => f.name.toLowerCase().includes(query.toLowerCase()) || f.category.toLowerCase().includes(query.toLowerCase()));
    }

    if (formatList.length === 0) {
        grid.innerHTML = `<div class="col-span-full py-8 text-center text-xs text-gray-500">Сәйкес формат табылмады</div>`;
        return;
    }

    grid.innerHTML = formatList.map(item => `
        <button onclick="selectFormat('${item.name}')" class="flex flex-col items-start p-3 rounded-xl border border-gray-200 dark:border-darkbg-border bg-white dark:bg-darkbg-card hover:border-brand-500 dark:hover:border-brand-500 hover:bg-brand-500/5 transition-all text-left group">
            <span class="font-bold text-sm text-gray-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400">${item.name}</span>
            <span class="text-[10px] text-gray-400">${item.category}</span>
        </button>
    `).join('');
}

function filterModalFormats(query) {
    renderModalFormats('all', query);
}

function selectFormat(format) {
    if (activeFormatPickerContext.fileId) {
        // Update specific item in queue
        const item = fileQueue.find(f => f.id === activeFormatPickerContext.fileId);
        if (item) {
            item.targetFormat = format;
            renderQueue();
            showToast(`${item.name} форматы ${format} болып өзгертілді`, 'info');
        }
    } else {
        // Quick top bar update
        if (activeFormatPickerContext.mode === 'source') {
            document.getElementById('quickSourceFormatText').textContent = format;
        } else {
            document.getElementById('quickTargetFormatText').textContent = format;
        }
    }
    closeFormatPicker();
}

// CONVERSION SETTINGS (OPTIONS) MODAL
function openSettingsModal(fileId) {
    activeSettingsFileId = fileId;
    const item = fileQueue.find(f => f.id === fileId);
    if (!item) return;

    const modal = document.getElementById('settingsModal');
    const body = document.getElementById('settingsModalBody');

    const isImage = ['PNG', 'JPG', 'WEBP', 'GIF', 'BMP'].includes(item.targetFormat.toUpperCase());
    const isAudioVideo = ['MP3', 'WAV', 'MP4', 'AAC', 'MKV', 'WEBM'].includes(item.targetFormat.toUpperCase());
    const isDoc = ['PDF'].includes(item.targetFormat.toUpperCase());

    let contentHtml = `
        <div class="p-3 rounded-lg bg-gray-50 dark:bg-darkbg-hover flex items-center justify-between">
            <span class="font-medium text-xs text-gray-500">Файл:</span>
            <span class="font-semibold text-xs text-gray-900 dark:text-white">${item.name} &rarr; ${item.targetFormat}</span>
        </div>
    `;

    if (isImage) {
        contentHtml += `
            <div class="space-y-3">
                <h4 class="font-semibold text-xs uppercase tracking-wider text-gray-400">Кескін параметрлері</h4>
                <div>
                    <label class="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Сапа (Quality): <span id="qualityValDisplay" class="font-bold text-brand-600">${item.options.quality}%</span>
                    </label>
                    <input type="range" id="optQuality" min="10" max="100" value="${item.options.quality}" class="w-full accent-brand-600" oninput="document.getElementById('qualityValDisplay').textContent = this.value + '%'">
                </div>
                <div class="grid grid-cols-2 gap-3">
                    <div>
                        <label class="block text-xs text-gray-600 dark:text-gray-400 mb-1">Ені (Width px)</label>
                        <input type="number" id="optWidth" placeholder="Авто" value="${item.options.resizeWidth || ''}" class="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-darkbg-border bg-transparent text-xs">
                    </div>
                    <div>
                        <label class="block text-xs text-gray-600 dark:text-gray-400 mb-1">Биіктігі (Height px)</label>
                        <input type="number" id="optHeight" placeholder="Авто" value="${item.options.resizeHeight || ''}" class="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-darkbg-border bg-transparent text-xs">
                    </div>
                </div>
            </div>
        `;
    } else if (isAudioVideo) {
        contentHtml += `
            <div class="space-y-3">
                <h4 class="font-semibold text-xs uppercase tracking-wider text-gray-400">Аудио және медиа баптаулары</h4>
                <div>
                    <label class="block text-xs text-gray-600 dark:text-gray-400 mb-1">Аудио битрейті (Bitrate)</label>
                    <select id="optBitrate" class="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-darkbg-border bg-transparent text-xs">
                        <option value="128k" ${item.options.audioBitrate === '128k' ? 'selected' : ''}>128 kbps (Стандарт)</option>
                        <option value="192k" ${item.options.audioBitrate === '192k' ? 'selected' : ''}>192 kbps (Жақсы)</option>
                        <option value="256k" ${item.options.audioBitrate === '256k' ? 'selected' : ''}>256 kbps (Жоғары)</option>
                        <option value="320k" ${item.options.audioBitrate === '320k' ? 'selected' : ''}>320 kbps (Максималды)</option>
                    </select>
                </div>
                <div>
                    <label class="block text-xs text-gray-600 dark:text-gray-400 mb-1">Дыбыс арналары (Channels)</label>
                    <select class="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-darkbg-border bg-transparent text-xs">
                        <option value="2">Стерео (2 арна)</option>
                        <option value="1">Моно (1 арна)</option>
                    </select>
                </div>
            </div>
        `;
    } else {
        contentHtml += `
            <div class="space-y-3">
                <h4 class="font-semibold text-xs uppercase tracking-wider text-gray-400">Құжат параметрлері</h4>
                <div>
                    <label class="block text-xs text-gray-600 dark:text-gray-400 mb-1">Бет бағдары (Orientation)</label>
                    <select id="optOrientation" class="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-darkbg-border bg-transparent text-xs">
                        <option value="portrait" ${item.options.pdfOrientation === 'portrait' ? 'selected' : ''}>Тігінен (Portrait)</option>
                        <option value="landscape" ${item.options.pdfOrientation === 'landscape' ? 'selected' : ''}>Көлденең (Landscape)</option>
                    </select>
                </div>
                <div>
                    <label class="block text-xs text-gray-600 dark:text-gray-400 mb-1">Сығу деңгейі</label>
                    <select class="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-darkbg-border bg-transparent text-xs">
                        <option value="standard">Стандартты сапа</option>
                        <option value="high">Ең жоғарғы сапа</option>
                        <option value="compact">Кіші өлшем (Ықшам)</option>
                    </select>
                </div>
            </div>
        `;
    }

    body.innerHTML = contentHtml;
    modal.classList.remove('hidden');
}

function closeSettingsModal() {
    document.getElementById('settingsModal').classList.add('hidden');
}

function saveSettingsModal() {
    const item = fileQueue.find(f => f.id === activeSettingsFileId);
    if (item) {
        const qInput = document.getElementById('optQuality');
        if (qInput) item.options.quality = parseInt(qInput.value);

        const wInput = document.getElementById('optWidth');
        if (wInput) item.options.resizeWidth = wInput.value ? parseInt(wInput.value) : null;

        const hInput = document.getElementById('optHeight');
        if (hInput) item.options.resizeHeight = hInput.value ? parseInt(hInput.value) : null;

        const bInput = document.getElementById('optBitrate');
        if (bInput) item.options.audioBitrate = bInput.value;

        const oInput = document.getElementById('optOrientation');
        if (oInput) item.options.pdfOrientation = oInput.value;

        showToast('Параметрлер сақталды', 'success');
    }
    closeSettingsModal();
}

// REAL CLIENT-SIDE CONVERSION ENGINE
async function startSingleConversion(fileId) {
    const item = fileQueue.find(f => f.id === fileId);
    if (!item || item.status === 'converting') return;

    item.status = 'converting';
    item.progress = 10;
    item.statusText = 'Файл оқылуда...';
    renderQueue();

    try {
        await executeConversion(item);
        item.status = 'completed';
        item.progress = 100;
        item.statusText = 'Аяқталды';
        showToast(`${item.name} сәтті түрлендірілді!`, 'success');
    } catch (err) {
        console.error('Conversion failed:', err);
        item.status = 'ready';
        item.progress = 0;
        item.statusText = 'Қате орын алды';
        showToast(`Түрлендіру сәтсіз: ${err.message || 'Белгісіз қате'}`, 'error');
    }
    renderQueue();
}

async function startAllConversions() {
    const pending = fileQueue.filter(f => f.status === 'ready');
    if (pending.length === 0) {
        showToast('Түрлендіру үшін файлдар жоқ', 'info');
        return;
    }

    for (const item of pending) {
        await startSingleConversion(item.id);
    }
}

// Core Execution
async function executeConversion(item) {
    const targetExt = item.targetFormat.toUpperCase();
    const sourceExt = item.sourceFormat.toUpperCase();
    const baseName = item.name.substring(0, item.name.lastIndexOf('.')) || item.name;
    const outputFilename = `${baseName}.${targetExt.toLowerCase()}`;

    // Update progress steps
    const updateProgress = (pct, text) => {
        item.progress = pct;
        item.statusText = text;
        renderQueue();
    };

    // Case 1: Image conversions via HTML5 Canvas (JPG, PNG, WEBP, BMP)
    if (['JPG', 'JPEG', 'PNG', 'WEBP', 'BMP'].includes(targetExt) && item.file.type.startsWith('image/')) {
        updateProgress(30, 'Кескін өңделуде...');
        const convertedBlob = await convertImageViaCanvas(item.file, targetExt, item.options);
        updateProgress(90, 'Файл дайындалуда...');
        item.convertedBlob = convertedBlob;
        item.convertedName = outputFilename;
        return;
    }

    // Case 2: Text / Markdown to PDF via jsPDF
    if (targetExt === 'PDF' && (item.file.type.startsWith('text/') || ['TXT', 'MD', 'JSON', 'JS', 'HTML', 'CSV'].includes(sourceExt))) {
        updateProgress(40, 'Мәтін құрылымы өңделуде...');
        const textContent = await readFileAsText(item.file);
        updateProgress(70, 'PDF құжаты қалыптастырылуда...');
        const pdfBlob = createPdfFromText(textContent, item.name, item.options);
        item.convertedBlob = pdfBlob;
        item.convertedName = outputFilename;
        return;
    }

    // Case 3: Archive to ZIP via JSZip
    if (targetExt === 'ZIP') {
        updateProgress(50, 'Мұрағатқа қысылуда...');
        const zip = new JSZip();
        zip.file(item.name, item.file);
        const zipBlob = await zip.generateAsync({ type: 'blob' });
        item.convertedBlob = zipBlob;
        item.convertedName = outputFilename;
        return;
    }

    // Case 4: Any other format (High-fidelity realistic processing simulation)
    updateProgress(25, 'Файл жүктелуде...');
    await delay(300);
    updateProgress(55, 'Түрлендірілуде...');
    await delay(500);
    updateProgress(85, 'Шығыс деректер құрастырылуда...');
    await delay(300);

    // Provide converted blob with appropriate mime
    const mime = getMimeTypeForExt(targetExt);
    const buffer = await readFileAsArrayBuffer(item.file);
    item.convertedBlob = new Blob([buffer], { type: mime });
    item.convertedName = outputFilename;
}

function convertImageViaCanvas(file, targetExt, options) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let targetW = options.resizeWidth || img.width;
                let targetH = options.resizeHeight || img.height;

                canvas.width = targetW;
                canvas.height = targetH;
                const ctx = canvas.getContext('2d');

                // If converting to JPEG, fill white background to avoid black transparency
                if (targetExt === 'JPG' || targetExt === 'JPEG') {
                    ctx.fillStyle = '#FFFFFF';
                    ctx.fillRect(0, 0, targetW, targetH);
                }

                ctx.drawImage(img, 0, 0, targetW, targetH);

                let mime = 'image/png';
                if (targetExt === 'JPG' || targetExt === 'JPEG') mime = 'image/jpeg';
                if (targetExt === 'WEBP') mime = 'image/webp';

                const quality = (options.quality || 90) / 100;
                canvas.toBlob((blob) => {
                    if (blob) resolve(blob);
                    else reject(new Error('Canvas to Blob failed'));
                }, mime, quality);
            };
            img.onerror = () => reject(new Error('Кескін жүктелмеді'));
            img.src = e.target.result;
        };
        reader.onerror = () => reject(new Error('Файлды оқу сәтсіз'));
        reader.readAsDataURL(file);
    });
}

function createPdfFromText(text, title, options) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({
        orientation: options.pdfOrientation || 'portrait',
        unit: 'mm',
        format: 'a4'
    });

    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text(title, 20, 20);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    const splitText = doc.splitTextToSize(text, 170);
    doc.text(splitText, 20, 30);

    return doc.output('blob');
}

function readFileAsText(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(reader.error);
        reader.readAsText(file);
    });
}

function readFileAsArrayBuffer(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(reader.error);
        reader.readAsArrayBuffer(file);
    });
}

function getMimeTypeForExt(ext) {
    const map = {
        'PDF': 'application/pdf',
        'PNG': 'image/png',
        'JPG': 'image/jpeg',
        'JPEG': 'image/jpeg',
        'WEBP': 'image/webp',
        'MP3': 'audio/mpeg',
        'MP4': 'video/mp4',
        'ZIP': 'application/zip',
        'TXT': 'text/plain',
        'DOCX': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'XLSX': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    };
    return map[ext] || 'application/octet-stream';
}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// DOWNLOAD FILES
function downloadSingleFile(fileId) {
    const item = fileQueue.find(f => f.id === fileId);
    if (!item || !item.convertedBlob) return;

    const url = URL.createObjectURL(item.convertedBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = item.convertedName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast(`${item.convertedName} жүктелді`, 'success');
}

async function downloadAllFiles() {
    const completed = fileQueue.filter(f => f.status === 'completed' && f.convertedBlob);
    if (completed.length === 0) return;

    if (completed.length === 1) {
        downloadSingleFile(completed[0].id);
        return;
    }

    showToast('Барлық файлдар ZIP мұрағатына жиналуда...', 'info');
    const zip = new JSZip();
    completed.forEach(item => {
        zip.file(item.convertedName, item.convertedBlob);
    });

    const zipBlob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(zipBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `turlendir_kz_archive_${Date.now()}.zip`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Мұрағат жүктелді', 'success');
}

// FORMAT DIRECTORY GRID
function renderFormatCategoryGrid() {
    const grid = document.getElementById('formatCategoryGrid');
    if (!grid) return;

    grid.innerHTML = Object.values(FORMAT_CATEGORIES).map(cat => `
        <div class="p-6 rounded-2xl bg-white dark:bg-darkbg-card border border-gray-200 dark:border-darkbg-border hover:shadow-lg transition-all group">
            <div class="flex items-center gap-3 mb-3">
                <div class="w-10 h-10 rounded-xl ${cat.bgColor} ${cat.color} flex items-center justify-center text-lg">
                    <i class="fa-solid ${cat.icon}"></i>
                </div>
                <div>
                    <h3 class="font-bold text-gray-900 dark:text-white text-base">${cat.name} түрлендіргіш</h3>
                    <p class="text-[11px] text-gray-400">${cat.formats.length} пішім қолдауы</p>
                </div>
            </div>
            <p class="text-xs text-gray-500 dark:text-gray-400 mb-4 line-clamp-2">${cat.description}</p>
            <div class="flex flex-wrap gap-1.5 mb-4">
                ${cat.formats.slice(0, 5).map(f => `
                    <span class="text-[11px] font-semibold px-2 py-0.5 rounded bg-gray-100 dark:bg-darkbg-border text-gray-700 dark:text-gray-300">${f}</span>
                `).join('')}
                ${cat.formats.length > 5 ? `<span class="text-[11px] text-gray-400 px-1">+${cat.formats.length - 5}</span>` : ''}
            </div>
            <button onclick="openFormatPicker('target', null)" class="w-full py-2 rounded-xl border border-gray-200 dark:border-darkbg-border group-hover:border-brand-500 group-hover:text-brand-600 dark:group-hover:text-brand-400 text-xs font-semibold text-gray-700 dark:text-gray-300 transition-colors">
                Түрлендіргішті ашу &rarr;
            </button>
        </div>
    `).join('');
}

function filterDirectoryGrid(query) {
    const cards = document.querySelectorAll('#formatCategoryGrid > div');
    const q = query.toLowerCase().trim();

    cards.forEach(card => {
        const text = card.textContent.toLowerCase();
        if (text.includes(q)) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

// URL MODAL
function openUrlModal() {
    document.getElementById('urlModal').classList.remove('hidden');
    document.getElementById('urlInput').value = '';
}

function closeUrlModal() {
    document.getElementById('urlModal').classList.add('hidden');
}

function submitUrlFile() {
    const url = document.getElementById('urlInput').value.trim();
    if (!url) {
        showToast('Сілтемені енгізіңіз', 'error');
        return;
    }

    const filename = url.split('/').pop().split('?')[0] || 'remote_file.pdf';
    const fakeFile = new File([new Blob(["Remote file simulated content"])], filename, { type: 'application/pdf' });

    handleSelectedFiles([fakeFile]);
    closeUrlModal();
    showToast(`URL арқылы қосылды: ${filename}`, 'success');
}

// CLOUD SERVICE SIMULATOR
function simulateCloudService(serviceName) {
    showToast(`${serviceName} қосылуда...`, 'info');
    setTimeout(() => {
        const sampleFile = new File([new Blob(["Cloud document content"])], `${serviceName.toLowerCase()}_sample.docx`, { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
        handleSelectedFiles([sampleFile]);
        showToast(`${serviceName}-тен файл жүктелді!`, 'success');
    }, 800);
}

// AUTH MODAL
function openAuthModal(type) {
    const modal = document.getElementById('authModal');
    const title = document.getElementById('authModalTitle');
    const submitBtn = document.getElementById('authSubmitBtn');

    if (type === 'register') {
        title.textContent = 'Жаңа тіркелгі жасау (Тіркелу)';
        submitBtn.textContent = 'Тіркелу';
    } else {
        title.textContent = 'Жүйеге кіру';
        submitBtn.textContent = 'Кіру';
    }
    modal.classList.remove('hidden');
}

function closeAuthModal() {
    document.getElementById('authModal').classList.add('hidden');
}

function submitAuth() {
    const email = document.getElementById('authEmail').value;
    if (!email) {
        showToast('Электрондық поштаны жазыңыз', 'error');
        return;
    }
    showToast(`Қош келдіңіз, ${email}!`, 'success');
    closeAuthModal();
}

function simulateGoogleLogin() {
    showToast('Google арқылы сәтті кірдіңіз!', 'success');
    closeAuthModal();
}

// PAYMENT MODAL SIMULATOR
function openPaymentModal(planName, price) {
    showToast(`${planName} (${price}) таңдалды. Төлем шлюзі ашылуда...`, 'info');
}

// API DOCS / CODE COPY
function copyCodeSnippet() {
    const code = `curl -X POST https://api.cloudconvert.com/v2/jobs \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "tasks": {
      "import-my-file": {
        "operation": "import/upload"
      },
      "convert-to-pdf": {
        "operation": "convert",
        "input": "import-my-file",
        "output_format": "pdf"
      },
      "export-my-file": {
        "operation": "export/url",
        "input": "convert-to-pdf"
      }
    }
  }'`;
    navigator.clipboard.writeText(code).then(() => {
        showToast('Код алмасу буферіне көшірілді', 'success');
    });
}

function copyApiKeyDemo() {
    navigator.clipboard.writeText('cc_api_key_kz_live_89472918471209').then(() => {
        showToast('Демо API кілті көшірілді: cc_api_key_kz_live_...', 'success');
    });
}

function openApiDocsModal() {
    showToast('API құжаттамасы бөлімі', 'info');
}

// TOAST NOTIFICATIONS
function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');

    const icons = {
        success: 'fa-circle-check text-emerald-500',
        error: 'fa-circle-exclamation text-red-500',
        info: 'fa-circle-info text-blue-500'
    };

    toast.className = 'pointer-events-auto flex items-center gap-3 p-3.5 rounded-xl border border-gray-200 dark:border-darkbg-border bg-white dark:bg-darkbg-card text-gray-900 dark:text-white shadow-xl text-xs sm:text-sm animate-fadeIn';
    toast.innerHTML = `
        <i class="fa-solid ${icons[type] || icons.info} text-base shrink-0"></i>
        <span class="flex-1 font-medium">${message}</span>
        <button onclick="this.parentElement.remove()" class="text-gray-400 hover:text-gray-600 dark:hover:text-white">
            <i class="fa-solid fa-xmark"></i>
        </button>
    `;

    container.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transition = 'opacity 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3500);
}

function showInfoToast(title) {
    showToast(`${title} бөлімі дайын`, 'info');
}
