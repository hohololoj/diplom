const dishes_containers = document.getElementsByClassName('dishes-container');
const menuNavItems = document.getElementsByClassName('section-menu-nav-item-container');

for(let i = 0; i < menuNavItems.length; i++){
    menuNavItems[i].addEventListener('click', function(){
        let category = this.getAttribute('category');
        changeActiveMenuCategory(category);
    })
}
function changeActiveMenuCategory(category){
    let currentActive = document.getElementsByClassName('dishes-container_active')[0];
    currentActive.classList.remove('dishes-container_active');
    document.getElementsByClassName(`dishes-container_${category}`)[0].classList.add('dishes-container_active');
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
                        <div class="section-menu-body-item">
                            <img src="../${dishes[thisContainer_category][j].img_path.slice(8)}" alt="img" class="section-menu-body-item-img">
                            <input type="text" class="section-menu-body-item-input section-menu-body-item-input_name" value='${dishes[thisContainer_category][j].name}' readonly>
                            <div class="price-container">
                                <p class="price-title">Стоимость, руб: </p>
                                <input type="number" max="1000" class="section-menu-body-item-input section-menu-body-item-input_price" value="${dishes[thisContainer_category][j].price}" readonly>
                            </div>
                        </div>
                        `
                    }
                    dishes_containers[i].innerHTML = html
                }
            })
        }
    )
}
function checkDirectLink(){
    let link = window.location.hash;
    if(link != ''){
        let className = `dishes-container_${link.replace(/#/, '')}`;
        document.getElementsByClassName('dishes-container_active')[0].classList.remove('dishes-container_active');
        document.getElementsByClassName(className)[0].classList.add('dishes-container_active');
    }
}
getDishes();
checkDirectLink()