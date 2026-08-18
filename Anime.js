document.addEventListener('DOMContentLoaded', () => {
    const watchedAnimeListEl = document.getElementById('watched-anime-list');
    const watchlistAnimeListEl = document.getElementById('watchlist-anime-list');
    const badAnimeListEl = document.getElementById('bad-anime-list');
    const downloadDataBtn = document.getElementById('download-data-btn');
    const uploadDataBtn = document.getElementById('upload-data-btn');
    const uploadDataInput = document.getElementById('upload-data-input');
    const notesModalOverlay = document.getElementById('notes-modal-overlay');
    const notesTextarea = document.getElementById('notes-textarea');
    const saveNotesBtn = document.getElementById('save-notes-btn');
    const closeNotesBtn = document.getElementById('close-notes-btn');
    const modalTitle = document.getElementById('modal-title');
    const readNotesBtn = document.getElementById('read-notes-btn');
    const stopReadBtn = document.getElementById('stop-read-btn');
    const addMomentBtn = document.getElementById('add-moment-btn');
    const momentsContainer = document.getElementById('moments-container');

    const STORAGE_KEY_WATCHED = 'animes_watched';
    const STORAGE_KEY_WATCHLIST = 'animes_watchlist';
    const STORAGE_KEY_BAD = 'animes_bad';
    const STORAGE_KEY_NOTES = 'anime_notes';
    const STORAGE_KEY_MOMENTS = 'anime_moments';

    let watchedAnimes = {};
    let watchlistAnimes = {};
    let badAnimes = {};
    let animeNotes = {};
    let animeMoments = {};

    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';

    // Deine custom Kategorienamen
    const categoryTitles = {
        'A': 'A wie Apfel', 'B': 'B wie Bananane', 'C': 'C wie Chrome',
        'D': 'D wie Dachs', 'E': 'E wie Eichhörnchen', 'F': 'F wie Fliege',
        'G': 'G wie Gunshots', 'H': 'H wie Hellikopter', 'I': 'I wie Igelwürstchen',
        'J': 'J wie Jungeeee!!!', 'K': 'K wie Klebstoffaffe', 'L': 'L wie Link in der Bio',
        'M': 'M wie Masturbation', 'N': 'N wie Nationalhymne', 'O': 'O my God!',
        'P': 'P wie Programmieren', 'Q': 'Q wie Quantillion', 'R': 'R wie Rassist',
        'S': 'S wie Süßigkeit', 'T': 'T wie Tatort', 'U': 'U wie Ufo',
        'V': 'V wie Vogel', 'W': 'W wie Wiederlich', 'X': 'X wie X-Beliebig',
        'Y': 'Y wie Your Mom Gay Lol', 'Z': 'Z wie Zigarette', '#': '# wie Zahl'
    };

    alphabet.split('').concat('#').forEach(char => {
        watchedAnimes[char] = [];
        watchlistAnimes[char] = [];
        badAnimes[char] = [];
    });

    // 1. Kategorien dynamisch in HTML generieren
    const generateCategoryHTML = () => {
        const containers = [watchedAnimeListEl, watchlistAnimeListEl, badAnimeListEl];

        containers.forEach(container => {
            container.innerHTML = '';
            Object.entries(categoryTitles).forEach(([char, title]) => {
                const ul = document.createElement('ul');
                ul.classList.add('anime-category');

                const h3 = document.createElement('h3');
                h3.textContent = title;
                h3.dataset.char = char;

                ul.appendChild(h3);
                container.appendChild(ul);

                // Eingabefelder (+) für jede Kategorie anheften
                addInputAndButton(ul);
            });
        });
    };

    const saveData = () => {
        localStorage.setItem(STORAGE_KEY_WATCHED, JSON.stringify(watchedAnimes));
        localStorage.setItem(STORAGE_KEY_WATCHLIST, JSON.stringify(watchlistAnimes));
        localStorage.setItem(STORAGE_KEY_BAD, JSON.stringify(badAnimes));
        localStorage.setItem(STORAGE_KEY_NOTES, JSON.stringify(animeNotes));
        localStorage.setItem(STORAGE_KEY_MOMENTS, JSON.stringify(animeMoments));
    };

    const loadData = () => {
        const storedWatched = localStorage.getItem(STORAGE_KEY_WATCHED);
        const storedWatchlist = localStorage.getItem(STORAGE_KEY_WATCHLIST);
        const storedBad = localStorage.getItem(STORAGE_KEY_BAD);
        const storedNotes = localStorage.getItem(STORAGE_KEY_NOTES);
        const storedMoments = localStorage.getItem(STORAGE_KEY_MOMENTS);

        if (storedWatched) { watchedAnimes = JSON.parse(storedWatched); }
        if (storedWatchlist) { watchlistAnimes = JSON.parse(storedWatchlist); }
        if (storedBad) { badAnimes = JSON.parse(storedBad); }
        if (storedNotes) { animeNotes = JSON.parse(storedNotes); }
        if (storedMoments) { animeMoments = JSON.parse(storedMoments); }
    };

    const createMomentRow = (data = { season: '', episode: '', time: '', quote: '' }) => {
        const row = document.createElement('div');
        row.classList.add('moment-row');

        const sInput = document.createElement('input');
        sInput.type = 'text'; sInput.placeholder = 'S'; sInput.value = data.season || '';
        sInput.classList.add('moment-input', 'moment-season');

        const eInput = document.createElement('input');
        eInput.type = 'text'; eInput.placeholder = 'E'; eInput.value = data.episode || '';
        eInput.classList.add('moment-input', 'moment-episode');

        const tInput = document.createElement('input');
        tInput.type = 'text'; tInput.placeholder = '15:52'; tInput.value = data.time || '';
        tInput.classList.add('moment-input', 'moment-time');

        const qInput = document.createElement('input');
        qInput.type = 'text'; qInput.placeholder = '"Zitat / Beschreibung"'; qInput.value = data.quote || '';
        qInput.classList.add('moment-input', 'moment-quote');

        const delBtn = document.createElement('button');
        delBtn.type = 'button'; delBtn.innerHTML = '🗑️'; delBtn.classList.add('delete-moment-btn');
        delBtn.addEventListener('click', () => row.remove());

        row.appendChild(sInput); row.appendChild(eInput); row.appendChild(tInput); row.appendChild(qInput); row.appendChild(delBtn);
        return row;
    };

    const createAnimeListItem = (anime, listType) => {
        const newLi = document.createElement('li');
        const newLink = document.createElement('a');
        newLink.href = anime.link;
        newLink.target = '_blank';
        newLink.textContent = anime.name;
        newLi.appendChild(newLink);

        if (listType === 'watched' || listType === 'bad') {
            addReturnButton(newLi); addDeleteButton(newLi);
        } else if (listType === 'watchlist') {
            addCheckbox(newLi); addBadButton(newLi); addDeleteButton(newLi);
        }
        addNotesFunctionality(newLi, anime.name);
        return newLi;
    };

    const addNotesFunctionality = (li, animeName) => {
        const link = li.querySelector('a');
        const editBtn = document.createElement('span');
        editBtn.classList.add('edit-notes-btn');
        editBtn.textContent = ' 📝';
        li.insertBefore(editBtn, link.nextSibling);

        const notesPopup = document.createElement('div');
        notesPopup.classList.add('anime-notes');
        li.appendChild(notesPopup);

        editBtn.addEventListener('click', (e) => { e.stopPropagation(); openNotesModal(animeName); });
        link.addEventListener('contextmenu', (e) => { e.preventDefault(); openNotesModal(animeName); });

        li.addEventListener('mouseenter', () => {
            const notes = animeNotes[animeName] || '';
            const moments = animeMoments[animeName] || [];

            let textContent = '';
            if (notes.trim()) { textContent += notes.trim(); }

            if (moments.length > 0) {
                if (textContent) textContent += '\n\n';
                textContent += '--- Beste Momente ---\n';
                moments.forEach(m => {
                    let line = '';
                    if (m.season) line += `S${m.season} `;
                    if (m.episode) line += `E${m.episode} `;
                    if (m.time) line += `| ${m.time} `;
                    if (m.quote) line += `| "${m.quote}"`;
                    textContent += line.trim() + '\n';
                });
            }

            if (textContent.trim()) {
                notesPopup.textContent = textContent.trim();
                notesPopup.style.display = 'block';
            }
        });

        li.addEventListener('mouseleave', () => { notesPopup.style.display = 'none'; });
    };

    const openNotesModal = (animeName) => {
        notesModalOverlay.style.display = 'flex';
        modalTitle.textContent = `Notizen für: ${animeName}`;
        notesTextarea.value = animeNotes[animeName] || '';
        notesTextarea.dataset.animeName = animeName;

        momentsContainer.innerHTML = '';
        const moments = animeMoments[animeName] || [];
        moments.forEach(m => { momentsContainer.appendChild(createMomentRow(m)); });

        notesTextarea.focus();
    };

    const closeNotesModal = () => {
        if ('speechSynthesis' in window) { window.speechSynthesis.cancel(); }
        notesModalOverlay.style.display = 'none';
        notesTextarea.value = '';
        notesTextarea.dataset.animeName = '';
        momentsContainer.innerHTML = '';
        readNotesBtn.style.display = 'inline-block';
        if (stopReadBtn) stopReadBtn.style.display = 'none';
    };

    addMomentBtn.addEventListener('click', () => { momentsContainer.appendChild(createMomentRow()); });

    saveNotesBtn.addEventListener('click', () => {
        const animeName = notesTextarea.dataset.animeName;
        const notes = notesTextarea.value.trim();

        if (animeName) {
            if (notes) { animeNotes[animeName] = notes; }
            else { delete animeNotes[animeName]; }

            const momentRows = momentsContainer.querySelectorAll('.moment-row');
            const momentsData = [];

            momentRows.forEach(row => {
                const season = row.querySelector('.moment-season').value.trim();
                const episode = row.querySelector('.moment-episode').value.trim();
                const time = row.querySelector('.moment-time').value.trim();
                const quote = row.querySelector('.moment-quote').value.trim();

                if (season || episode || time || quote) { momentsData.push({ season, episode, time, quote }); }
            });

            if (momentsData.length > 0) { animeMoments[animeName] = momentsData; }
            else { delete animeMoments[animeName]; }

            saveData();
            closeNotesModal();
        }
    });

    closeNotesBtn.addEventListener('click', closeNotesModal);
    notesModalOverlay.addEventListener('click', (e) => { if (e.target === notesModalOverlay) { closeNotesModal(); } });

    readNotesBtn.addEventListener('click', () => {
        const textToRead = notesTextarea.value.trim();
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(textToRead);
            utterance.lang = 'de-DE';
            window.speechSynthesis.speak(utterance);
        } else {
            alert('Sorry, musst selber alles lesen.');
        }
    });

    const renderAnimes = () => {
        document.querySelectorAll('.anime-category').forEach(ul => {
            Array.from(ul.children).forEach(child => {
                if (child.tagName.toLowerCase() === 'li') { child.remove(); }
            });
        });

        const renderSection = (dataList, parentEl, listType) => {
            for (const char in dataList) {
                const categoryUl = parentEl.querySelector(`ul.anime-category h3[data-char="${char}"]`)?.parentNode;
                if (categoryUl) {
                    dataList[char].sort((a, b) => a.name.localeCompare(b.name));
                    dataList[char].forEach(anime => {
                        const li = createAnimeListItem(anime, listType);
                        const addContainer = categoryUl.querySelector('.add-anime-container');
                        if (addContainer) { categoryUl.insertBefore(li, addContainer); }
                        else { categoryUl.appendChild(li); }
                    });
                }
            }
        };

        renderSection(watchedAnimes, watchedAnimeListEl, 'watched');
        renderSection(watchlistAnimes, watchlistAnimeListEl, 'watchlist');
        renderSection(badAnimes, badAnimeListEl, 'bad');
    };

    const addReturnButton = (li) => {
        if (!li.querySelector('.return-btn')) {
            const returnBtn = document.createElement('span');
            returnBtn.textContent = '↩️';
            returnBtn.classList.add('return-btn');
            returnBtn.addEventListener('click', () => {
                const animeName = li.querySelector('a').textContent;
                const animeLink = li.querySelector('a').href;
                const char = animeName.charAt(0).toUpperCase();
                const targetChar = alphabet.includes(char) ? char : '#';
                const parentUl = li.closest('ul.anime-category');

                if (parentUl && parentUl.closest('#watched-anime-list')) {
                    watchedAnimes[targetChar] = watchedAnimes[targetChar].filter(anime => anime.name !== animeName);
                } else if (parentUl && parentUl.closest('#bad-anime-list')) {
                    badAnimes[targetChar] = badAnimes[targetChar].filter(anime => anime.name !== animeName);
                } else { return; }

                watchlistAnimes[targetChar].push({ name: animeName, link: animeLink });
                saveData(); renderAnimes();
            });
            li.appendChild(returnBtn);
        }
    };

    const addCheckbox = (li) => {
        if (!li.querySelector('.watched-btn')) {
            const watchedBtn = document.createElement('span');
            watchedBtn.textContent = '🟩';
            watchedBtn.classList.add('watched-btn');
            watchedBtn.addEventListener('click', () => {
                const animeName = li.querySelector('a').textContent;
                const animeLink = li.querySelector('a').href;
                const char = animeName.charAt(0).toUpperCase();
                const targetChar = alphabet.includes(char) ? char : '#';

                watchlistAnimes[targetChar] = watchlistAnimes[targetChar].filter(anime => anime.name !== animeName);
                watchedAnimes[targetChar].push({ name: animeName, link: animeLink });
                saveData(); renderAnimes();
            });
            li.prepend(watchedBtn);
        }
    };

    const addBadButton = (li) => {
        if (!li.querySelector('.bad-btn')) {
            const badBtn = document.createElement('span');
            badBtn.textContent = '🟥';
            badBtn.classList.add('bad-btn');
            badBtn.addEventListener('click', () => {
                const animeName = li.querySelector('a').textContent;
                const animeLink = li.querySelector('a').href;
                const char = animeName.charAt(0).toUpperCase();
                const targetChar = alphabet.includes(char) ? char : '#';

                watchlistAnimes[targetChar] = watchlistAnimes[targetChar].filter(anime => anime.name !== animeName);
                badAnimes[targetChar].push({ name: animeName, link: animeLink });
                saveData(); renderAnimes();
            });
            li.prepend(badBtn);
        }
    };

    const addDeleteButton = (li) => {
        const deleteBtn = document.createElement('span');
        deleteBtn.textContent = '🗑️';
        deleteBtn.classList.add('delete-btn');
        deleteBtn.addEventListener('click', () => {
            const animeName = li.querySelector('a').textContent;
            if (confirm(`Sind Sie sicher, dass Sie "${animeName}" unwiderruflich löschen möchten?`)) {
                const char = animeName.charAt(0).toUpperCase();
                const targetChar = alphabet.includes(char) ? char : '#';
                const parentUl = li.closest('ul.anime-category');

                if (parentUl && parentUl.closest('#watched-anime-list')) {
                    watchedAnimes[targetChar] = watchedAnimes[targetChar].filter(anime => anime.name !== animeName);
                } else if (parentUl && parentUl.closest('#watchlist-anime-list')) {
                    watchlistAnimes[targetChar] = watchlistAnimes[targetChar].filter(anime => anime.name !== animeName);
                } else if (parentUl && parentUl.closest('#bad-anime-list')) {
                    badAnimes[targetChar] = badAnimes[targetChar].filter(anime => anime.name !== animeName);
                }

                delete animeNotes[animeName];
                delete animeMoments[animeName];
                saveData(); renderAnimes();
            }
        });
        li.appendChild(deleteBtn);
    };

    const addInputAndButton = (categoryUl) => {
        const categoryHeader = categoryUl.querySelector('h3');
        const toggleButton = document.createElement('button');
        toggleButton.textContent = '+';
        toggleButton.classList.add('toggle-add-btn');
        categoryHeader.appendChild(toggleButton);

        const addAnimeContainer = document.createElement('div');
        addAnimeContainer.classList.add('add-anime-container');

        const nameInputGroup = document.createElement('div');
        nameInputGroup.classList.add('input-group');
        const nameInput = document.createElement('input');
        nameInput.type = 'text'; nameInput.placeholder = 'Anime-Name eingeben...';
        nameInput.classList.add('add-anime-input');
        nameInputGroup.appendChild(nameInput);
        addAnimeContainer.appendChild(nameInputGroup);

        const linkInputGroup = document.createElement('div');
        linkInputGroup.classList.add('input-group');
        const linkInput = document.createElement('input');
        linkInput.type = 'url'; linkInput.placeholder = 'Link zum Anime eingeben...';
        linkInput.classList.add('add-anime-input', 'add-anime-link-input');
        linkInputGroup.appendChild(linkInput);
        addAnimeContainer.appendChild(linkInputGroup);

        const button = document.createElement('button');
        button.textContent = 'Hinzufügen';
        button.classList.add('add-anime-btn');

        button.addEventListener('click', () => {
            const animeName = nameInput.value.trim();
            const animeLink = linkInput.value.trim();
            const firstCharOfAnime = animeName.charAt(0).toUpperCase();

            if (animeName && animeLink) {
                const targetCharForAnime = alphabet.includes(firstCharOfAnime) ? firstCharOfAnime : '#';
                const newAnime = { name: animeName, link: animeLink };

                const isWatchlistCategory = categoryUl.closest('#watchlist-anime-list') !== null;
                const isBadCategory = categoryUl.closest('#bad-anime-list') !== null;
                let targetList = isWatchlistCategory ? watchlistAnimes : (isBadCategory ? badAnimes : watchedAnimes);

                targetList[targetCharForAnime].push(newAnime);
                saveData(); renderAnimes();
                nameInput.value = ''; linkInput.value = '';
            } else {
                alert('Bitte füllen Sie beide Felder aus.');
            }
        });

        addAnimeContainer.appendChild(button);
        categoryUl.appendChild(addAnimeContainer);

        toggleButton.addEventListener('click', () => {
            addAnimeContainer.classList.toggle('visible');
            toggleButton.textContent = addAnimeContainer.classList.contains('visible') ? '-' : '+';
        });
    };

    const downloadData = () => {
        const dataToSave = {
            watched: watchedAnimes, watchlist: watchlistAnimes, bad: badAnimes,
            notes: animeNotes, moments: animeMoments
        };
        const jsonStr = JSON.stringify(dataToSave, null, 2);
        const blob = new Blob([jsonStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = 'Anime Liste.json';
        document.body.appendChild(a); a.click(); document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const uploadData = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const uploadedData = JSON.parse(e.target.result);
                    if (uploadedData.watched && uploadedData.watchlist && uploadedData.bad) {
                        watchedAnimes = uploadedData.watched;
                        watchlistAnimes = uploadedData.watchlist;
                        badAnimes = uploadedData.bad;
                        animeNotes = uploadedData.notes || {};
                        animeMoments = uploadedData.moments || {};

                        saveData(); renderAnimes();
                        alert('Anime-Daten erfolgreich geladen!');
                    } else { alert('Ungültige JSON-Datei.'); }
                } catch (error) { alert('Fehler beim Laden: ' + error.message); }
            };
            reader.readAsText(file);
        }
    };

    downloadDataBtn.addEventListener('click', downloadData);
    uploadDataBtn.addEventListener('click', () => uploadDataInput.click());
    uploadDataInput.addEventListener('change', uploadData);

    // Initialisierung
    generateCategoryHTML();
    loadData();
    renderAnimes();
});
