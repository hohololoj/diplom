const dishesContainer = document.getElementsByClassName('section-menu-body')[0];
const menuNavItems = document.getElementsByClassName('section-menu-nav-item-container');
const dishForm = document.getElementsByClassName('add-dish-form')[0];
const dishes_containers = document.getElementsByClassName('dishes-container');
const editNewsConatiner = document.getElementsByClassName('section-edit-news')[0];
const newsForm = document.getElementsByClassName('add-news-form')[0];
const applications_container = document.getElementsByClassName('section-applications')[0];
const selectDate_buttons = document.getElementsByClassName('tables-date');
const tableInputDate = document.getElementsByClassName('table-input-date')[0];
const tables = document.getElementsByClassName('table');
const tables_container = document.getElementsByClassName('tables-container')[0];
const dishForm_inputs = {
    'id': dishForm.getElementsByClassName('dish-form-input-dish_id')[0],
    'name': dishForm.getElementsByClassName('dish-form-input-name')[0],
    'price': dishForm.getElementsByClassName('dish-form-input-price')[0],
    'img': dishForm.getElementsByClassName('dish-form-input-image')[0],
    'category': dishForm.getElementsByClassName('dish-form-input-category')[0]
}
const newsForm_inputs = {
    'id': newsForm.getElementsByClassName('add-news-form_news-id')[0],
    'date': newsForm.getElementsByClassName('add-news-form_date')[0],
    'title': newsForm.getElementsByClassName('add-news-form_title')[0],
    'img': newsForm.getElementsByClassName('add-news-form_img')[0],
    'content': newsForm.getElementsByClassName('add-news-form_content')[0],
}
function init(){
    let today = new Date();
    let day = today.getDate();
    if(day < 10){day = '0'+day}
    let month = today.getMonth()+1;
    if(month < 10){month = '0'+month}
    getTables(day, month)
    for(let i = 0; i < menuNavItems.length; i++){
        menuNavItems[i].addEventListener('click', function(){
            let category = this.getAttribute('category');
            changeActiveMenuCategory(category);
        })
    }
    selectDate_buttons[0].addEventListener('click', function(){
        hideCurrentDate()
        this.classList.add('tables-date_current')
    })
    selectDate_buttons[1].addEventListener('click', function(){
        hideCurrentDate()
        this.classList.add('tables-date_current')
        //завтра
    })
    selectDate_buttons[2].addEventListener('click', function(){
        hideCurrentDate()
        this.classList.add('tables-date_current')
        //выбрать дату
    })
    tableInputDate.addEventListener('input', function(){
        if(this.length == 10){
            
        }
    })
    updateDishesEvents();
    getDishes();
    getNews();
    getRestores();
}
function hideCurrentDate(){
    document.getElementsByClassName('tables-date_current')[0].classList.remove('tables-date_current');
}
function addNews(){
    let container = document.createElement('div');
    container.classList.add('edit-news-item');
    container.classList.add('edit-news-item_opened');
    container.setAttribute('news_id', '');
    let news_head = document.createElement('div');
    news_head.classList.add('edit-news-head');
        let title_conatiner = document.createElement('div');
        title_conatiner.classList.add('title-container');
            let news_title = document.createElement('input');
            news_title.value = 'Заголовок'
            news_title.classList.add('news-title');
            title_conatiner.appendChild(news_title);
        let date_container = document.createElement('div');
        date_container.classList.add('date-container');
            let news_date = document.createElement('p');
            let today = new Date();
            let day = today.getDate();
            let month = today.getMonth() + 1;
            if(month < 10){
                month = '0'+month;
            }
            let year = today.getFullYear();
            let date = `${day}.${month}.${year}`;
            news_date.innerText = date;
            news_date.classList.add('news-date');
            date_container.appendChild(news_date);
        let delete_img = document.createElement('img');
        delete_img.classList.add('news-edit-control-button');
        delete_img.classList.add('news-delete-button');
        delete_img.src = '../icons/icon-delete.svg';
        delete_img.alt = 'delete';
        let dropdown_img = document.createElement('img');
        dropdown_img.classList.add('news-edit-control-button');
        dropdown_img.classList.add('news-dropdown-button');
        dropdown_img.src = '../icons/icon-drop-down.svg';
        dropdown_img.alt = 'drop-down';
        dropdown_img.setAttribute('state', 'opened');
        let save_img = document.createElement('img');
        save_img.classList.add('news-edit-control-button');
        save_img.classList.add('news-save-button');
        save_img.src = '../icons/icon-save.svg';
        save_img.alt = 'save';
    news_head.appendChild(title_conatiner);
    news_head.appendChild(date_container);
    news_head.appendChild(delete_img);
    news_head.appendChild(dropdown_img);
    news_head.appendChild(save_img);
    let news_body = document.createElement('div');
    news_body.classList.add('edit-news-body');
        let body_container = document.createElement('div');
        body_container.classList.add('edit-news-body-container');
            let news_image = document.createElement('img');
            news_image.src = '../imgs/dish-empty.jpg';
            news_image.alt = 'news-image';
            news_image.classList.add('edit-news-body-img');
            let textarea = document.createElement('textarea');
            textarea.classList.add('edit-news-body-textarea');
            textarea.cols = '30';
            textarea.rows = '10';
        body_container.appendChild(news_image);
        body_container.appendChild(textarea);
    let image_input = document.createElement('input');
    image_input.type = 'file';
    image_input.accept = 'image/png, image/gif, image/jpeg, image/jpg';
    image_input.hidden = true;
    image_input.classList.add('news-image-input');
    news_body.appendChild(body_container);
    news_body.appendChild(image_input);
    container.appendChild(news_head);
    container.appendChild(news_body);
    editNewsConatiner.appendChild(container)
    updateNewsEvents(container);
}
function sendNews(thisNews){
    let id = thisNews.getAttribute('news_id');
    let title = thisNews.getElementsByClassName('news-title')[0].value;
    let date = thisNews.getElementsByClassName('news-date')[0].innerText;
    let image = thisNews.getElementsByClassName('news-image-input')[0].files;
    let content = thisNews.getElementsByClassName('edit-news-body-textarea')[0].value;
    newsForm_inputs.id.value = id;
    newsForm_inputs.title.value = title;
    newsForm_inputs.date.value = date;
    newsForm_inputs.img.files = image;
    newsForm_inputs.content.value = content;
    let form = new FormData(newsForm);
    fetch('/?action=addNews',{
        method: 'POST',
        body: form
    })
    .then(
        function (response){
            response.json().then(function(news_id){
                thisNews.setAttribute('news_id', news_id);
                thisNews.classList.remove('edit-news-item_opened');
            })
        }
    )
}
function updateNewsEvents(container){
    let openButton = container.getElementsByClassName('news-dropdown-button')[0];
    let image = container.getElementsByClassName('edit-news-body-img')[0];
    let saveButton = container.getElementsByClassName('news-save-button')[0];
    let deleteButton = container.getElementsByClassName('news-delete-button')[0];
    deleteButton.addEventListener('click', function(){
        let thisNews_element = this.parentNode.parentNode;
        let thisNews_id = thisNews_element.getAttribute('news_id');
        if(thisNews_id != ''){
            fetch('/?action=deleteNews',{
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json;charset=utf-8'
                },
                body: JSON.stringify({news_id: thisNews_id})
            })
            .then(
                function (response){
                    response.json().then(function(){
                        thisNews_element.parentNode.removeChild(thisNews_element);
                    })
                }
            )
        }
        else{
            thisNews_element.parentNode.removeChild(thisNews_element)
        }
    })
    saveButton.addEventListener('click', function(){
        sendNews(container);
    })
    image.addEventListener('click', function(){
        let imageInput = container.getElementsByClassName('news-image-input')[0];
        imageInput.click();
        imageInput.addEventListener('input', function(){
            let img = this.files[0];
            if(img){
                const reader = new FileReader();
                reader.readAsDataURL(img)
                reader.addEventListener('load', function(){
                    image.src = this.result;
                })
            }
        })
    })
    openButton.addEventListener('click', function(){
        let state = this.getAttribute('state');
        let thisNewsItem = this.parentNode.parentNode;
        if (state == 'closed') {
            thisNewsItem.classList.add('edit-news-item_opened');
            changeState('opened', this);
        }
        else {
            thisNewsItem.classList.remove('edit-news-item_opened');
            changeState('closed', this);
        }
    })
}
function changeActiveMenuCategory(category){
    let currentActive = document.getElementsByClassName('dishes-container_active')[0];
    currentActive.classList.remove('dishes-container_active');
    document.getElementsByClassName(`dishes-container_${category}`)[0].classList.add('dishes-container_active');
}
function getDishMode(dish){
    let mode = 'edit'
    let classList = Array.from(dish.classList);
    if(classList.includes('section-menu-body-item_view')){
        mode = 'view'
    }
    
    return mode;
}
function sendDish(thisDish){
    let dish_id = thisDish.getAttribute('dish_id');
    if(dish_id == undefined){dish_id = null;}
    let name_input = thisDish.getElementsByClassName('section-menu-body-item-input_name')[0];
    let price_input = thisDish.getElementsByClassName('section-menu-body-item-input_price')[0];
    let name = name_input.value;
    let price = price_input.value;
    let image = thisDish.getElementsByClassName('dish-input-image')[0].files;
    let category = thisDish.parentNode.getAttribute('category');
    dishForm_inputs.id.value = dish_id;
    dishForm_inputs.name.value = name;
    dishForm_inputs.price.value = price;
    dishForm_inputs.img.files = image;
    dishForm_inputs.category.value = category;
    let form = new FormData(dishForm);
    
    fetch('?action=dish',{
        method: 'POST',
        // headers: {
        //     'Content-Type': 'multipart/form-data'
        // },
        body: form
    })
    .then(
        function (response){
            response.json().then(function(data){
                let dish_id_response = data.dish_id;
                if(dish_id == ''){thisDish.setAttribute('dish_id', dish_id_response)}
                name_input.readOnly = true;
                price_input.readOnly = true;
                thisDish.classList.remove('section-menu-body-item_edit');
                thisDish.classList.add('section-menu-body-item_view');
            })
        }
    )
}
function updateDishesEvents(){
    let addDish_buttons = document.getElementsByClassName('section-menu-body-item_button-add');
    let editButtons = document.getElementsByClassName('dish-edit-button');
    let dishImages = document.getElementsByClassName('section-menu-body-item-img');
    let saveButtons = document.getElementsByClassName('dish-save-button');
    let imgInputs = document.getElementsByClassName('dish-input-image');
    let deleteDish_buttons = document.getElementsByClassName('delete-dish-button');
    for(let i = 0 ; i < deleteDish_buttons.length; i++){
        deleteDish_buttons[i].addEventListener('click', function(){
            let thisDish = this.parentNode;
            deleteDish(thisDish);
        })
    }
    for(let i = 0; i < addDish_buttons.length; i++){
        addDish_buttons[i].addEventListener('click', addDish)
    }
    for(let i = 0; i < imgInputs.length; i++){
        imgInputs[i].addEventListener('input', function(){
            let thisDish = this.parentNode;
            let thisDish_img = thisDish.getElementsByTagName('img')[0];
            let img = this.files[0];
            if(img){
                const reader = new FileReader();
                reader.readAsDataURL(img)
                reader.addEventListener('load', function(){
                    thisDish_img.src = this.result;
                })
            }
        })
    }
    for(let i = 0; i < saveButtons.length; i++){
        saveButtons[i].addEventListener('click', function(){
            let thisDish = this.parentNode;
            sendDish(thisDish)
        })
    }
    for(let i = 0; i < dishImages.length; i++){
        dishImages[i].addEventListener('click', function(){
            let thisDish = this.parentNode;
            if(getDishMode(thisDish) == 'edit'){
                let imageInput = thisDish.getElementsByClassName('dish-input-image')[0];
                imageInput.click();
            }
        })
    }
    for(let i = 0; i < editButtons.length; i++){
        editButtons[i].addEventListener('click', function(){
            let thisDish = this.parentNode;
            changeDishMode(thisDish);
        })
    }
}
function changeDishMode(thisDish){
    thisDish.classList.remove('section-menu-body-item_view');
    thisDish.classList.add('section-menu-body-item_edit');
    let inputs = thisDish.getElementsByTagName('input');
    for(let i = 0; i < inputs.length; i++){
        inputs[i].readOnly = false;
    }
}
function createNewDishElement(container){
    let item = document.createElement('div');
    item.classList.add('section-menu-body-item');
    item.classList.add('section-menu-body-item_edit');
    item.setAttribute('dish_id', '');

    let dish_img = document.createElement('img');
    dish_img.classList.add('section-menu-body-item-img');
    dish_img.alt = 'img';
    dish_img.src = '../imgs/dish-empty.jpg';

    let input_name = document.createElement('input');
    input_name.type = 'text';
    input_name.classList.add('section-menu-body-item-input');
    input_name.classList.add('section-menu-body-item-input_name');
    input_name.value = 'Название';

    let input_file = document.createElement('input');
    input_file.type = 'file';
    input_file.accept = 'image/png, image/gif, image/jpeg, image/jpg';
    input_file.classList.add('dish-input-image');
    input_file.hidden = true;

    let price_container = document.createElement('div');
    price_container.classList.add('price-container');
    let price_title = document.createElement('p');
    price_title.classList.add('price-title');
    price_title.innerText = 'Стоимость, руб: ';
    let input_price = document.createElement('input');
    input_price.type = 'number';
    input_price.classList.add('section-menu-body-item-input');
    input_price.classList.add('section-menu-body-item-input_price');
    input_price.value = 0;
    price_container.appendChild(price_title);
    price_container.appendChild(input_price);

    let delete_button = document.createElement('button');
    delete_button.classList.add('delete-dish-button');
    let delete_img = document.createElement('img');
    delete_img.src = '../icons/icon-delete.svg';
    delete_img.alt = 'delete';
    delete_button.appendChild(delete_img);

    let edit_button = document.createElement('button');
    edit_button.classList.add('dish-action-button');
    edit_button.classList.add('dish-edit-button');
    edit_button.innerText = 'Редактировать'

    let save_button = document.createElement('button');
    save_button.classList.add('dish-action-button');
    save_button.classList.add('dish-save-button');
    save_button.innerText = 'Сохранить'

    item.appendChild(dish_img);
    item.appendChild(input_name);
    item.appendChild(input_file);
    item.appendChild(price_container);
    item.appendChild(delete_button);
    item.appendChild(edit_button);
    item.appendChild(save_button);

    container.insertBefore(item, container.firstChild);
}
function addDish(){
    let thisDish_container = document.getElementsByClassName('dishes-container_active')[0];
    createNewDishElement(thisDish_container)
    updateDishesEvents()
}
function deleteDish(thisDish){
    let dish_id = thisDish.getAttribute('dish_id');
    if(dish_id != ''){
        fetch('/?action=deleteDish',{
            method: 'POST',
            headers: {
                'Content-Type': 'application/json;charset=utf-8'
            },
            body: JSON.stringify({dish_id: dish_id})
        })
        .then(
            function (response){
                response.json().then(function(data){
                    thisDish.parentNode.removeChild(thisDish)
                })
            }
        )
    }
    else{
        thisDish.parentNode.removeChild(thisDish)
    }
}
function getDishes(){
    fetch('?action=getDishes_admin',{
        method: 'POST',
    })
    .then(
        function (response){
            response.json().then(function(dishes){
                for(let i = 0; i < dishes_containers.length; i++){
                    let thisContainer_category = dishes_containers[i].getAttribute('category');
                    let html = '';
                    for(let j = 0; j < dishes[thisContainer_category].length; j++){
                        html += `
                        <div class="section-menu-body-item section-menu-body-item_view" dish_id="${dishes[thisContainer_category][j].dish_id}">
                            <img src="../${dishes[thisContainer_category][j].img_path.slice(8)}" alt="img" class="section-menu-body-item-img">
                            <input type="text" class="section-menu-body-item-input section-menu-body-item-input_name" value='${dishes[thisContainer_category][j].name}' readonly>
                            <input type="file" class="dish-input-image" accept="image/png, image/gif, image/jpeg" hidden>
                            <div class="price-container">
                                <p class="price-title">Стоимость, руб: </p>
                                <input type="number" max="1000" class="section-menu-body-item-input section-menu-body-item-input_price" value="${dishes[thisContainer_category][j].price}" readonly>
                            </div>
                            <button class="delete-dish-button"><img src="../icons/icon-delete.svg" alt="delete"></button>
                            <button class="dish-action-button dish-edit-button">Редактировать</button>
                            <button class="dish-action-button dish-save-button">Сохранить</button>
                        </div>
                        `
                    }
                    html += `
                        <div class="section-menu-body-item section-menu-body-item_button-add">
                            <p class="button-text">Добавить позицию</p>
                            <img src="../icons/icon-add.svg" alt="add">
                        </div>
                        `
                        dishes_containers[i].innerHTML = html
                }
                let addDish_buttons = document.getElementsByClassName('section-menu-body-item_button-add');
                for(let i = 0; i < addDish_buttons.length; i++){
                    addDish_buttons[i].addEventListener('click', addDish);
                }
                let dish_images = document.getElementsByClassName('section-menu-body-item-img');
                for(let i = 0; i < dish_images.length; i++){
                    dish_images[i].addEventListener('click', function(){
                        let input_file = this.parentNode.getElementsByClassName('dish-input-image')[0];
                        input_file.click();
                        input_file.addEventListener('input', function(){
                            let img = this.files[0];
                            if(img){
                                const reader = new FileReader();
                                reader.readAsDataURL(img)
                                reader.addEventListener('load', function(){
                                    dish_images[i].src = this.result;
                                })
                            }
                        })
                    })
                }
                let editDish_buttons = document.getElementsByClassName('dish-edit-button');
                for(let i = 0; i < editDish_buttons.length; i++){
                    editDish_buttons[i].addEventListener('click', function(){
                        let thisDish = this.parentNode;
                        thisDish.classList.remove('section-menu-body-item_view');
                        thisDish.classList.add('section-menu-body-item_edit');
                        let saveButton = thisDish.getElementsByClassName('dish-save-button')[0];
                        let input_name = thisDish.getElementsByClassName('section-menu-body-item-input_name')[0];
                        let input_price = thisDish.getElementsByClassName('section-menu-body-item-input_price')[0];
                        input_name.readOnly = false;
                        input_price.readOnly = false;
                        saveButton.addEventListener('click', function(){
                            let thisDish = this.parentNode;
                            sendDish(thisDish)
                        })
                    })
                }
                let deleteDish_buttons = document.getElementsByClassName('delete-dish-button');
                for(let i = 0; i < deleteDish_buttons.length; i++){
                    deleteDish_buttons[i].addEventListener('click', function(){
                        let thisDish = this.parentNode;
                        deleteDish(thisDish);
                    })
                }
            })
        }
    )
}
function initNewsEvents(){
    let saveButtons = document.getElementsByClassName('news-save-button');
    let news_imgs = document.getElementsByClassName('edit-news-body-img');
    let deleteButtons = document.getElementsByClassName('news-delete-button');
    for(let i = 0; i < deleteButtons.length; i++){
        deleteButtons[i].addEventListener('click', function(){
            let thisNews_element = this.parentNode.parentNode;
            let thisNews_id = thisNews_element.getAttribute('news_id');
            fetch('/?action=deleteNews',{
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json;charset=utf-8'
                },
                body: JSON.stringify({news_id: thisNews_id})
            })
            .then(
                function (response){
                    response.json().then(function(){
                        thisNews_element.parentNode.removeChild(thisNews_element);
                    })
                }
            )
        })
    }
    for(let i = 0; i < saveButtons.length; i++){
        saveButtons[i].addEventListener('click', function(){
            let thisNews = this.parentNode.parentNode;
            sendNews(thisNews)
        })
    }
    for(let i  = 0; i < news_imgs.length; i++){
        news_imgs[i].addEventListener('click', function(){
            this.parentNode.parentNode.getElementsByClassName('news-image-input')[0].click();
            this.parentNode.parentNode.getElementsByClassName('news-image-input')[0].addEventListener('input', function(){
                let img = this.files[0];
                if(img){
                    const reader = new FileReader();
                    reader.readAsDataURL(img)
                    reader.addEventListener('load', function(){
                        news_imgs[i].src = this.result;
                    })
                }
            })
        })
    }
}
function getNews(){
    fetch('/?action=getNews_admin',{
        method: 'POST',
        headers: {
            'Content-Type': 'application/json;charset=utf-8'
        }
    })
    .then(
        function (response){
            response.json().then(function(news){
                let html = '';
                for(let i = 0; i < news.length; i++){
                    html += `
                    <div class="edit-news-item" news_id="${news[i].news_id}">
                        <div class="edit-news-head">
                            <div class="title-container"><input class="news-title" value="${news[i].title}"></div>
                            <div class="date-container">
                                <p class="news-date">${news[i].date}</p>
                            </div><img class="news-edit-control-button news-delete-button" src="../icons/icon-delete.svg" alt="delete"><img
                                class="news-edit-control-button news-dropdown-button" src="../icons/icon-drop-down.svg" alt="drop-down"
                                state="opened"><img class="news-edit-control-button news-save-button" src="../icons/icon-save.svg"
                                alt="save">
                        </div>
                        <div class="edit-news-body">
                            <div class="edit-news-body-container"><img src="../${news[i].img_path.slice(7)}" alt="news-image"
                                    class="edit-news-body-img"><textarea class="edit-news-body-textarea" cols="30" rows="10">${news[i].content}</textarea>
                            </div><input type="file" accept="image/png, image/gif, image/jpeg, image/jpg" hidden=""
                                class="news-image-input">
                        </div>
                    </div>
                    `
                }
                editNewsConatiner.innerHTML += html;
                initDropDownEvents();
                initNewsEvents();
                let addNews_button = document.getElementsByClassName('add-news-button')[0];
                addNews_button.addEventListener('click', addNews);
            })
        }
    )
}
function getRestores(){
    fetch('/?action=getRestores',{
        method: 'POST',
    })
    .then(
        function (response){
            response.json().then(function(response){
                let html = '';
                for(let i = 0; i < response.length; i++){
                    if(response[i].type == 'changeData'){
                        html += `
                        <div class="application-item" aid="${response[i].aid}">
                            <div class="application-item-head">
                                <p class="application-type">Заявка на смену данных</p>
                                <img src="../icons/icon-accept.svg" alt="" class="application-control-button application-accept-button">
                                <img src="../icons/icon-cancel.svg" alt="" class="application-control-button application-cancel-button">
                            </div>
                            <div class="application-item-body">
                                <div class="application-item-body-content application-item-body-content_change-data">
                                    <div class="data-container">
                                        <p class="data surname">${response[i].surname_from}</p>
                                        <p class="data name">${response[i].name_from}</p>
                                        <p class="data phone">${response[i].phone_from}</p>
                                    </div>
                                    <div class="arrow-container">
                                        <img src="../icons/icon-arrow_to.svg" alt="arrow_to">
                                    </div>
                                    <div class="data-container">
                                        <p class="data surname">${response[i].surname_to}</p>
                                        <p class="data name">${response[i].name_to}</p>
                                        <p class="data phone">${response[i].phone_to}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        `
                    }
                    else{
                        html += `
                        <div class="application-item" aid="${response[i].aid}">
                            <div class="application-item-head">
                                <p class="application-type">Заявка на смену пароля</p>
                                <img src="../icons/icon-accept.svg" alt="" class="application-control-button application-accept-button">
                                <img src="../icons/icon-cancel.svg" alt="" class="application-control-button application-cancel-button">
                            </div>
                            <div class="application-item-body">
                                <div class="application-item-body-content application-item-body-content_change-password">
                                    <div class="data-container">
                                        <p class="data surname">${response[i].surname}</p>
                                        <p class="data name">${response[i].name}</p>
                                        <p class="data phone">${response[i].phone}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        `
                    }
                }
                applications_container.innerHTML = html;
                let accept_buttons = document.getElementsByClassName('application-accept-button');
                let cancel_buttons = document.getElementsByClassName('application-cancel-button');
                for(let i = 0; i < accept_buttons.length; i++){
                    accept_buttons[i].addEventListener('click', function(){
                        let container = this.parentNode.parentNode;
                        let aid = container.getAttribute('aid');
                        fetch('/?action=acceptRestore',{
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json;charset=utf-8'
                            },
                            body: JSON.stringify({aid: aid})
                        })
                        .then(
                            function (response){
                                response.json().then(function(){
                                    container.parentNode.removeChild(container);
                                })
                            }
                        )
                    })
                    cancel_buttons[i].addEventListener('click', function(){
                        let container = this.parentNode.parentNode;
                        let aid = container.getAttribute('aid');
                        fetch('/?action=cancelRestore',{
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json;charset=utf-8'
                            },
                            body: JSON.stringify({aid: aid})
                        })
                        .then(
                            function (response){
                                response.json().then(function(){
                                    container.parentNode.removeChild(container);
                                })
                            }
                        )
                    })
                }
            })
        }
    )
}
function getTables(day, month){
    let date = {
        day: day,
        month: month
    }
    fetch('/?action=getTables',{
        method: 'POST',
        headers: {
            'Content-Type': 'application/json;charset=utf-8'
        },
        body: JSON.stringify(date)
    })
    .then(
        function (response){
            response.json().then(function(tables){
                console.log(tables)
                let html = '';
                for(let i = 0; i < 7; i++){
                    let table_html = `
                    <div class="table">
                        <div class="table-head">
                            <p class="table-head-content">Стол №${i+1}</p>
                        </div>
                        <div class="table-body">
                            <p class="table-body-status table-body-status_booked table-body-status_shown">${tables['table'+(i+1)].length > 0? 'Забронирован:': 'Стол не забронирован'}</p>
                            <div class="table-book-info-container">`;
                            for(let j = 0; j < tables['table'+(i+1)].length; j++){
                                table_html += `
                                    <p class="table-book-info">${tables['table'+(i+1)][j].time} ${tables['table'+(i+1)][j].person} <img src="./icons/icon-delete.svg" alt="delete" class="table-book-delete-button" tableid="${tables['table'+(i+1)][j].id}"></p>
                                `;
                            }
                    table_html += `
                        </div>
                    </div>
                </div>`;
                    html += table_html;
                }
                tables_container.innerHTML = html;
                let tableUnbook_buttons = document.getElementsByClassName('table-book-delete-button');
                for(let i = 0; i < tableUnbook_buttons.length; i++){
                    tableUnbook_buttons[i].addEventListener('click', function(){
                        let books_container = this.parentNode.parentNode;
                        let thisBook = this.parentNode;
                        let books = books_container.getElementsByTagName('p');
                        let table_id = this.getAttribute('tableid');
                        fetch('/?action=unbook',{
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json;charset=utf-8'
                            },
                            body: JSON.stringify({table_id: table_id})
                        })
                        .then(
                            function (response){
                                if(books.length == 1){
                                    let tableStatus = books_container.parentNode.getElementsByClassName('table-body-status')[0];
                                    tableStatus.innerText = 'Стол не забронирован';
                                }
                                books_container.removeChild(thisBook);
                            }
                        )
                    })
                }
            })
        }
    )
}
init();