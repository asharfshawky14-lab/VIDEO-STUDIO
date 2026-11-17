'use strict';

const VideoEditor = (() => {

    const state = {
        files: [],
        activeFile: null,
        objectUrls: [],
        isPlaying: false
    };

    const elements = {};

    function init() {
        cacheElements();
        bindEvents();
    }

    function cacheElements() {
        elements.importBtn = document.getElementById('importBtn');
        elements.mediaInput = document.getElementById('mediaInput');
        elements.mediaLibrary = document.getElementById('mediaLibrary');

        elements.previewVideo = document.getElementById('previewVideo');
        elements.previewImage = document.getElementById('previewImage');
        elements.previewPlaceholder = document.getElementById('previewPlaceholder');

        elements.playBtn = document.getElementById('playBtn');

        elements.currentTime = document.getElementById('currentTime');
        elements.totalTime = document.getElementById('totalTime');

        elements.saveBtn = document.getElementById('saveBtn');
        elements.exportBtn = document.getElementById('exportBtn');

        elements.tracksArea = document.getElementById('tracksArea');
    }

    function bindEvents() {

        elements.importBtn.addEventListener('click', () => {
            elements.mediaInput.click();
        });

        elements.mediaInput.addEventListener('change', event => {
            importFiles(event.target.files);
            event.target.value = '';
        });

        elements.playBtn.addEventListener('click', togglePlayback);

        elements.previewVideo.addEventListener('timeupdate', updateTime);

        elements.previewVideo.addEventListener('loadedmetadata', () => {
            elements.totalTime.textContent =
                formatTime(elements.previewVideo.duration);
        });

        elements.previewVideo.addEventListener('play', () => {
            state.isPlaying = true;
            updatePlayButton();
        });

        elements.previewVideo.addEventListener('pause', () => {
            state.isPlaying = false;
            updatePlayButton();
        });

        elements.previewVideo.addEventListener('ended', () => {
            state.isPlaying = false;
            updatePlayButton();
        });

        elements.saveBtn.addEventListener('click', saveProject);

        elements.exportBtn.addEventListener('click', () => {
            alert('سيتم إضافة نظام تصدير الفيديو في مرحلة التصدير.');
        });

        setupDragAndDrop();

        setupMediaTabs();

    }

    // IMPORT FILES

    function importFiles(fileList) {

        const files = Array.from(fileList);

        files.forEach(file => {

            if (
                !file.type.startsWith('image/') &&
                !file.type.startsWith('video/') &&
                !file.type.startsWith('audio/')
            ) {
                return;
            }

            const media = {
                id: createId(),
                file,
                name: file.name,
                type: getMediaType(file),
                url: URL.createObjectURL(file)
            };

            state.files.push(media);
            state.objectUrls.push(media.url);

        });

        renderMediaLibrary();

    }

    function getMediaType(file) {

        if (file.type.startsWith('video/')) {
            return 'video';
        }

        if (file.type.startsWith('image/')) {
            return 'image';
        }

        return 'audio';

    }

    // MEDIA LIBRARY

    function renderMediaLibrary() {

        elements.mediaLibrary.innerHTML = '';

        if (state.files.length === 0) {

            elements.mediaLibrary.innerHTML = `
                <div class="empty-media">
                    <span>▧</span>
                    <p>مكتبة الوسائط فارغة</p>
                    <small>ابدأ باستيراد ملفاتك</small>
                </div>
            `;

            return;
        }

        const grid = document.createElement('div');

        grid.className = 'media-grid';

        state.files.forEach(media => {

            const item = document.createElement('div');

            item.className = 'media-item';
            item.dataset.id = media.id;

            const thumbnail = document.createElement('div');

            thumbnail.className = 'media-thumbnail';

            if (media.type === 'image') {

                const image = document.createElement('img');

                image.src = media.url;
                image.alt = media.name;

                thumbnail.appendChild(image);

            } else {

                const icon = document.createElement('span');

                icon.className = 'media-file-icon';

                icon.textContent =
                    media.type === 'video' ? '▶' : '♫';

                thumbnail.appendChild(icon);

            }

            const info = document.createElement('div');

            info.className = 'media-item-info';

            const name = document.createElement('span');

            name.className = 'media-item-name';
            name.textContent = media.name;
            name.title = media.name;

            const type = document.createElement('small');

            type.textContent =
                media.type === 'video' ? 'VIDEO' :
                media.type === 'image' ? 'IMAGE' : 'AUDIO';

            info.append(name, type);

            const deleteButton = document.createElement('button');

            deleteButton.className = 'media-delete';
            deleteButton.textContent = '×';
            deleteButton.title = 'حذف الملف';

            deleteButton.addEventListener('click', event => {
                event.stopPropagation();
                removeMedia(media.id);
            });

            item.append(thumbnail, info, deleteButton);

            item.addEventListener('click', () => {
                previewMedia(media);
            });

            grid.appendChild(item);

        });

        elements.mediaLibrary.appendChild(grid);

    }

    // PREVIEW

    function previewMedia(media) {

        state.activeFile = media;

        stopPlayback();

        elements.previewPlaceholder.hidden = true;

        elements.previewImage.hidden = true;
        elements.previewVideo.hidden = true;

        if (media.type === 'image') {

            elements.previewImage.src = media.url;
            elements.previewImage.hidden = false;

            elements.currentTime.textContent = '00:00:00';
            elements.totalTime.textContent = '00:00:00';

        } else if (media.type === 'video') {

            elements.previewVideo.src = media.url;
            elements.previewVideo.hidden = false;

            elements.previewVideo.load();

        } else {

            elements.previewPlaceholder.hidden = false;

            elements.previewPlaceholder.innerHTML = `
                <div class="placeholder-icon">♫</div>
                <h2>ملف صوتي محدد</h2>
                <p>${escapeHTML(media.name)}</p>
                <audio controls src="${media.url}" style="width:90%;margin-top:15px"></audio>
            `;

            elements.currentTime.textContent = '00:00:00';
            elements.totalTime.textContent = '00:00:00';

        }

        updateSelectedMedia();

    }

    function updateSelectedMedia() {

        document.querySelectorAll('.media-item').forEach(item => {

            item.classList.toggle(
                'selected',
                item.dataset.id === state.activeFile?.id
            );

        });

    }

    // PLAYBACK

    function togglePlayback() {

        if (!state.activeFile || state.activeFile.type !== 'video') {
            return;
        }

        if (elements.previewVideo.paused) {

            elements.previewVideo.play().catch(() => {
                console.warn('تعذر تشغيل الفيديو.');
            });

        } else {

            elements.previewVideo.pause();

        }

    }

    function stopPlayback() {

        if (!elements.previewVideo.paused) {
            elements.previewVideo.pause();
        }

        state.isPlaying = false;

        updatePlayButton();

    }

    function updatePlayButton() {

        elements.playBtn.textContent =
            state.isPlaying ? 'Ⅱ' : '▶';

    }

    function updateTime() {

        elements.currentTime.textContent =
            formatTime(elements.previewVideo.currentTime);

    }

    function formatTime(seconds) {

        if (!Number.isFinite(seconds)) {
            return '00:00:00';
        }

        const hours = Math.floor(seconds / 3600);

        const minutes = Math.floor((seconds % 3600) / 60);

        const secs = Math.floor(seconds % 60);

        return [
            hours,
            minutes,
            secs
        ].map(value => String(value).padStart(2, '0')).join(':');

    }

    // REMOVE MEDIA

    function removeMedia(id) {

        const index = state.files.findIndex(media => media.id === id);

        if (index === -1) {
            return;
        }

        const media = state.files[index];

        if (state.activeFile?.id === id) {

            stopPlayback();

            state.activeFile = null;

            elements.previewVideo.removeAttribute('src');
            elements.previewImage.removeAttribute('src');

            elements.previewVideo.hidden = true;
            elements.previewImage.hidden = true;

            elements.previewPlaceholder.hidden = false;

            elements.previewPlaceholder.innerHTML = `
                <div class="placeholder-icon">▶</div>
                <h2>مساحة الإبداع تبدأ هنا</h2>
                <p>استورد فيديو أو صورة لبدء مشروعك</p>
            `;

            elements.currentTime.textContent = '00:00:00';
            elements.totalTime.textContent = '00:00:00';

        }

        URL.revokeObjectURL(media.url);

        state.objectUrls = state.objectUrls.filter(url => {
            return url !== media.url;
        });

        state.files.splice(index, 1);

        renderMediaLibrary();

    }

    // DRAG AND DROP

    function setupDragAndDrop() {

        const importArea = document.getElementById('importArea');

        importArea.addEventListener('dragover', event => {
            event.preventDefault();
            importArea.classList.add('drag-active');
        });

        importArea.addEventListener('dragleave', () => {
            importArea.classList.remove('drag-active');
        });

        importArea.addEventListener('drop', event => {

            event.preventDefault();

            importArea.classList.remove('drag-active');

            importFiles(event.dataTransfer.files);

        });

    }

    // MEDIA TABS

    function setupMediaTabs() {

        document.querySelectorAll('.media-tab').forEach(tab => {

            tab.addEventListener('click', () => {

                document.querySelectorAll('.media-tab').forEach(item => {
                    item.classList.remove('active');
                });

                tab.classList.add('active');

            });

        });

    }

    // SAVE PROJECT

    function saveProject() {

        const project = {
            name: 'مشروع بدون عنوان',
            media: state.files.map(media => ({
                name: media.name,
                type: media.type
            })),
            savedAt: new Date().toISOString()
        };

        try {

            localStorage.setItem(
                'videoStudioProject',
                JSON.stringify(project)
            );

            alert('تم حفظ بيانات المشروع على هذا الجهاز.');

        } catch (error) {

            alert('تعذر حفظ المشروع.');

        }

    }

    // HELPERS

    function createId() {

        return (
            Date.now().toString(36) +
            Math.random().toString(36).slice(2)
        );

    }

    function escapeHTML(value) {

        return String(value).replace(/[&<>"']/g, char => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;'
        })[char]);

    }

    // CLEANUP

    window.addEventListener('beforeunload', () => {

        state.objectUrls.forEach(url => {
            URL.revokeObjectURL(url);
        });

    });

    return {
        init,
        importFiles
    };

})();


document.addEventListener('DOMContentLoaded', () => {

    VideoEditor.init();

});
