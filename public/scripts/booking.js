const bookButton = document.getElementsByClassName('book-table-button')[0];
const modalBooking = document.getElementsByClassName('modal-booking')[0];
const searchButton = document.getElementsByClassName('search-table-button')[0];

searchButton.addEventListener

bookButton.addEventListener('click', function(){
    fetch('/?action=checkToken',{
        method: 'POST',
    })
    .then(
        function (response){
            response.json().then(function(token){
                if(token.exists){
                    modalBooking.classList.add('modal_shown');
                }
                else{
                    action_before = 'booking'
                    modalWindow_login.classList.add('modal_shown');
                }
            })
        }
    )
})