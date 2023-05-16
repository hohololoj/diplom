const openDates_button = document.getElementsByClassName('open-dates-button')[0];
const dateSelector_body = document.getElementsByClassName('date-selector')[0];

openDates_button.addEventListener('click', function(){
    console.log(document.getElementsByClassName('date-selector_opened'))
    if(document.getElementsByClassName('date-selector_opened')[0] == undefined){
        dateSelector_body.classList.add('date-selector_opened')
    }
    else{
        dateSelector_body.classList.remove('date-selector_opened')
    }
})