const input_password_register = document.getElementsByClassName('register-input-password')[0];
const showPassword_buttons = document.getElementsByClassName('password-action-show');
const hidePassword_buttons = document.getElementsByClassName('password-action-hide');
const input_date = document.getElementsByClassName('modal-input_date');
const input_phone = document.getElementsByClassName('register-input-phone')[0];
const register_button = document.getElementsByClassName('register-button')[0];
const register_title = document.getElementsByClassName('modal-content-title_register')[0];
const login_title = document.getElementsByClassName('modal-content-title_login')[0];
const loginButton = document.getElementsByClassName('login-button')[0];
const wantToRegister_button = document.getElementsByClassName('want-to-register');
const modalContent_register = document.getElementsByClassName('modal-content-register')[0];
const wantToLogin_button = document.getElementsByClassName('want-to-login');
const modalContent_login = document.getElementsByClassName('modal-content-login')[0];
const wantToChangePassword_button = document.getElementsByClassName('want-to-change-password')[0];
const modalContent_changePassword = document.getElementsByClassName('modal-content-restore')[0];
const account_button = document.getElementsByClassName('auth-button')[0];
const modalWindow_login = document.getElementsByClassName('modal-login')[0];
const restoreButton = document.getElementsByClassName('restore-button')[0];
const restore_title = document.getElementsByClassName('modal-content-title_restore')[0];
const button_ok = document.getElementsByClassName('button-ok')[0];
const modalContent_success = document.getElementsByClassName('modal-content_success')[0];

let action_before;

button_ok.addEventListener('click', function(){
    let currentModal = document.getElementsByClassName('modal_shown')[0];
    currentModal.classList.remove('modal_shown');
    modalContent_success.classList.remove('modal-content_shown');
    modalContent_login.classList.add('modal-content_shown');
})

restoreButton.addEventListener('click', function(){
    let errors = document.getElementsByClassName('modal-input_error');
    for(let i = 0; i < errors.length; i++){
        errors[i].classList.remove('modal-input_error');
    }
    let inputs = this.parentNode.getElementsByTagName('input');
    let data_toSend = {
        surname: inputs[0].value,
        name: inputs[1].value,
        phone: inputs[2].value,
        date: inputs[3].value,
        login: inputs[4].value,
        newpass: inputs[5].value
    }
    fetch('/?action=changePassword',{
        method: 'POST',
        headers: {
            'Content-Type': 'application/json;charset=utf-8'
        },
        body: JSON.stringify(data_toSend)
    })
    .then(
        function (response){
            response.json().then(function(response){
                if(response.status == 'error'){
                    switch(response.code){
                        case 0:{
                            inputs[5].classList.add('modal-input_error');
                            restore_title.innerText = 'Введите пароль';
                            break;
                        }
                        case 1:{
                            restore_title.innerText = 'Введенные данные не совпадают с предыдущими';
                            break;
                        }
                    }
                }
                else{
                    let currents = document.getElementsByClassName('modal-content_shown');
                    for(let i = 0; i < currents.length; i++){
                        currents[i].classList.remove('modal-content_shown');
                    }
                    modalContent_success.classList.add('modal-content_shown');
                }
            })
        }
    )
})

account_button.addEventListener('click', function(){
    action_before = 'account';
    fetch('/?action=checkToken',{
        method: 'POST'
    })
    .then(
        function (response){
            response.json().then(function(token){
                console.log(token.exists)
                if(token.exists){
                    window.location.href = '/account';
                }
                else{
                    modalWindow_login.classList.add('modal_shown');
                }
            })
        }
    )
})

wantToChangePassword_button.addEventListener('click', function(){
    let currentContent = document.getElementsByClassName('modal-content_shown')[0];
    currentContent.classList.remove('modal-content_shown');
    modalContent_changePassword.classList.add('modal-content_shown');
})

for(let i = 0; i < wantToLogin_button.length; i++){
    wantToLogin_button[i].addEventListener('click', function(){
        let currentContent = document.getElementsByClassName('modal-content_shown')[0];
        currentContent.classList.remove('modal-content_shown');
        modalContent_login.classList.add('modal-content_shown');
    })
}

for(let i  = 0; i < wantToRegister_button.length; i++){
    wantToRegister_button[i].addEventListener('click', function(){
        let currentContent = document.getElementsByClassName('modal-content_shown')[0];
        currentContent.classList.remove('modal-content_shown');
        modalContent_register.classList.add('modal-content_shown');
    })
}

document.addEventListener('keyup', function(e){
    if(e.key == 'Escape'){
        let modal = document.getElementsByClassName('modal_shown')[0];
        modal.classList.remove('modal_shown');
    }
})

