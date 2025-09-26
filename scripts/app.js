'use strict'

let habbits = [];
const HABBIT_KEY = 'HABBIT_KEY';
let globalActiveHabbitId = undefined;

/*page*/
const page = {
    menu: document.querySelector('.menu__list'),
    header: {
        h1: document.querySelector('.h1'),
        progressPercent: document.querySelector('.progress_percent'),
        progressCoverBar: document.querySelector('.progress__cover-bar')
    },
    content: {
        daysContainer: document.getElementById('days'),
        nextDay: document.querySelector('.habbit__day')
    },
    popup: {
        index: document.getElementById('add-habbit_popup'),
        iconField: document.querySelector('.popup__form input[name="icon"]')
    }
}

/* utils */
function togglePopup() {
    if (page.popup.index.classList.contains('cover_hidden')) { //проверка есть ли такой класс в объекте
        page.popup.index.classList.remove('cover_hidden');
    } else  {
        page.popup.index.classList.add('cover_hidden');
    }
};

function resetForm(form, fields) {
    for (const field of fields) {
        form[field].value = '';
    };
}

function validateAndGetFormData(form, fields) {
    const formData = new FormData(form);
    const res = {};
    for (const field of fields) {
        const fieldValue = formData.get(field);
        form[field].classList.remove('error');
        if (!fieldValue) {
            form[field].classList.add('error');
        }
        res[field] = fieldValue;
    };
    let isValid = true;
    for (const field of fields) {
        if (!res[field]) {
            isValid = false;
        }
    };
    if (!isValid) {
        return;
    }
    return res; 
}
function loadData() {
    //все данные по ключу записываем в переменную - просто как строку
    const habbitsString = localStorage.getItem(HABBIT_KEY);

    //преобразуем в массив
    const habbitArray = JSON.parse(habbitsString);
    //проверяем является ли значение массивом (на случай ошибок)
    if (Array.isArray(habbitArray)) {
    //если все ок - записываем в глобальную переменную habbits
        habbits = habbitArray;
    }
};




function saveData() {
    localStorage.setItem(HABBIT_KEY, JSON.stringify(habbits));
}


/* render */


function rerenderMenu(activeHabbit) {
    //если нет ни одного активного меню
    for (const habbit of habbits) {
        const existed = document.querySelector(`[menu-habbit-id="${habbit.id}"]`);
        if (!existed) {
            //создаем элемент
            const element = document.createElement('button');
            //добавляем атрибут для поиска
            element.setAttribute('menu-habbit-id',habbit.id);
            //добавляем класс 
            element.classList.add('menu__item');
            //добавляем обработчик событий. Если на элемент нажали, то - отправляем в rerender
            element.addEventListener('click', () => {
                rerender(habbit.id);

            });
            //добавляем начинку HTML
            element.innerHTML = `<img src="./images/${habbit.icon}.svg" alt="${habbit.name}"/>`;

            if (activeHabbit.id === habbit.id) {
                element.classList.add('menu__item_active');
            };
            page.menu.appendChild(element);
                        
            continue;  
        };
        //проверка действительно ли активное меню/ Если да - добавляем класс для активного меню
        //если нет - удаляем этот класс из элемента
        if (activeHabbit.id === habbit.id) {
            existed.classList.add('menu__item_active');
        } else {
            existed.classList.remove('menu__item_active');
        }
    }

}

function rerenderHead(activeHabbit) {
    page.header.h1.innerText = activeHabbit.name;
    const progress = activeHabbit.days.length / activeHabbit.target > 1 
        ? 100
        : activeHabbit.days.length / activeHabbit.target * 100;
    //toFixed(0) - округление до целого числа. 0 - сколько после запятой оставляем
    page.header.progressPercent.innerText = progress.toFixed(0) + '%';
    page.header.progressCoverBar.setAttribute('style', `width: ${progress}%`);
}

function rerenderContent(activeHabbit) {
    page.content.daysContainer.innerHTML = '';
    for (const index in activeHabbit.days) {
        const element = document.createElement('div');
        element.classList.add('habbit');
        element.innerHTML = (`<div class="habbit__day">День ${Number(index)+1}</div>
                    <div class="habbit__comment">${activeHabbit.days[index].comment}</div>
                    <button onclick = "deleteDay(${Number(index)})" class="habbit__delete">
                        <img src="images/delete.svg" alt="Удалить день ${Number(index)+1}">
                    </button>`);
        page.content.daysContainer.appendChild(element);
    };
    page.content.nextDay.innerText = `День ${activeHabbit.days.length + 1}`;
}

function deleteDay(index) {
    habbits = habbits.map(habbit => {
        if (habbit.id === globalActiveHabbitId) {
            habbit.days.splice(index, 1);
            return {
                ...habbit,
                days: habbit.days
            };
        }
        return habbit;
    });
    rerender(globalActiveHabbitId);
    saveData();
};


function rerender(activeHabbitId) {
    globalActiveHabbitId = activeHabbitId;
    const activeHabbit = habbits.find(habbit => habbit.id === activeHabbitId);
    if (!activeHabbit) {
        return;
    };
    document.location.replace(document.location.pathname + '#' + activeHabbitId);
    rerenderMenu(activeHabbit);
    rerenderHead(activeHabbit);
    rerenderContent(activeHabbit);
}



function newHabbit(event) {
    const form = event.target;
    console.log(form);
}


/*Work with days */
function addDays(event) {
    event.preventDefault(); //игнор дефолтного обращения


    const data = validateAndGetFormData(event.target, ['comment']);
    if (!data) {
        return; 
    };

    habbits = habbits.map(habbit => {
        if (habbit.id === globalActiveHabbitId) { 
            return {
                ...habbit, 
                days: habbit.days.concat([ {comment: data.comment} ])
            }
        }
        return habbit;
    });
    resetForm(event.target, ['comment']);
    rerender(globalActiveHabbitId);
    saveData();
    //data.append()
    //data.getAll('comment')
}

/*Working with habbits*/
function setIcon(context, icon) {
    page.popup.iconField.value = icon;
    const activeIcon = document.querySelector('.icon.icon_active');
    activeIcon.classList.remove('icon_active');
    context.classList.add('icon_active');
}

function addHabbit(event) {
    event.preventDefault();

    const data = validateAndGetFormData(event.target, ['name', 'icon', 'target']);
    if (!data) {
        return; 
    };
    const maxId = habbits.reduce((acc, habbit) => acc > habbit.id ? acc : habbit.id, 0)
    habbits.push({
        id: maxId + 1,
        name: data.name,
        target: data.target, 
        icon: data.icon,
        days: []
    });
    resetForm(event.target, ['name', 'target']);
    togglePopup();
    saveData();
    rerender(maxId + 1);
}
/* init */
//при загрузке веб-страницы запускаем один раз эту функцию
(() => {
    loadData(); //здесь в habbit хранится массив с данными пользователя
    //запускаем функцию с айдишником первого элемента массива 
    // 0: {id: 1, icon: 'sport', name: 'Отжимания', target: 10, days: Array(2)}
    const hashId = Number(document.location.hash.replace('#',''))
    const urlHabbit = habbits.find(habbit => habbit.id == hashId);
    if (urlHabbit) {
        rerender(urlHabbit.id)
    } else {
        rerender(habbits[0].id);
    };
})();
