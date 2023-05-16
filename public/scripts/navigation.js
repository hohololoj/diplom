const menuNavigation_buttons = document.getElementsByClassName('menu-button');

for(let i = 0; i < menuNavigation_buttons.length; i++){
    menuNavigation_buttons[i].addEventListener('click', function(){
        let link = `./menu#${menuNavigation_buttons[i].getAttribute('link')}`;
        window.location.href = link;
    })
}