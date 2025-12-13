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

    const STORAGE_KEY_WATCHED = 'animes_watched';
    const STORAGE_KEY_WATCHLIST = 'animes_watchlist';
    const STORAGE_KEY_BAD = 'animes_bad';

    let watchedAnimes = {};
    let watchlistAnimes = {};
    let badAnimes = {};

    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';

    alphabet.split('').forEach(char => {
        watchedAnimes[char] = [];
        watchlistAnimes[char] = [];
        badAnimes[char] = [];
    });
    watchedAnimes['#'] = [];
    watchlistAnimes['#'] = [];
    badAnimes['#'] = [];

    const STORAGE_KEY_NOTES = 'anime_notes';
    let animeNotes = {};

    const saveData = () => {
        localStorage.setItem(STORAGE_KEY_WATCHED, JSON.stringify(watchedAnimes));
        localStorage.setItem(STORAGE_KEY_WATCHLIST, JSON.stringify(watchlistAnimes));
        localStorage.setItem(STORAGE_KEY_BAD, JSON.stringify(badAnimes));
        localStorage.setItem(STORAGE_KEY_NOTES, JSON.stringify(animeNotes));
    };

    const loadData = () => {
        const storedWatched = localStorage.getItem(STORAGE_KEY_WATCHED);
        const storedWatchlist = localStorage.getItem(STORAGE_KEY_WATCHLIST);
        const storedBad = localStorage.getItem(STORAGE_KEY_BAD);
        const storedNotes = localStorage.getItem(STORAGE_KEY_NOTES);

        if (storedWatched) {
            watchedAnimes = JSON.parse(storedWatched);
        }
        if (storedWatchlist) {
            watchlistAnimes = JSON.parse(storedWatchlist);
        }
        if (storedBad) {
            badAnimes = JSON.parse(storedBad);
        }
        if (storedNotes) {
            animeNotes = JSON.parse(storedNotes);
        }
    };

    const createAnimeListItem = (anime, listType) => {
        const newLi = document.createElement('li');
        const newLink = document.createElement('a');
        newLink.href = anime.link;
        newLink.target = '_blank';
        newLink.textContent = anime.name;
        newLi.appendChild(newLink);

        if (listType === 'watched' || listType === 'bad') {
            addReturnButton(newLi);
            addDeleteButton(newLi);
        } else if (listType === 'watchlist') {
            addCheckbox(newLi);
            addBadButton(newLi);
            addDeleteButton(newLi);
        }
        
        addNotesFunctionality(newLi, anime.name);
        
        return newLi;
    };
    
    const addNotesFunctionality = (li, animeName) => {
        const link = li.querySelector('a');
        const editBtn = document.createElement('span');
        editBtn.classList.add('edit-notes-btn');
        li.insertBefore(editBtn, link.nextSibling);
        const notesPopup = document.createElement('div');
        notesPopup.classList.add('anime-notes');
        li.appendChild(notesPopup);
        
        editBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            openNotesModal(animeName);
        });

        link.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            openNotesModal(animeName);
        });
        
        li.addEventListener('mouseenter', () => {
            const notes = animeNotes[animeName] || '';
            if (notes.trim()) {
                notesPopup.textContent = notes;
                notesPopup.style.display = 'block';
            }
        });

        li.addEventListener('mouseleave', () => {
            notesPopup.style.display = 'none';
        });
    };
    
    const openNotesModal = (animeName) => {
        notesModalOverlay.style.display = 'flex';
        modalTitle.textContent = `Notizen für: ${animeName}`;
        notesTextarea.value = animeNotes[animeName] || '';
        notesTextarea.focus();
        notesTextarea.dataset.animeName = animeName;
    };
    
    const closeNotesModal = () => {
        window.speechSynthesis.cancel(); // Bestehende Sprachausgabe stoppen
        notesModalOverlay.style.display = 'none';
        notesTextarea.value = '';
        notesTextarea.dataset.animeName = '';
        // Buttons auf den Standardzustand zurücksetzen
        readNotesBtn.style.display = 'inline-block';
        stopReadBtn.style.display = 'none';
    };

    saveNotesBtn.addEventListener('click', () => {
        const animeName = notesTextarea.dataset.animeName;
        const notes = notesTextarea.value.trim();
        if (animeName) {
            if (notes) {
                animeNotes[animeName] = notes;
            } else {
                delete animeNotes[animeName];
            }
            saveData();
            closeNotesModal();
        }
    });

    closeNotesBtn.addEventListener('click', closeNotesModal);
    
    notesModalOverlay.addEventListener('click', (e) => {
        if (e.target === notesModalOverlay) {
            closeNotesModal();
        }
    });

    // Funktionalität zum Vorlesen des Textes hinzufügen
    readNotesBtn.addEventListener('click', () => {
        const textToRead = notesTextarea.value.trim();
        
        // Überprüfen, ob der Browser die Web Speech API unterstützt
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(textToRead);
            utterance.lang = 'de-DE';
            window.speechSynthesis.speak(utterance);
        } else {
            alert('Sorry musst selber alles Lesen, oder nutze anderen Browser (z. B. Brave).');
        }
    });
    
    const renderAnimes = () => {
        document.querySelectorAll('.anime-category').forEach(ul => {
            Array.from(ul.children).forEach(child => {
                if (child.tagName.toLowerCase() === 'li') {
                    child.remove();
                }
            });
        });

        for (const char in watchedAnimes) {
            const categoryUl = watchedAnimeListEl.querySelector(`ul.anime-category h3[data-char="${char}"]`)?.parentNode;
            if (categoryUl) {
                watchedAnimes[char].sort((a, b) => a.name.localeCompare(b.name));
                watchedAnimes[char].forEach(anime => {
                    const li = createAnimeListItem(anime, 'watched');
                    const addContainer = categoryUl.querySelector('.add-anime-container');
                    if (addContainer) {
                        categoryUl.insertBefore(li, addContainer);
                    } else {
                        categoryUl.appendChild(li);
                    }
                });
            }
        }

        for (const char in watchlistAnimes) {
            const categoryUl = watchlistAnimeListEl.querySelector(`ul.anime-category h3[data-char="${char}"]`)?.parentNode;
            if (categoryUl) {
                watchlistAnimes[char].sort((a, b) => a.name.localeCompare(b.name));
                watchlistAnimes[char].forEach(anime => {
                    const li = createAnimeListItem(anime, 'watchlist');
                    const addContainer = categoryUl.querySelector('.add-anime-container');
                    if (addContainer) {
                        categoryUl.insertBefore(li, addContainer);
                    } else {
                        categoryUl.appendChild(li);
                    }
                });
            }
        }

        for (const char in badAnimes) {
            const categoryUl = badAnimeListEl.querySelector(`ul.anime-category h3[data-char="${char}"]`)?.parentNode;
            if (categoryUl) {
                badAnimes[char].sort((a, b) => a.name.localeCompare(b.name));
                badAnimes[char].forEach(anime => {
                    const li = createAnimeListItem(anime, 'bad');
                    const addContainer = categoryUl.querySelector('.add-anime-container');
                    if (addContainer) {
                        categoryUl.insertBefore(li, addContainer);
                    } else {
                        categoryUl.appendChild(li);
                    }
                });
            }
        }
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
                } else {
                    return; 
                }

                const newAnime = { name: animeName, link: animeLink };
                const currentWatchlist = watchlistAnimes[targetChar];
                let inserted = false;
                for (let i = 0; i < currentWatchlist.length; i++) {
                    if (newAnime.name.localeCompare(currentWatchlist[i].name) < 0) {
                        currentWatchlist.splice(i, 0, newAnime);
                        inserted = true;
                        break;
                    }
                }
                if (!inserted) {
                    currentWatchlist.push(newAnime);
                }
                
                saveData();
                renderAnimes();
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
                
                const firstCharOfAnime = animeName.charAt(0).toUpperCase();
                const targetChar = alphabet.includes(firstCharOfAnime) ? firstCharOfAnime : '#';

                watchlistAnimes[targetChar] = watchlistAnimes[targetChar].filter(anime => anime.name !== animeName);

                const newAnime = { name: animeName, link: animeLink };
                const currentWatchedList = watchedAnimes[targetChar];
                let inserted = false;
                for (let i = 0; i < currentWatchedList.length; i++) {
                    if (newAnime.name.localeCompare(currentWatchedList[i].name) < 0) {
                        currentWatchedList.splice(i, 0, newAnime);
                        inserted = true;
                        break;
                    }
                }
                if (!inserted) {
                    currentWatchedList.push(newAnime);
                }
                
                saveData();
                renderAnimes();
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
                
                const firstCharOfAnime = animeName.charAt(0).toUpperCase();
                const targetChar = alphabet.includes(firstCharOfAnime) ? firstCharOfAnime : '#';

                watchlistAnimes[targetChar] = watchlistAnimes[targetChar].filter(anime => anime.name !== animeName);

                const newAnime = { name: animeName, link: animeLink };
                const currentBadList = badAnimes[targetChar];
                let inserted = false;
                for (let i = 0; i < currentBadList.length; i++) {
                    if (newAnime.name.localeCompare(currentBadList[i].name) < 0) {
                        currentBadList.splice(i, 0, newAnime);
                        inserted = true;
                        break;
                    }
                }
                if (!inserted) {
                    currentBadList.push(newAnime);
                }
                
                saveData();
                renderAnimes();
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
            
            const confirmation = confirm(`Sind Sie sicher, dass Sie "${animeName}" unwiderruflich löschen möchten?`);
            
            if (confirmation) {
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
                
                saveData();
                renderAnimes();
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
        nameInput.type = 'text';
        nameInput.placeholder = 'Anime-Name eingeben...';
        nameInput.classList.add('add-anime-input');
        nameInputGroup.appendChild(nameInput);
        addAnimeContainer.appendChild(nameInputGroup);

        const linkInputGroup = document.createElement('div');
        linkInputGroup.classList.add('input-group');
        const linkInput = document.createElement('input');
        linkInput.type = 'url';
        linkInput.placeholder = 'Link zum Anime eingeben...';
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
            
            const categoryChar = categoryUl.querySelector('h3').dataset.char;

            if (animeName) {
                if (categoryChar === '#') {
                    if (!numbers.includes(animeName.charAt(0))) {
                        if (alphabet.includes(firstCharOfAnime)) {
                            alert('Fehler ID10T');
                            nameInput.value = '';
                            linkInput.value = '';
                            return;
                        }
                    }
                } else {
                    if (firstCharOfAnime !== categoryChar && alphabet.includes(firstCharOfAnime)) {
                        alert('Fehler ID10T');
                        nameInput.value = '';
                        linkInput.value = '';
                        return;
                    }
                }
            }

            if (animeName && animeLink) {
                const targetCharForAnime = alphabet.includes(firstCharOfAnime) ? firstCharOfAnime : '#';

                const newAnime = { name: animeName, link: animeLink };
                
                const isWatchlistCategory = categoryUl.closest('#watchlist-anime-list') !== null;
                const isBadCategory = categoryUl.closest('#bad-anime-list') !== null;

                let targetList;
                if (isWatchlistCategory) {
                    targetList = watchlistAnimes;
                } else if (isBadCategory) {
                    targetList = badAnimes;
                } else {
                    targetList = watchedAnimes;
                }

                const currentCategoryList = targetList[targetCharForAnime];
                
                if (!currentCategoryList) {
                    console.error(`Kategorie für '${targetCharForAnime}' in der Liste nicht gefunden.`);
                    alert('Ein interner Fehler ist aufgetreten (Kategorie nicht gefunden).');
                    nameInput.value = '';
                    linkInput.value = '';
                    return;
                }

                let inserted = false;
                for (let i = 0; i < currentCategoryList.length; i++) {
                    if (newAnime.name.localeCompare(currentCategoryList[i].name) < 0) {
                        currentCategoryList.splice(i, 0, newAnime);
                        inserted = true;
                        break;
                    }
                }
                if (!inserted) {
                    currentCategoryList.push(newAnime);
                }
                
                saveData();
                renderAnimes();

                nameInput.value = '';
                linkInput.value = '';
            } else {
                alert('Bitte füllen Sie beide Felder aus.');
            }
        });

        nameInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                button.click();
            }
        });

        linkInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                button.click();
            }
        });

        addAnimeContainer.appendChild(button);
        categoryUl.appendChild(addAnimeContainer);

        toggleButton.addEventListener('click', () => {
            addAnimeContainer.classList.toggle('visible');
            if (addAnimeContainer.classList.contains('visible')) {
                toggleButton.textContent = '-';
            } else {
                toggleButton.textContent = '+';
            }
        });
    };

    const extractInitialDataFromHtml = () => {
        const initialWatched = {};
        const initialWatchlist = {};
        const initialBad = {};

        alphabet.split('').forEach(char => {
            initialWatched[char] = [];
            initialWatchlist[char] = [];
            initialBad[char] = [];
        });
        initialWatched['#'] = [];
        initialWatchlist['#'] = [];
        initialBad['#'] = [];


        watchedAnimeListEl.querySelectorAll('ul.anime-category').forEach(categoryUl => {
            const char = categoryUl.querySelector('h3').textContent.trim().charAt(0).toUpperCase();
            const targetChar = alphabet.includes(char) ? char : '#';
            if (initialWatched[targetChar]) {
                categoryUl.querySelectorAll('li').forEach(li => {
                    const linkEl = li.querySelector('a');
                    if (linkEl && linkEl.textContent.trim()) {
                        initialWatched[targetChar].push({
                            name: linkEl.textContent.trim(),
                            link: linkEl.href
                        });
                    }
                });
            }
        });

        watchlistAnimeListEl.querySelectorAll('ul.anime-category').forEach(categoryUl => {
            const char = categoryUl.querySelector('h3').textContent.trim().charAt(0).toUpperCase();
            const targetChar = alphabet.includes(char) ? char : '#';
             if (initialWatchlist[targetChar]) {
                categoryUl.querySelectorAll('li').forEach(li => {
                    const linkEl = li.querySelector('a');
                    if (linkEl && linkEl.textContent.trim()) {
                        initialWatchlist[targetChar].push({
                            name: linkEl.textContent.trim(),
                            link: linkEl.href
                        });
                    }
                });
            }
        });

        badAnimeListEl.querySelectorAll('ul.anime-category').forEach(categoryUl => {
            const char = categoryUl.querySelector('h3').textContent.trim().charAt(0).toUpperCase();
            const targetChar = alphabet.includes(char) ? char : '#';
            if (initialBad[targetChar]) {
                categoryUl.querySelectorAll('li').forEach(li => {
                    const linkEl = li.querySelector('a');
                    if (linkEl && linkEl.textContent.trim()) {
                        initialBad[targetChar].push({
                            name: linkEl.textContent.trim(),
                            link: linkEl.href
                        });
                    }
                });
            }
        });

        return { initialWatched, initialWatchlist, initialBad };
    };

    const downloadData = () => {
        const dataToSave = {
            watched: watchedAnimes,
            watchlist: watchlistAnimes,
            bad: badAnimes,
            notes: animeNotes
        };
        const filename = 'Anime Liste.json';
        const jsonStr = JSON.stringify(dataToSave, null, 2);

        const blob = new Blob([jsonStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
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
                        if (uploadedData.notes) {
                            animeNotes = uploadedData.notes;
                        } else {
                            animeNotes = {};
                        }
                        saveData();
                        renderAnimes();
                        alert('Anime erfolgreich geladen!');
                    } else {
                        alert('Üngiltiger JSON Datei. Sichere das "watched", "watchlist" und "bad" in der Liste gibt.');
                    }
                } catch (error) {
                    alert('Error ID10T: ' + error.message);
                }
            };
            reader.readAsText(file);
        }
    };

    downloadDataBtn.addEventListener('click', downloadData);
    uploadDataBtn.addEventListener('click', () => uploadDataInput.click());
    uploadDataInput.addEventListener('change', uploadData);

    document.querySelectorAll('.anime-category h3').forEach(h3 => {
        const char = h3.textContent.trim().charAt(0).toUpperCase();
        if (alphabet.includes(char)) {
             h3.dataset.char = char;
        } else {
             h3.dataset.char = '#';
        }
    });

    loadData();

    if (Object.values(watchedAnimes).every(arr => arr.length === 0) &&
        Object.values(watchlistAnimes).every(arr => arr.length === 0) &&
        Object.values(badAnimes).every(arr => arr.length === 0)) {
        console.log("Keine Daten im localStorage, standart Code aus HTML wird angewendet.");
        const initialData = extractInitialDataFromHtml();
        watchedAnimes = initialData.initialWatched;
        watchlistAnimes = initialData.initialWatchlist;
        badAnimes = initialData.initialBad;
        saveData();
    } else {
        console.log("Daten aus localStorage geladen.");
    }

    renderAnimes();

    document.querySelectorAll('.anime-category').forEach(categoryUl => {
        addInputAndButton(categoryUl);
    });
});