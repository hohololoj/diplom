function initDropDownEvents(){
    const dropdown_buttons = document.getElementsByClassName('news-dropdown-button');
    for (let i = 0; i < dropdown_buttons.length; i++) {
        dropdown_buttons[i].addEventListener('click', function () {
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
}
function changeState(state, el) {
    el.setAttribute('state', state);
}