for(let i = 0; i < showPassword_buttons.length; i++){
    showPassword_buttons[i].addEventListener('click', function(){
        let thisInput = this.parentNode.getElementsByClassName('modal-input_password')[0];
        thisInput.type = 'text';
        thisInput.parentNode.classList.add('password-container_shown');
    })
}
for(let i = 0; i < hidePassword_buttons.length; i++){
    hidePassword_buttons[i].addEventListener('click', function(){
        let thisInput = this.parentNode.getElementsByClassName('modal-input_password')[0];
        thisInput.type = 'password';
        thisInput.parentNode.classList.remove('password-container_shown');
    })
}

for(let i = 0; i < input_date.length; i++){
    input_date[i].addEventListener('keydown', function(e){
        if(this.value.length == 2 && e.key != 'Backspace'){this.value = this.value+'.'}
        if(this.value.length == 5 && e.key != 'Backspace'){this.value = this.value+'.'}
    })
}

input_phone.addEventListener('input', function(){
    let value = this.value;
    this.value = value.replace(/\+7/, '8');
})

register_button.addEventListener('click', function(){
    let errors = document.getElementsByClassName('modal-input_error');
    for(let i = 0; i < errors.length; i++){
        errors[i].classList.remove('modal-input_error');
    }
    let inputs = document.getElementsByClassName('modal-content-register')[0].getElementsByTagName('input');
    let thisUser = {
        surname: inputs[0].value,
        name: inputs[1].value,
        phone: inputs[2].value,
        date: inputs[3].value,
        login: inputs[4].value,
        password: inputs[5].value
    }
    fetch('/?action=register',{
        method: 'POST',
        headers: {
            'Content-Type': 'application/json;charset=utf-8'
        },
        body: JSON.stringify(thisUser)
    })
    .then(
        function (response){
            response.json().then(function(response){
                if(response.status == 'error'){
                    switch(response.code){
                        case 0:{
                            register_title.innerText = 'Ошибка в фамилии или фамилия не введена';
                            inputs[0].classList.add('modal-input_error');
                            break;
                        }
                        case 1:{
                            register_title.innerText = 'Ошибка в имени или имя не введено';
                            inputs[1].classList.add('modal-input_error');
                            break;
                        }
                        case 2:{
                            register_title.innerText = 'Ошибка в номере или номер не введен';
                            inputs[2].classList.add('modal-input_error');
                            break;
                        }
                        case 3:{
                            register_title.innerText = 'Ошибка в дате рождения или дата рождения не введена';
                            inputs[3].classList.add('modal-input_error');
                            break;
                        }
                        case 4:{
                            register_title.innerText = 'Логин уже существует. Придумайте новый или войдите';
                            inputs[4].classList.add('modal-input_error');
                            break;
                        }
                        case 5:{
                            register_title.innerText = 'Номер уже используется';
                            inputs[2].classList.add('modal-input_error');
                            break;
                        }
                        case 6:{
                            register_title.innerText = 'Введите пароль';
                            inputs[5].classList.add('modal-input_error');
                            break;
                        }
                        case 7:{
                            register_title.innerText = 'Введите Логин';
                            inputs[4].classList.add('modal-input_error');
                            break;
                        }
                    }
                }
                else{
                    //Доделать перенаправление
                    if(action_before == 'account'){window.location.href = '/account'}
                    if(action_before == 'book'){bookButton.click()}
                }
            })
        }
    )
})
loginButton.addEventListener('click', function(){
    let errors = document.getElementsByClassName('modal-input_error');
    for(let i = 0; i < errors.length; i++){
        errors[i].classList.remove('modal-input_error');
    }
    let inputs = this.parentNode.getElementsByTagName('input');
    let thisUser = {
        login: inputs[0].value,
        password: inputs[1].value
    }
    fetch('/?action=login',{
        method: 'POST',
        headers: {
            'Content-Type': 'application/json;charset=utf-8'
        },
        body: JSON.stringify(thisUser)
    })
    .then(
        function (response){
            if (response.redirected) {
                console.log('ads')
                window.location.href = response.url;
            }
            response.json().then(function(response){
                if(response.status == 'error'){
                    switch(response.code){
                        case 0:{
                            login_title.innerText = 'Введите логин';
                            inputs[0].classList.add('modal-input_error');
                            break;
                        }
                        case 1:{
                            login_title.innerText = 'Введите пароль';
                            inputs[1].classList.add('modal-input_error');
                            break;
                        }
                        case 2:{
                            login_title.innerText = 'Неверный логин или пароль';
                            inputs[0].classList.add('modal-input_error');
                            inputs[1].classList.add('modal-input_error');
                            break;
                        }
                    }
                }
                else{
                    //Доделать перенаправление
                    if(action_before == 'account'){window.location.href = '/account'}
                    if(action_before == 'booking'){
                        document.getElementsByClassName('modal_shown')[0].classList.remove('modal_shown');
                        modalBooking.classList.add('modal_shown');
                    }
                }
            })
        }
    )
})