const inputs = document.getElementsByTagName('input');
const changeData_button = document.getElementsByClassName('change-button')[0];

inputs[2].addEventListener('input', function(){
    let value = this.value;
    value = value.replace(/\+7/, '8');
    value = value.replace(/ /, '');
    this.value = value;
})

changeData_button.addEventListener('click', function(){
    let errors = document.getElementsByClassName('account-settings-input_error');
    for(let i = 0; i < errors.length; i++){
        errors[i].classList.remove('account-settings-input_error');
    }
    let newData = {
        name: inputs[1].value,
        surname: inputs[0].value,
        phone: inputs[2].value,
    }
    fetch('/?action=changeUserData',{
        method: 'POST',
        headers: {
            'Content-Type': 'application/json;charset=utf-8'
        },
        body: JSON.stringify(newData)
    })
    .then(
        function (response){
            response.json().then(function(response){
                if(response.status == 'error'){
                    switch(response.code){
                        case 0:{
                            inputs[0].classList.add('account-settings-input_error');
                            alert('Ошибка в фамилии или фамилия не введена');
                            break;
                        }
                        case 1:{
                            inputs[1].classList.add('account-settings-input_error');
                            alert('Ошибка в имени или имя не введено');
                            break;
                        }
                        case 2:{
                            inputs[2].classList.add('account-settings-input_error');
                            alert('Ошибка в телефоне или телефон не введен');
                            break;
                        }
                    }
                }
                else{
                    alert('Новые данные были отправлены, наш работник проверит их и вынесет решение');
                    window.location.href = '/';
                }
            })
        }
    )
})

fetch('/?action=getUserInfo',{
    method: 'POST',
})
.then(
    function (response){
        response.json().then(function(data){
            inputs[0].value = data.surname;
            inputs[1].value = data.name;
            inputs[2].value = data.phone;
        })
    }
)