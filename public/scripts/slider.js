const sliderLine = document.getElementsByClassName('slider-line')[0];
const slideLeft_button = document.getElementsByClassName('slide-left-button')[0];
const slideRight_button = document.getElementsByClassName('slide-right-button')[0];

let currentPos = 0;

function slide(){
    sliderLine.style.top = `${currentPos*-100}%`;
}

slideRight_button.addEventListener('click', function(){
    currentPos++;
    if(currentPos > 4){
        window.location.href = '/fullnews';
    }
    else{
        slide();
    }
})
slideLeft_button.addEventListener('click', function(){
    currentPos--;
    if(currentPos < 0){
        currentPos = 0;
    }
    else{
        slide();
    }
})
function getNews(){
    fetch('/?action=getNews',{
        method: 'POST',
    })
    .then(
        function (response){
            response.json().then(function(news){
                let html = '';
                for(let i = 0; i < 4; i++){
                    html += `
                    <div class="slide" style="background: url('./${news[i].img_path}'); backbground-size: cover; background-position: center;">
                        <h3 class="slide-title">${news[i].title}</h3>
                        <p class="slide-content">${news[i].content}</p>
                    </div>
                    `
                }
                html+=`<div class="slide slide_final"><h3 class="slide-title">Нажмите еще раз чтобы посмотреть все новости</h3></div>`;
                sliderLine.innerHTML = html;
            })
        }
    )
}
getNews()