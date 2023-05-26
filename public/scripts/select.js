const selectInputs = document.getElementsByClassName('input-select-body-item');
const selects = document.getElementsByClassName('input-select-container');
const searchTable_button = document.getElementsByClassName('search-table-button')[0];
const inputDate = document.getElementsByClassName('select-input-element-date')[0];
const inputTime = document.getElementsByClassName('select-input-element-time')[0];
const inputDate_input = document.getElementsByClassName('table-input-date')[0];
const book_title = document.getElementsByClassName('modal-content-title_booking')[0];
const modalBookingSuccess = document.getElementsByClassName('modal-content-booking_success')[0];
const bookingTable_number = document.getElementsByClassName('booking-table-number')[0];
const bookingTable_time = document.getElementsByClassName('booking-table-time')[0];
const bookingTable_day = document.getElementsByClassName('booking-table-day')[0];
const modalBookingNoFree = document.getElementsByClassName('modal-content-booking_nofree')[0];
const bookingOkButtons = document.getElementsByClassName('booking-button-ok');

for(let i = 0; i < bookingOkButtons.length; i++){
    bookingOkButtons[i].addEventListener('click', function(){
        document.getElementsByClassName('modal-content-booking_shown')[0].classList.remove('modal-content-booking_shown');
        document.getElementsByClassName('modal-content-booking')[0].classList.add('modal-content-booking_shown');
    })
}

searchTable_button.addEventListener('click', function(){
    let date = inputDate.value;
    let day = '';
    let month = '';
    let year = '';
    if(date == ''){
        console.log('кастом')
        date = inputDate_input.value;
        console.log(inputDate_input.value)
        let dates = date.split('-');
        year = dates[0];
        month = dates[1];
        day = dates[2];
    }
    if(date == 'today'){
        console.log('сегодня')

        let today = new Date();
        day = today.getDate();
        if(day < 10){day = '0'+day}
        month = today.getMonth()+1;
        if(month < 10){month = '0'+month}
        year = today.getFullYear();
        console.log(day, month, year);
    }
    if(date == 'tomorrow'){
        console.log('завтра')

        let tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate()+1);
        day = tomorrow.getDate();
        if(day < 10){day = '0'+day}
        month = tomorrow.getMonth()+1;
        if(month < 10){month = '0'+month}
        year = tomorrow.getFullYear();
        console.log(day, month, year);
    }
    let time = inputTime.value;
    let req = {
        date: {
            day: day,
            month: month,
            year: year
        },
        time: time
    }
    console.log(req)
    console.log(1)
    fetch('/?action=bookTable',{
        method: 'POST',
        headers: {
            'Content-Type': 'application/json;charset=utf-8'
        },
        body: JSON.stringify(req)
    })
    .then(
        function (response){
            response.json().then(function(response){
                if(response.status == 'error'){
                    switch(response.code){
                        case 0:{
                            book_title.innerText = 'Некорректная дата';
                            break;
                        }
                        case 1:{
                            book_title.innerText = 'Пожалуйста, заполните поля';
                            break;
                        }
                        case 2:{
                            document.getElementsByClassName('modal-content-booking_shown')[0].classList.remove('modal-content-booking_shown');
                            modalBookingNoFree.classList.add('modal-content-booking_shown');
                            break;
                        }
                        case 3:{
                            book_title.innerText = 'Выбранное вами время уже прошло';
                            break;
                        }
                    }
                }
                else{
                    let current = document.getElementsByClassName('modal-content-booking_shown')[0];
                    current.classList.remove('modal-content-booking_shown');
                    modalBookingSuccess.classList.add('modal-content-booking_shown');
                    console.log(response)
                    bookingTable_number.innerText = response.table;
                    bookingTable_time.innerText = response.time;
                    bookingTable_day.innerText = response.day;
                }
            })
        }
    )
})

for(let i = 0; i < selects.length; i++){
    selects[i].addEventListener('click', function(){
        this.classList.add('input-select-container_opened');
    })
}

for(let i = 0; i < selectInputs.length; i++){
    selectInputs[i].addEventListener('click', function(e){
        e.stopPropagation();
        let value = this.innerText;
        let thisSelect = this.parentNode.parentNode;
        let thisSelect_head = thisSelect.getElementsByClassName('input-select-head')[0];
        let thisSelect_title = thisSelect_head.getElementsByClassName('input-select-title')[0];
        thisSelect_title.innerText = value;
        thisSelect.classList.remove('input-select-container_opened');
        let type = this.getAttribute('type');
        if(type == 'date'){
            let val = this.getAttribute('val');
            if(val != 'select'){
                inputDate.value = val;
            }
            else{
                inputDate_input.classList.add('table-input-date_shown');
                inputDate.value = '';
            }
        }
        if(type == 'time'){
            let val = this.getAttribute('val');
            inputTime.value = val;
        }
    })
}